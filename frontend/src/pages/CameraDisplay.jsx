import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import FeedDisplay from "../components/FeedDisplay";
import { TfiLayoutWidthFull } from 'react-icons/tfi'
import { BsLayoutSplit } from 'react-icons/bs';
import { RiLayoutGridFill } from 'react-icons/ri';

function CameraDisplay() {
  const [feeds, setFeeds] = useState([]);
  const [displaySettings, setDisplaySettings] = useState({
    columnCount: 1,
  });

  useEffect(() => {
    const sampleFeedData = [
      { id: 1, name: "feed1" },
      // { id: 2, name: "feed2" },
    ];

    setFeeds(sampleFeedData);
  }, []);

  const handleColumnChange = (newColumnCount) => {
    setDisplaySettings({
      columnCount: newColumnCount,
    });
  };

  const feedDisplays = [];
  for (let i = 1; i <= displaySettings.columnCount; i++) {
    feedDisplays.push(<FeedDisplay key={i} feedId={i} style={{ position: "relative" }} />);
  }

  return (
    <div style={{ display: "flex" }}>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", color: "white", left: "2%", top: "40%", alignItems: "space-between", fontSize: "2rem" }}>
        <TfiLayoutWidthFull
          color="black"
          style={{ cursor: "pointer" }}
          onClick={() => handleColumnChange(1)}
        />
        <BsLayoutSplit
          color="black"
          style={{ cursor: "pointer" }}
          onClick={() => handleColumnChange(2)}
        />
        <RiLayoutGridFill
          color="black"
          style={{ cursor: "pointer" }}
          onClick={() => handleColumnChange(4)}
        />
      </div>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: displaySettings.columnCount >= 4
            ? "1fr 1fr"
            : `repeat(auto-fit, minmax(0, 1fr))`,
          width: "90vw",
          height: displaySettings.columnCount >= 4 ? "80vh" : "100vh",
          gap: "2px",
          overflow: "auto",
        }}
      >
        {feedDisplays}
      </Box>
     </div>
  );
}

export default CameraDisplay;
