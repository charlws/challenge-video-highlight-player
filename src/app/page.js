'use client';

import React, { useRef, useState } from "react";
import Head from "next/head";

import { Box, Grid2, Tab, Tabs, TextField, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CloudUpload } from '@mui/icons-material';

import ReactPlayer from 'react-player';

export default function Home() {
  const theme = createTheme({
    components: {
      MuiTabs: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid #888888',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: '#ffffff',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: '#ffffff',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            color: '#ffffff',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: '#ffffff',
          },
          root: {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#aaaaaa',
            },
          },
        },
      },
    },
  });

  const [tab, setTab] = useState("upload");

  const [videoDragging, setVideoDragging] = useState(false);
  const [videoDNDLabel, setVideoDNDLabel] = useState("Drag video here to upload");
  const videoDNDRef = useRef(null);

  const [highlighJson, setHighlighJson] = useState("");

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragging(true);
    setVideoDNDLabel("Drop video to upload");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoDNDRef.current && videoDNDRef.current.contains(e.relatedTarget)) return;
    setVideoDragging(false);
    setVideoDNDLabel("Drag video here to upload");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragging(false);
    setVideoDNDLabel("Drag video here to upload");

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const videoFile = files[0];
      uploadVideo(videoFile);
    }
  };

  const uploadVideo = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Video Player with Highlights</title>
      </Head>
      <div style={{ width: "100%", position: "absolute", top: "50%", transform: "translateY(-50%)", padding: "40px" }}>
        <Grid2 container spacing={3}>
          <Grid2 item size={{ xs: 12, md: 8 }}>
            <ReactPlayer
              url="/api/video"
              width="100%"
              height="100%"
              controls
            />
          </Grid2>
          <Grid2 item size={{ xs: 12, md: 4 }}>
            <Tabs value={tab} onChange={(event, newValue) => { setTab(newValue); }}>
              <Tab label="Upload" value="upload" />
              <Tab label="Highlights" value="highlights" />
            </Tabs>

            {tab === "upload" && (<Box sx={{ mt: "16px" }}>
              <Box
                ref={videoDNDRef}
                sx={{
                  width: "100%",
                  height: "200px",
                  backgroundColor: videoDragging ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.3)",
                  border: "2px dashed #000",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "20px",
                  boxSizing: "border-box",
                }}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDragExit={handleDragLeave}
                onDrop={handleDrop}
              >
                <CloudUpload sx={{ fontSize: 40, marginBottom: 2 }} />
                <Typography variant="h6">{videoDNDLabel}</Typography>
              </Box>
            </Box>)}

            {tab === "highlights" && (<Box sx={{ mt: "16px" }}>
              <TextField
                label="Highlights JSON"
                multiline
                rows={10}
                value={highlighJson}
                onChange={(e) => setHighlighJson(e.target.value)}
                fullWidth
              />
            </Box>)}
          </Grid2>
        </Grid2>
      </div>
    </ThemeProvider>
  );
}