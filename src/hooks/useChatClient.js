import { useEffect, useRef, useState } from 'react';
import { Peer } from 'peerjs';
import { useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';

const useChat = () => {
  const socketRef = useRef(socketIOClient('http://localhost:8000'));
  const peerRef = useRef();
  const [myStream, setMyStream] = useState(null);
  const [peersStreams, setPeersStreams] = useState([]);
  const [listOfSpeakers, setListOfSpeakers] = useState([]);
  const { roomId } = useParams();

  useEffect(() => {
    const init = async () => {
      try {
        // Await media stream
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        // Keep media stream in state for future streaming
        setMyStream(mediaStream);
        // Socket client event listenters
        socketRef.current.on('user-connected', ({ socketID, peerID }) => {
          console.log(`User with SocketID: ${socketID} and PeerID: ${peerID} joined`);
          setListOfSpeakers(prev => [...prev, { socketID, peerID }]);
        });
        socketRef.current.on('user-disconnected', ({ socketID, peerID }) => {
          setPeersStreams(prev =>
            prev.filter(peer => {
              return peer.socketID !== socketID;
            })
          );
          setListOfSpeakers(prev =>
            prev.filter(peer => {
              return peer.socketID !== socketID;
            })
          );
          console.log(`User with SocketID: ${socketID} and PeerID: ${peerID} disconnected`);
        });
        // Keep instance of Peer in ref to ensure single instance even after re-renders
        peerRef.current = new Peer(undefined, {
          host: '/localhost', // root host
          port: '8080'
        });
        // Peer instance event listenters
        peerRef.current.on('open', id => {
          socketRef.current.emit('join-chatroom', { roomId, peerID: id });
          socketRef.current.emit('ready', { roomId, peerID: id });
          console.log(`I just joined with SocketID: ${socketRef.current.id} and PeerID: ${id}`);
        });
        peerRef.current.on('call', call => {
          console.log(`Existing participants call me`);
          call.answer(mediaStream);
          const socketID = call.metadata.callee;
          call.on('stream', userVideoStream => {
            setPeersStreams(prev => {
              if (!prev.length) return [{ socketID, userVideoStream }];
              const found = prev.find(peer => peer.socketID === socketID);
              if (found) {
                found.userVideoStream = userVideoStream;
                return prev;
              } else {
                return [...prev, { socketID, userVideoStream }];
              }
            });
            console.log(`Received stream from user with SocketID: ${socketID} and PeerID: ${userVideoStream.id} `);
          });
        });
      } catch (error) {
        console.error(error);
      }
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      peerRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const connectToNewUser = (userId, socketID, stream) => {
      const options = { metadata: { callee: socketRef.current.id } };
      const call = peerRef.current.call(userId, stream, options);
      console.log(`I am calling an user that just joined`);

      call.on('stream', userVideoStream => {
        setPeersStreams(prev => {
          if (!prev.length) return [{ socketID, userVideoStream }];
          const found = prev.find(peer => peer.socketID === socketID);
          if (found) {
            found.userVideoStream = userVideoStream;
            return prev;
          } else {
            return [...prev, { socketID, userVideoStream }];
          }
        });
        console.log(`Received stream from user with SocketID: ${socketID} and PeerID: ${userVideoStream.id} `);
      });
    };

    listOfSpeakers.forEach(({ peerID, socketID }) => connectToNewUser(peerID, socketID, myStream));
  }, [listOfSpeakers]);

  return { socketRef, mySocket: socketRef.current, peerRef, myStream, peersStreams };
};

export default useChat;
