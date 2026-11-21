
import { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ChatWidget from './components/ChatWidget';

const STORAGE_KEY = 'overchat:streamlabs-url';

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
  const [widgetUrl, setWidgetUrl] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  const [inputUrl, setInputUrl] = useState(widgetUrl);
  const [error, setError] = useState('');

  const handleSave = () => {
    const url = inputUrl.trim();

    if (!isValidStreamlabsUrl(url)) {
      setError('Entre une URL valide du widget Chat Box Streamlabs.');
      return;
    }

    localStorage.setItem(STORAGE_KEY, url);
    setWidgetUrl(url);
    setError('');
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
        color: '#fff',
      }}
    >
      {/* En-tête déplaçable */}
      <Box
        sx={{
          height: 38,
          flexShrink: 0,
          bgcolor: 'rgba(20, 20, 20, 0.9)',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          WebkitAppRegion: 'drag',
          cursor: 'move',
        }}
      >
        <Typography sx={{ fontWeight: 'bold', fontSize: 14 }}>
          OverChat
        </Typography>
      </Box>

      {!widgetUrl && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: '#181818',
            color: '#fff',
            borderRadius: 0,
          }}
        >
          <Typography variant="body2" sx={{ mb: 2 }}>
            Configure ton widget Streamlabs
          </Typography>

          <TextField
            fullWidth
            size="small"
            label="URL Streamlabs"
            placeholder="https://streamlabs.com/widgets/chat-box/v1/..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            error={Boolean(error)}
            helperText={error}
            sx={{
              mb: 2,
              input: { color: '#fff' },
              '& .MuiInputLabel-root': { color: '#aaa' },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#666',
              },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            sx={{
              bgcolor: '#2e7d32',
              WebkitAppRegion: 'no-drag',
            }}
          >
            Enregistrer
          </Button>
        </Paper>
      )}

      {/* Affichage du chat */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <ChatWidget url={widgetUrl} />
      </Box>
    </Box>
  );
}

export default App;
