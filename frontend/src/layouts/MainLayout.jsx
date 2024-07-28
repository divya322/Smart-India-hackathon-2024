import React from "react";
import { Box, ThemeProvider } from "@mui/material";
import { theme } from "../theme";

const bgImage = require("../assets/bg.png");

const MainLayout = ({ children, loggedIn}) => {
  const backgroundStyle = loggedIn
    ? { backgroundColor: "white" }
    : {
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          ...backgroundStyle,
          overflow: "hidden",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: loggedIn ? "white" : "transparent",
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;
