
import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  IconButton,
  Paper,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import SettingsIcon from '@mui/icons-material/Settings';
import MinimizeIcon from '@mui/icons-material/Minimize';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ChatWidget from './components/ChatWidget';

const URL_KEY = 'overchat:streamlabs-url';
const ZOOM_KEY = 'overchat:zoom';

function isValidStreamlabsUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      (url.hostname === 'streamlabs.com' ||
        url.hostname === 'www.streamlabs.com') &&
      url.pathname.startsWith('/widgets/chat-box/v1/') &&
      url.pathname.length > '/widgets/chat-box/v1/'.length
    );
  } catch {
    return false;
  }
}

function App() {
  const [isHovering, setIsHovering] = useState(false);

  const [widgetUrl, setWidgetUrl] = useState(
    () => localStorage.getItem(URL_KEY) || ''
  );

  const [inputUrl, setInputUrl] = useState(widgetUrl);
  const [error, setError] = useState('');

  const [settingsOpen, setSettingsOpen] = useState(
    !widgetUrl
  );

  const [zoom, setZoom] = useState(() => {
    const saved = Number(localStorage.getItem(ZOOM_KEY));

    return saved > 0 && Number.isFinite(saved)
      ? Math.min(1.5, Math.max(0.5, saved))
      : 1;
  });

  const handleSave = () => {
    const url = inputUrl.trim();

    if (!isValidStreamlabsUrl(url)) {
      setError('Entre une URL Streamlabs valide.');
      return;
    }

    localStorage.setItem(URL_KEY, url);

    setWidgetUrl(url);
    setInputUrl(url);
    setError('');
    setSettingsOpen(false);
    useEffect(() => {
  window.overchat?.setSettingsOpen(settingsOpen);
}, [settingsOpen]);
  };

  const handleZoomChange = (
    _event: Event,
    value: number | number[]
  ) => {
    const nextZoom = Array.isArray(value)
      ? value[0]
      : value;

    setZoom(nextZoom);
    localStorage.setItem(ZOOM_KEY, String(nextZoom));
  };

  const minimizeWindow = () => {
    window.overchat?.minimize();
  };

  const hideWindow = () => {
    window.overchat?.hide();
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Chat Streamlabs : occupe toute la fenêtre */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        <ChatWidget url={widgetUrl} zoom={zoom} />
      </Box>

      {/* Zone supérieure invisible de contrôle */}
      <Box
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 38,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
       
{/* Poignée pour déplacer OverChat */}
<Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    ml: 1,
    borderRadius: 1,
    bgcolor: isHovering
      ? 'rgba(20, 20, 20, 0.85)'
      : 'transparent',
    opacity: isHovering ? 1 : 0,
    transition: 'opacity 0.2s ease',
    WebkitAppRegion: 'drag',
    pointerEvents: 'auto',
    cursor: 'move',
    userSelect: 'none',
  }}
>
  {/* Poignée de déplacement OverChat */}
<Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    ml: 1,
    borderRadius: 1,

    // Fond toujours légèrement visible
    bgcolor: 'rgba(20, 20, 20, 0.65)',

    // 40 % par défaut, 100 % au survol
    opacity: isHovering ? 1 : 0.4,

    transition: 'opacity 0.2s ease',

    WebkitAppRegion: 'drag',
    pointerEvents: 'auto',
    cursor: 'move',
    userSelect: 'none',
  }}
>
  <DragIndicatorIcon
    sx={{
      fontSize: 22,
      color: '#ffffff',
      pointerEvents: 'none',
    }}
  />
</Box>
</Box>


        {/* Contrôles flottants */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(20, 20, 20, 0.85)',
            borderRadius: 1,
            px: 0.5,
            opacity: isHovering ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'auto',
            WebkitAppRegion: 'no-drag',
          }}
        >
          <Tooltip title="Paramètres">
            <IconButton
              size="small"
              onClick={() => setSettingsOpen((prev) => !prev)}
              sx={{ color: '#fff' }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Réduire">
            <IconButton
              size="small"
              onClick={minimizeWindow}
              sx={{ color: '#fff' }}
            >
              <MinimizeIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Masquer (Ctrl + Alt + O)">
            <IconButton
              size="small"
              onClick={hideWindow}
              sx={{ color: '#fff' }}
            >
              <VisibilityOffIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Panneau de paramètres flottant */}
      {settingsOpen && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: 42,
            left: 8,
            right: 8,
            zIndex: 110,
            p: 2,
            bgcolor: 'rgba(27, 27, 27, 0.96)',
            color: '#fff',
            borderRadius: 2,
            maxHeight: '70%',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          <Typography
            sx={{
              mb: 2,
              fontSize: 14,
              fontWeight: 'bold',
            }}
          >
            Paramètres OverChat
          </Typography>

          <TextField
            fullWidth
            size="small"
            label="URL Streamlabs"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              setError('');
            }}
            error={Boolean(error)}
            helperText={error}
            sx={{
              mb: 2,
              input: { color: '#fff' },
              '& .MuiInputLabel-root': {
                color: '#aaa',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#666',
              },
            }}
          />

          <Button
            fullWidth
            size="small"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              mb: 3,
              bgcolor: '#2e7d32',
              '&:hover': {
                bgcolor: '#388e3c',
              },
            }}
          >
            Enregistrer
          </Button>

          <Typography
            variant="body2"
            sx={{ mb: 1 }}
          >
            Zoom du chat : {Math.round(zoom * 100)} %
          </Typography>

          <Slider
            value={zoom}
            min={0.5}
            max={1.5}
            step={0.05}
            onChange={handleZoomChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) =>
              `${Math.round(value * 100)} %`
            }
            sx={{
              color: '#4caf50',
            }}
          />

          <Typography
            variant="caption"
            sx={{
              color: '#aaa',
              display: 'block',
            }}
          >
            100 % correspond au zoom automatique.
          </Typography>

          <Button
            fullWidth
            size="small"
            variant="outlined"
            onClick={() => setSettingsOpen(false)}
            sx={{
              mt: 2,
              color: '#fff',
              borderColor: '#555',
            }}
          >
            Fermer les paramètres
          </Button>
        </Paper>
      )}
    </Box>
  );
}

export default App;
