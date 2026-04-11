import { useEffect, useRef } from 'react';

interface RemoteVideoProps {
  stream: MediaStream | null;
  isAvatarCover?: boolean;
}

const RemoteVideo = ({ stream, isAvatarCover }: RemoteVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: isAvatarCover ? 'cover' : 'contain',
        backgroundColor: '#000',
        borderRadius: isAvatarCover ? 'inherit' : '0'
      }}
    />
  );
};

export default RemoteVideo;
