import React, { useState } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  InputBase,
  Paper,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { colors } from "../theme";

const CustomInput = ({ type, email, label, placeholder }) => {
  const [passwordVisible, setPasswordVisible] = useState(type === "text");
  const [inputType, setInputType] = useState(email ? "email" : type || "text");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setInputType(passwordVisible ? "password" : "text");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignContent="center"
      justifyContent="flex-start"
      mb={2}
    >
      <Box display="flex" flexDirection="column" justifyContent="flex-start">
        <Typography color="white" pb={1}>
          {label}
        </Typography>
        <Paper
          sx={{
            background: colors.input[500],
            width: "100%",
          }}
        >
          <InputBase
            placeholder={placeholder}
            fullWidth
            type={inputType}
            sx={{
              bgcolor: colors.input[500],
              p: 1,
              borderRadius: "5px",
            }}
            endAdornment={
              type === "password" && (
                <InputAdornment position="end" sx={{ pr: 1 }}>
                  <IconButton edge="end" onClick={togglePasswordVisibility}>
                    {passwordVisible ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default CustomInput;
