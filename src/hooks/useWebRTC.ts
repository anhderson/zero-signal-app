import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { supabase } from '../lib/supabase';

interface PeerConnection {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
}

export const useWebRTC = (channelId: string | null, additionalStream: MediaStream | null = null) => {
  const { currentUser, voiceParticipants, setSpeaking, pushToTalk, isPTTPressed } = useAppStore();
  
  const me = voiceParticipants.find(p => p.id === currentUser?.id);
  const isMuted = me?.isMuted || false;

  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, { pc: RTCPeerConnection; senders: Record<string, RTCRtpSender> }>>({});
  const signalingRef = useRef<any>(null);

  // 1. Get Local Stream (Audio)
  useEffect(() => {
    if (!channelId || !currentUser) return;

    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }, 
            video: false 
        });
        localStreamRef.current = stream;
        
        // Setup simple voice activity detection
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let lastSpeaking = false;

        const checkSpeaking = () => {
          if (!localStreamRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const isSpeaking = volume > 20;

          if (isSpeaking !== lastSpeaking) {
            setSpeaking(currentUser.id, isSpeaking);
            lastSpeaking = isSpeaking;
          }
          requestAnimationFrame(checkSpeaking);
        };
        checkSpeaking();

        // Add audio track to all existing peers
        Object.values(peersRef.current).forEach(({ pc, senders }) => {
          stream.getAudioTracks().forEach(track => {
            if (!senders['audio']) {
              senders['audio'] = pc.addTrack(track, stream);
            }
          });
        });

      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    startLocalStream();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [channelId, currentUser, setSpeaking]);

  // 1.1 Handle Additional Stream (Video/Screen)
  useEffect(() => {
    const videoTrack = additionalStream?.getVideoTracks()[0];
    if (!videoTrack) {
      // Remove video tracks from all peers
      Object.values(peersRef.current).forEach(({ pc, senders }) => {
        if (senders['video']) {
          pc.removeTrack(senders['video']);
          delete senders['video'];
        }
      });
      return;
    }

    Object.values(peersRef.current).forEach(({ pc, senders }) => {
      if (senders['video']) {
        senders['video'].replaceTrack(videoTrack);
      } else {
        senders['video'] = pc.addTrack(videoTrack, additionalStream);
      }
    });

  }, [additionalStream]);

  // 1.2 Handle Audio Track Enabled (Mute/PTT)
  useEffect(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        if (pushToTalk) {
          audioTrack.enabled = !isMuted && isPTTPressed;
        } else {
          audioTrack.enabled = !isMuted;
        }
      }
    }
  }, [isMuted, pushToTalk, isPTTPressed]);

  // 2. Signaling Setup
  useEffect(() => {
    if (!channelId || !currentUser) return;

    const signaling = supabase.channel(`signaling:${channelId}`, {
      config: { broadcast: { self: false } }
    });

    signaling
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        const { from, to, signal } = payload;
        if (to !== currentUser.id) return;

        if (signal.type === 'offer') {
          handleOffer(from, signal);
        } else if (signal.type === 'answer') {
          handleAnswer(from, signal);
        } else if (signal.type === 'candidate') {
          handleCandidate(from, signal.candidate);
        }
      })
      .subscribe();

    signalingRef.current = signaling;

    return () => {
      signaling.unsubscribe();
      Object.values(peersRef.current).forEach(({ pc }) => pc.close());
      peersRef.current = {};
      setRemoteStreams({});
    };
  }, [channelId, currentUser]);

  // 3. Peer Management
  useEffect(() => {
    if (!channelId || !currentUser) return;

    const otherParticipants = voiceParticipants.filter(p => p.channelId === channelId && p.id !== currentUser.id);
    
    otherParticipants.forEach(p => {
      if (!peersRef.current[p.id]) {
        const isInitiator = currentUser.id > p.id;
        createPeerConnection(p.id, isInitiator);
      }
    });

    Object.keys(peersRef.current).forEach(id => {
      if (!otherParticipants.find(p => p.id === id)) {
        peersRef.current[id].pc.close();
        delete peersRef.current[id];
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    });
  }, [voiceParticipants, channelId, currentUser]);

  const createPeerConnection = (userId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    const senders: Record<string, RTCRtpSender> = {};

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalingRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: { from: currentUser?.id, to: userId, signal: { type: 'candidate', candidate: event.candidate } }
        });
      }
    };

    pc.onnegotiationneeded = async () => {
      if (isInitiator) {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          signalingRef.current?.send({
            type: 'broadcast',
            event: 'signal',
            payload: { from: currentUser?.id, to: userId, signal: offer }
          });
        } catch (err) {
          console.error("Negotiation error:", err);
        }
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({ ...prev, [userId]: event.streams[0] }));
    };

    // Add existing tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        senders[track.kind] = pc.addTrack(track, localStreamRef.current!);
      });
    }

    if (additionalStream) {
      additionalStream.getTracks().forEach(track => {
        senders[track.kind] = pc.addTrack(track, additionalStream);
      });
    }

    peersRef.current[userId] = { pc, senders };

    if (isInitiator) {
      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        signalingRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: { from: currentUser?.id, to: userId, signal: offer }
        });
      });
    }

    return pc;
  };

  const handleOffer = async (userId: string, offer: RTCSessionDescriptionInit) => {
    let peer = peersRef.current[userId];
    if (!peer) {
      const pc = createPeerConnection(userId, false);
      peer = peersRef.current[userId];
    }
    await peer.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.pc.createAnswer();
    await peer.pc.setLocalDescription(answer);
    signalingRef.current?.send({
      type: 'broadcast',
      event: 'signal',
      payload: { from: currentUser?.id, to: userId, signal: answer }
    });
  };

  const handleAnswer = async (userId: string, answer: RTCSessionDescriptionInit) => {
    const peer = peersRef.current[userId];
    if (peer) {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleCandidate = async (userId: string, candidate: RTCIceCandidateInit) => {
    const peer = peersRef.current[userId];
    if (peer && peer.pc.remoteDescription) {
      await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  return { remoteStreams };
};
