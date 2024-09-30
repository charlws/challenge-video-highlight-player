'use client';

import React, { useRef, useState, useEffect } from "react";
import Head from "next/head";
import { Box, Grid2, IconButton, Tab, Tabs, TextField, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CloudUpload, PauseCircle, PlayCircle } from '@mui/icons-material';
import ReactPlayer from 'react-player';

const DEFAULT_HIGHLIGHT = `{
    "events": [
        {
            "timestamp": 2,
            "event": "Great",
            "description": "This is great"
        },
        {
            "timestamp": 8,
            "event": "WOW",
            "description": "Amazing"
        },
        {
            "timestamp": 10,
            "event": "Unbelievable",
            "description": "Crazy"
        }
    ]
}`;

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
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: '#ffffff',
          },
        },
      },
    },
  });

  const [tab, setTab] = useState("upload");
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [highlightJson, setHighlightJson] = useState(DEFAULT_HIGHLIGHT);
  const [highlights, setHighlights] = useState([]);
  const [videoUrl, setVideoUrl] = useState();
  const [isUploading, setIsUploading] = useState(false);

  const [videoDragging, setVideoDragging] = useState(false);
  const [videoDNDLabel, setVideoDNDLabel] = useState("Drag video here to upload");
  const videoDNDRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    setVideoDragging(true);
    setVideoDNDLabel("Drop video to upload");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    if (videoDNDRef.current && videoDNDRef.current.contains(e.relatedTarget)) return;
    setVideoDragging(false);
    setVideoDNDLabel("Drag video here to upload");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
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
      setIsUploading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setPlayed(0);
      setVideoDuration(0);
      setHighlights([]);
      setVideoUrl("/api/video?" + Date.now());
      parseHighlights(highlightJson);

      const result = await response.json();
      console.log("Upload successful:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProgress = (state) => {
    setPlayed(state.played);
  };

  const handleClickProgressBar = (event) => {
    if (playerRef.current) {
      const boundingRect = event.currentTarget.getBoundingClientRect();
      const clickPosition = event.clientX - boundingRect.left;
      const percentage = clickPosition / boundingRect.width;
      const newTime = percentage * videoDuration;
      playerRef.current.seekTo(newTime);
    }
  };

  const handleMouseMoveProgressBar = (event) => {
    if (playerRef.current) {
      const boundingRect = event.currentTarget.getBoundingClientRect();
      const hoverPosition = event.clientX - boundingRect.left;
      const percentage = hoverPosition / boundingRect.width;
      setHoverTime(percentage * videoDuration);
      setHoverPosition(percentage);
    }
  };

  const handleHighlightClick = (timestamp) => {
    playerRef.current.seekTo(timestamp);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const parseHighlights = (json) => {
    try {
      const parsed = JSON.parse(json);
      setHighlights(parsed.events || []);
    } catch (e) {
      console.error("Invalid JSON");
      setHighlights([]);
    }
  };

  useEffect(() => {
    parseHighlights(highlightJson);
  }, [highlightJson]);

  useEffect(() => {
    // set video url clientside
    setVideoUrl("/api/video?" + Date.now());
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Video Player with Highlights</title>
      </Head>
      <div style={{ width: "100%", position: "absolute", top: "50%", transform: "translateY(-50%)", padding: "40px" }}>
        <Grid2 container spacing={3}>
          <Grid2 item size={{ xs: 12, md: 8 }}>
            <ReactPlayer
              ref={playerRef}
              playing={playing}
              url={videoUrl}
              width="100%"
              height="100%"
              onProgress={handleProgress}
              onDuration={(duration) => setVideoDuration(duration)}
              progressInterval={100}
            />
            <Box sx={{ width: "100%", display: "flex", alignItems: "center", position: "relative" }}>
              {playing ? (
                <IconButton onClick={() => setPlaying(false)}>
                  <PauseCircle />
                </IconButton>
              ) : (
                <IconButton onClick={() => setPlaying(true)}>
                  <PlayCircle />
                </IconButton>
              )}
              <Box
                sx={{
                  width: "100%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  height: "40px",
                  position: "relative",
                  cursor: "pointer"
                }}
                onClick={handleClickProgressBar}
                onMouseMove={handleMouseMoveProgressBar}
              >
                <Box
                  sx={{
                    width: `${played * 100}%`,
                    backgroundColor: "rgba(255,255,255,0.5)",
                    height: "100%"
                  }}
                />

                {hoverPosition !== null && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: `${hoverPosition * 100}%`,
                      transform: "translateX(-50%)",
                      width: "2px",
                      height: "100%",
                      backgroundColor: "white",
                    }}
                  />
                )}

                {highlights.map((highlight, index) => {
                  const highlightPosition = (highlight.timestamp / videoDuration) * 100;
                  return (
                    <Box
                      key={index}
                      className="highligh-marker"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: `${highlightPosition}%`,
                        transform: "translateX(-50%)",
                        width: "2px",
                        height: "100%",
                        backgroundColor: "yellow",
                        cursor: "pointer",
                      }}
                      onClick={() => handleHighlightClick(highlight.timestamp)}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: "-5px",
                          right: "-5px",
                          height: "100%",
                          cursor: "pointer",
                          "&:hover .tooltip": { display: "block" },
                        }}
                      >
                        <Box
                          className="tooltip"
                          sx={{
                            display: "none",
                            position: "absolute",
                            bottom: "-30px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "rgba(0, 0, 0, 0.75)",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                            fontSize: "12px"
                          }}
                        >
                          {highlight.event}: {highlight.description}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}

                {hoverTime !== null && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "-20px",
                      left: `${hoverPosition * 100}%`,
                      transform: "translateX(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.75)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      whiteSpace: "nowrap",
                      fontSize: "12px"
                    }}
                  >
                    {formatTime(hoverTime)}
                  </Box>
                )}
              </Box>
            </Box>
          </Grid2>

          <Grid2 item size={{ xs: 12, md: 4 }}>
            <Tabs value={tab} onChange={(event, newValue) => { setTab(newValue); }}>
              <Tab label="Upload" value="upload" />
              <Tab label="Highlights" value="highlights" />
            </Tabs>

            {tab === "upload" && (
              <Box sx={{ mt: "16px" }}>
                <Box
                  ref={videoDNDRef}
                  sx={{
                    width: "100%",
                    height: "200px",
                    backgroundColor: videoDragging || isUploading ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.3)",
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
                  <Typography variant="h6">{!isUploading ? videoDNDLabel : "Uploading..."}</Typography>
                </Box>
              </Box>
            )}

            {tab === "highlights" && (
              <Box sx={{ mt: "16px" }}>
                <TextField
                  label="Highlights JSON"
                  multiline
                  rows={10}
                  value={highlightJson}
                  onChange={(e) => setHighlightJson(e.target.value)}
                  fullWidth
                />
              </Box>
            )}
          </Grid2>
        </Grid2>
      </div>
    </ThemeProvider>
  );
};
