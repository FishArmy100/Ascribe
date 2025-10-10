import * as React from "react";
import { useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Button,
  CssBaseline,
} from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";

export default function App() {
  const paragraphs = React.useMemo(
    () =>
      new Array(5000).fill(null).map(
        (_, i) =>
          `Paragraph ${i + 1}: ${"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(
            (i % 5) + 1
          )}`
      ),
    []
  );

  // reference for the entire "paper" scrollable window
  const parentRef = useRef<HTMLDivElement>(null);

  // virtualizer that uses the *window* scroll instead of a nested container
  const rowVirtualizer = useVirtualizer({
    count: paragraphs.length,
    getScrollElement: () => window as unknown as Element, // attach to window scroll
    estimateSize: () => 80, // fallback height
    measureElement: (el) => el.getBoundingClientRect().height, // measure dynamically
    overscan: 5,
  });

  // the virtualizer will measure elements automatically when they mount
  // and re-compute their positions as the user scrolls

  return (
    <>
      <CssBaseline />

      {/* Fixed header */}
      <AppBar position="fixed" color="default" elevation={2}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Virtual Paper
          </Typography>
          <Box>
            <Button color="inherit">File</Button>
            <Button color="inherit">Edit</Button>
            <Button color="inherit">View</Button>
            <Button color="inherit">Help</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main scrollable content (the paper) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: "80px",
          pb: "80px",
          background: "linear-gradient(180deg,#e9f0ff 0%, #f7fbff 100%)",
        }}
        ref={parentRef}
      >
        <Paper
          elevation={3}
          sx={{
            width: "min(760px, 90%)",
            p: 4,
            borderRadius: 2,
            boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
            position: "relative",
            minHeight: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Window-Based Virtualization Demo
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This uses react-virtual with <code>getScrollElement: window</code> and dynamic height
            measurement. Only visible paragraphs are rendered.
          </Typography>

          {/* The virtualized paragraphs */}
          <Box
            sx={{
              position: "relative",
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => (
              <Box
                key={virtualRow.key}
                ref={(el: HTMLElement | null) => {
                  if (el) rowVirtualizer.measureElement(el);
                }}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <Typography
                  paragraph
                  sx={{
                    mb: 2,
                    backgroundColor:
                      virtualRow.index % 2 === 0 ? "white" : "#fafafa",
                    borderRadius: 1,
                    p: 1.5,
                  }}
                >
                  {paragraphs[virtualRow.index]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: "center",
          color: "text.secondary",
          backgroundColor: "transparent",
        }}
      >
        <Typography variant="body2">
          © 2025 Virtual Paper — Window Scroll Example
        </Typography>
      </Box>
    </>
  );
}
