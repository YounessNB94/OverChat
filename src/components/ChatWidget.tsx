
import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface ChatWidgetProps {
  url: string;
  zoom: number;
}

const BASE_WIDTH = 525;
const MIN_SCALE = 0.25;
const MAX_SCALE = 2;

export default function ChatWidget({
  url,
  zoom,
}: ChatWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(420);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;

      if (width) {
        setContainerWidth(width);
      }
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Zoom automatique + réglage manuel
  const automaticScale = containerWidth / BASE_WIDTH;

  const scale = Math.max(
    MIN_SCALE,
    Math.min(MAX_SCALE, automaticScale * zoom)
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        bgcolor: 'transparent',
        position: 'relative',
      }}
    >
      {url ? (
        <iframe
          title="Streamlabs Twitch Chat"
          src={url}
          referrerPolicy="no-referrer"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,
            border: 'none',
            background: 'transparent',
            display: 'block',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      ) : (
        <Typography
          color="text.secondary"
          sx={{ p: 2, textAlign: 'center' }}
        >
          Configure ton URL Streamlabs.
        </Typography>
      )}
    </Box>
  );
}
