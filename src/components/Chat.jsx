import { useEffect, useRef } from 'react';
import VideoFeed from './VideoFeed';
import useChat from '../hooks/useChatClient';

const Chat = () => {
  const { loading, mySocket, myStream, peersStreams } = useChat();

  const myStreamRef = useRef();

  useEffect(() => {
    const setOwnStream = () => {
      myStreamRef.current.srcObject = myStream;
    };
    !loading && myStream && setOwnStream();
  }, [loading, myStream]);

  return loading ? (
    <div>Loading chat...</div>
  ) : (
    <>
      <h1>Chat</h1>
      <h4>My Socket ID: {mySocket?.id}</h4>
      <video ref={myStreamRef} autoPlay muted width={300}></video>
      {peersStreams.map(stream => (
        <VideoFeed key={stream.socketID} peer={stream} />
      ))}
    </>
  );
};

export default Chat;
