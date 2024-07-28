import React, { useState } from "react";
import { Box } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import LoginPage from "./pages/LoginPage";
import TitleBox from "./components/TitleBox";
import MainLayout from "./layouts/MainLayout";
import CameraDisplay from "./pages/CameraDisplay";
import FeedDisplay from "./components/FeedDisplay";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <MainLayout loggedIn={isLoggedIn}>
      {isLoggedIn ? (
        <CameraDisplay/>
      ) : (
        <Box
          sx={{
            width: {
              sm: "90vw",
              xs: "90vw",
              md: "60vw",
              lg: "60vw",
              xl: "60vw",
            },
          }}
        >
          {/* GRID SYSTEM */}
          <Grid container height="90vh">
            <LoginPage onLoginSuccess={handleLoginSuccess} />
            <TitleBox />
          </Grid>
          {/* GRID SYSTEM END */}
        </Box>
      )}
    </MainLayout>
  );
};

export default App;
