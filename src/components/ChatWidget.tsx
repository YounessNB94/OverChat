
import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface ChatWidgetProps {
  url: string;
}

// Taille de référence pour le widget
const BASE_WIDTH = 525;

// Limites du zoom
const MIN_SCALE = 0.35;
const MAX_SCALE = 2;

export default function ChatWidget({ url }: ChatWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;

      if (!width) return;

      // Zoom proportionnel à la largeur disponible
      const newScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, width / BASE_WIDTH)
      );

      setScale(newScale);
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

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

            // Compense le zoom pour remplir la fenêtre
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,

            border: 'none',
            background: 'transparent',

            // Redimensionne l'ensemble du widget
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      ) : (
        <Typography sx={{color:"text.secondary", textAlign:"center", p: 2 }}
        >
          Configure ton URL Streamlabs pour afficher le chat.
        </Typography>
      )}
    </Box>
  );
}
