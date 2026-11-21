
import { Box, Typography } from '@mui/material';

function App() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        bgcolor: 'transparent',
        p: 2,
      }}
    >
      <Box
        sx={{
          bgcolor: 'rgba(15, 15, 15, 0.85)',
          border: '1px solid #555',
          borderRadius: 2,
          p: 2,
          WebkitAppRegion: 'drag',
          cursor: 'move',
        }}
      >
        <Typography variant="h6">
          OverChat
        </Typography>

        <Typography variant="body2">
          Electron fonctionne !
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
