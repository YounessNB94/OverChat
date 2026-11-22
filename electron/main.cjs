
const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
  globalShortcut,
  screen,
} = require('electron');

const path = require('node:path');

let mainWindow = null;
let tray = null;

let settingsOpen = false;
let mouseTrackingInterval = null;
let lastIgnoreMouse = null;

function updateMouseInteraction() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (!mainWindow.isVisible() || mainWindow.isMinimized()) return;

  const cursor = screen.getCursorScreenPoint();
  const bounds = mainWindow.getBounds();

  // Position de la souris dans la fenêtre OverChat
  const x = cursor.x - bounds.x;
  const y = cursor.y - bounds.y;

  // Zone de la poignée de déplacement (gauche)
  const overDragHandle =
  x >= 8 && x <= 44 &&
  y >= 0 && y <= 38;
  
  // Zone des trois boutons (droite)
  const overControls =
    x >= bounds.width - 115 &&
    x <= bounds.width &&
    y >= 0 && y <= 38;

  // Garder les paramètres interactifs lorsqu'ils sont ouverts
  const interactive =
    settingsOpen ||
    overDragHandle ||
    overControls;

  const shouldIgnore = !interactive;

  // Ne modifier Electron que si l'état change
  if (lastIgnoreMouse !== shouldIgnore) {
    mainWindow.setIgnoreMouseEvents(
      shouldIgnore,
      { forward: true }
    );

    lastIgnoreMouse = shouldIgnore;
  }
}

function startMouseTracking() {
  if (mouseTrackingInterval) {
    clearInterval(mouseTrackingInterval);
  }

  lastIgnoreMouse = null;

  // Vérification de la position toutes les 80 ms
  mouseTrackingInterval = setInterval(
    updateMouseInteraction,
    80
  );

  updateMouseInteraction();
}


// Icône intégrée pour éviter un fichier supplémentaire.
const TRAY_ICON =
  'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAnUlEQVR4nNWVQRJAMAxFI+M63IF7seBe3EEPxKqLZpJK2jD8Zarv90sUwN/V0EI3DWcNMKx7wkRPOMdAacHLBL3h1ATvHqxVKy0cy2YC9fPI1tkEVnhuD2sgnSYnaY/4ikpMOH23ydqExU3WDkJxk7UJ3mkyvQE9FJlIC57wxMDLhDKyQOmWtRzE/KFZU4pTVAuOUiV4YsoAwOdPdwGEwTw7buu9AgAAAABJRU5ErkJggg==';

function showWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
}

function hideWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  mainWindow.hide();
}

function toggleWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
    hideWindow();
  } else {
    showWindow();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 600,
    minWidth: 280,
    minHeight: 200,
    title: 'OverChat',
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.setContentProtection(true);
  // Activer le click-through intelligent
  settingsOpen = false;
  startMouseTracking();

  if (!app.isPackaged) {
    mainWindow.loadURL('http://127.0.0.1:5173');
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '../dist/index.html')
    );
  }

  mainWindow.on('closed', () => {
  if (mouseTrackingInterval) {
    clearInterval(mouseTrackingInterval);
    mouseTrackingInterval = null;
  }

  mainWindow = null;
  lastIgnoreMouse = null;
});
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    `data:image/png;base64,${TRAY_ICON}`
  );

  tray = new Tray(icon);
  tray.setToolTip('OverChat');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Afficher OverChat',
      click: showWindow,
    },
    {
      label: 'Masquer OverChat',
      click: hideWindow,
    },
    { type: 'separator' },
    {
      label: 'Quitter OverChat',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', showWindow);
}

app.whenReady().then(() => {
  // Contrôles accessibles uniquement depuis
  // la fenêtre principale de notre application.
  function fromMainWindow(event) {
    return (
      mainWindow &&
      !mainWindow.isDestroyed() &&
      event.sender === mainWindow.webContents
    );
  }

  ipcMain.on('overchat:minimize', (event) => {
    if (fromMainWindow(event)) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('overchat:hide', (event) => {
    if (fromMainWindow(event)) {
      hideWindow();
    }
  });
  ipcMain.on('overchat:settings', (event, isOpen) => {
  if (fromMainWindow(event) && typeof isOpen === 'boolean') {
    settingsOpen = isOpen;
    updateMouseInteraction();
  }
});

  createWindow();
  createTray();

  // Raccourci pour afficher / masquer le chat
  const registered = globalShortcut.register(
    'Control+Alt+O',
    toggleWindow
  );

  if (!registered) {
    console.warn('Raccourci OverChat indisponible.');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      showWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
