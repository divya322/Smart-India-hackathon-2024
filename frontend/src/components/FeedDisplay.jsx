import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Container, Box, Typography } from "@mui/material";
import { AiOutlinePlayCircle, AiOutlineFastBackward, AiOutlineFastForward, AiFillStepForward, AiFillStepBackward } from 'react-icons/ai';
import useMediaQuery from '@mui/material/useMediaQuery';

// import video from '../assets/swayam_video.mp4';

const FeedDisplay = ({ feedId }) => {
  const videoRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoSrc, setVideoSrc] = useState("");

  useEffect(() => {
    const socket = io('http://127.0.0.1:5000');

    // Subscribe to a specific CCTV feed
    // socket.emit('subscribeFeed', { feedId });

    // Listen for video frames for the subscribed feed
    // socket.on('frame', (frameData, receivedFeedId) => {
    //   if (receivedFeedId === feedId && videoRef.current) {
    //     videoRef.current.src = `data:image/jpeg;base64, ${frameData}`;
    //     if (!isPlaying) {
    //       videoRef.current.pause();
    //     }
    //   }
    // }
    
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
  
    socket.on('frame', (frame) => {
      setVideoSrc(`data:image/jpeg;base64,${frame}`);
    });
  
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // return () => {
    //   // Clean up when the component unmounts
    //   socket.emit('unsubscribeFeed', { feedId });
    //   socket.disconnect();
    // };
  }, [videoSrc, isPlaying]); 

  const toggleVideoPlay = () => {
    setIsPlaying(!isPlaying);
    const socket = io('your_websocket_server_url');
    socket.emit('playPauseVideo', { feedId, isPlaying: !isPlaying });
    socket.disconnect();
  };

  const rewindVideo = (rewindType) => {
    const socket = io('your_websocket_server_url');
    if (rewindType === 1) {
      // Rewind by 10 seconds
      socket.emit('rewindVideo', { feedId, seconds: 10 });
    } else {
      // Rewind by 30 frames
      socket.emit('rewindVideo', { feedId, frames: 30 });
    }
    socket.disconnect();
  };

  const fastForwardVideo = (fastForwardType) => {
    const socket = io('your_websocket_server_url');
    if (fastForwardType === 1) {
      // Fast forward by 10 seconds
      socket.emit('fastForwardVideo', { feedId, seconds: 10 });
    } else {
      // Fast forward by 30 frames
      socket.emit('fastForwardVideo', { feedId, frames: 30 });
    }
    socket.disconnect();
  };

  return (
    <Container
      maxWidth="md"
      style={{
        position: 'relative',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%',
        }}
      >
        <img
          width="100%"
          height="100%"
          //controls
          src={videoSrc}
          // ref={videoRef}
          style={{ position: 'absolute', top: 0, left: 0, border: "2px solid black"}}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              maxWidth: '75%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >

            {/* Rewind Buttons */}
            <AiOutlineFastBackward
              style={{
                color: "black",
                fontSize: isMobile ? '2rem' : '3rem',
                marginRight: '16px',
                cursor: 'pointer',
              }}
              onClick={() => rewindVideo(0)}
            />
            <AiFillStepBackward
              style={{
                color: "black",
                fontSize: isMobile ? '2rem' : '3rem',
                marginRight: '16px',
                cursor: 'pointer',
              }}
              onClick={() => rewindVideo(1)}
            />

            {/* Play Button */}
            <AiOutlinePlayCircle
              style={{
                color: "black",
                fontSize: isMobile ? '2rem' : '3rem',
                marginRight: '16px',
                cursor: 'pointer',
              }}
              onClick={toggleVideoPlay}
            />

            {/* Forward Buttons */}
            <AiFillStepForward
              style={{
                color: "black",
                fontSize: isMobile ? '2rem' : '3rem',
                marginRight: '16px',
                cursor: 'pointer',
              }}
              onClick={() => fastForwardVideo(1)}
            />

            <AiOutlineFastForward
              style={{
                color: "black",
                fontSize: isMobile ? '2rem' : '3rem',
                cursor: 'pointer',
              }}
              onClick={() => fastForwardVideo(0)}
            />
          </div>
        </div>
      </Box>
      <Typography variant="h2" sx={{color: "black",}}>Feed {feedId}</Typography>
    </Container>
  );
};

export default FeedDisplay;
