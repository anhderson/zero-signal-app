import React, { useEffect, useRef } from 'react';

interface RemoteAudioProps {
  stream: MediaStream;
  volume: number;
}

const RemoteAudio: React.FC<RemoteAudioProps> = ({ stream, volume }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
      audioRef.current.muted = false;
      audioRef.current.play().catch(err => {
        console.warn("Autoplay was prevented or audio track failed:", err);
      });
    }
  }, [stream]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return <audio ref={audioRef} autoPlay />;
};

export default RemoteAudio;
