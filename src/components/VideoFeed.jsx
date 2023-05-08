import { useRef, useEffect } from 'react';

const VideoFeed = ({ peer }) => {
  const videoref = useRef();

  useEffect(() => {
    const setFeed = () => {
      videoref.current.srcObject = peer.userVideoStream;
    };
    peer && setFeed();
  }, [peer]);

  return (
    <>
      <h4>Peer Socket ID: {peer.socketID}</h4>
      <video ref={videoref} muted autoPlay width={300} />
    </>
  );
};

export default VideoFeed;
