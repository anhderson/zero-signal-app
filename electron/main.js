const { app, BrowserWindow, session, desktopCapturer, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const os = require('os');
const { autoUpdater } = require('electron-updater');

// Configuration for auto-updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow;
let tray;
let isQuitting = false;

// Force a specific userData path to avoid OneDrive permission issues
if (process.platform === 'win32') {
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  const devPath = path.join(localAppData, 'ZeroSignalDev');
  app.setPath('userData', devPath);
  console.log('User Data Path set to:', devPath);
}

// Disable hardware acceleration and GPU cache to resolve "black screen" and "Access Denied" issues on Windows/OneDrive
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-gpu-cache');

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

function createTray() {
  const iconPath = path.join(__dirname, 'icon.png');
  const fs = require('fs');
  const { nativeImage } = require('electron');
  
  let icon;
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
  } else {
    // Fallback if icon doesn't exist yet
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Mostrar Zero Signal', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Sair Completamente', click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('Zero Signal - Ativo na Frequência');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow.show());
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#313338',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false // Crucial for voice persistence when minimized
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1E1F22',
      symbolColor: '#949BA4'
    }
  });

  const url = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  const loadApp = () => {
    mainWindow.loadURL(url).catch(err => {
      console.error('Failed to load app:', err);
      if (isDev) {
        setTimeout(loadApp, 1000);
      }
    });
  };

  loadApp();

  // Intercept close to hide instead of quit
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.webContents.session.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen', 'window'] })
      .then((sources) => {
        const screen = sources.find(s => s.id.startsWith('screen:')) || sources[0];
        if (screen) {
          callback({ video: screen });
        } else {
          callback({ error: 'No sources found' });
        }
      })
      .catch((err) => {
        callback({ error: err.message });
      });
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools();
  });
}

app.whenReady().then(() => {
  createTray();
  
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'display-capture') return true;
    return true;
  });

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'display-capture') callback(true);
    else callback(true);
  });

  ipcMain.handle('get-screen-sources', async () => {
    const sources = await desktopCapturer.getSources({ 
      types: ['window', 'screen'],
      thumbnailSize: { width: 600, height: 337 },
      fetchWindowIcons: true
    });
    
    let screenCount = 0;
    return sources.map(s => {
      let name = s.name;
      if (s.id.startsWith('screen:')) {
        screenCount++;
        name = `Monitor ${screenCount}${s.name && s.name !== 'Entire Screen' && s.name !== 'Screen' ? ` (${s.name})` : ''}`;
      }
      return {
        id: s.id,
        name: name,
        thumbnail: s.thumbnail.toDataURL(),
        appIcon: s.appIcon && !s.appIcon.isEmpty() ? s.appIcon.toDataURL() : null
      };
    });
  });

  createWindow();

  // Check for updates every time we open/start
  autoUpdater.checkForUpdatesAndNotify();

  // Check every 10 minutes
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 10 * 60 * 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else mainWindow.show();
    
    // Also check when waking up the app
    autoUpdater.checkForUpdatesAndNotify();
  });
});

autoUpdater.on('update-available', () => {
  console.log('Atualização disponível. Iniciando download...');
  if (mainWindow) mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Atualização baixada. Instalando agora...');
  if (mainWindow) mainWindow.webContents.send('update_downloaded');
});

autoUpdater.on('error', (err) => {
  console.error('Erro no auto-updater:', err);
  if (mainWindow) mainWindow.webContents.send('update_error', err.message);
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

app.on('window-all-closed', () => {
  // Do nothing, app stays in tray
});
