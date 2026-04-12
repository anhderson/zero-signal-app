import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { supabase } from '../lib/supabase';


export const useWebRTC = (channelId: string | null, additionalStream: MediaStream | null = null, microphoneId: string | null = null) => {
  const { currentUser, voiceParticipants, setSpeaking, pushToTalk, isPTTPressed } = useAppStore();
  
  const me = voiceParticipants.find(p => p.id === currentUser?.id);
  const isMuted = me?.isMuted || false;

  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, { pc: RTCPeerConnection; senders: Record<string, RTCRtpSender> }>>({});
  const signalingRef = useRef<any>(null);

  // 0. Get Devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(d => d.kind === 'audioinput');
        setMicrophones(mics);
      } catch (err) {}
    };
    getDevices();
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', getDevices);
  }, []);

  // 1. Get Local Stream (Audio)
  useEffect(() => {
    if (!channelId || !currentUser) return;

    const startLocalStream = async () => {
      try {
        // Stop previous tracks if changing microphone
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(t => t.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: microphoneId ? { 
                deviceId: { exact: microphoneId },
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } : {
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

        // Update tracks for all existing peers
        Object.values(peersRef.current).forEach(({ pc, senders }) => {
          stream.getAudioTracks().forEach(track => {
            if (senders['audio']) {
              senders['audio'].replaceTrack(track);
            } else {
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
  }, [channelId, currentUser, setSpeaking, microphoneId]);

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

  const pendingCandidates = useRef<Record<string, RTCIceCandidateInit[]>>({});

  const createPeerConnection = (userId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
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

    return pc;
  };

  const processPendingCandidates = async (userId: string) => {
    const peer = peersRef.current[userId];
    if (peer && peer.pc.remoteDescription) {
      const cands = pendingCandidates.current[userId] || [];
      for (const cand of cands) {
        try {
          await peer.pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch(e) {}
      }
      pendingCandidates.current[userId] = [];
    }
  };

  const handleOffer = async (userId: string, offer: RTCSessionDescriptionInit) => {
    let peer = peersRef.current[userId];
    if (!peer) {
      createPeerConnection(userId, false);
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
    processPendingCandidates(userId);
  };

  const handleAnswer = async (userId: string, answer: RTCSessionDescriptionInit) => {
    const peer = peersRef.current[userId];
    if (peer) {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
      processPendingCandidates(userId);
    }
  };

  const handleCandidate = async (userId: string, candidate: RTCIceCandidateInit) => {
    const peer = peersRef.current[userId];
    if (peer && peer.pc.remoteDescription && peer.pc.remoteDescription.type) {
      try {
        await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch(e) {}
    } else {
      if (!pendingCandidates.current[userId]) pendingCandidates.current[userId] = [];
      pendingCandidates.current[userId].push(candidate);
    }
  };

  return { remoteStreams, microphones };
};
