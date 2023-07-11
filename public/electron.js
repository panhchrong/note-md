const path = require("path");
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const isDev = require("electron-is-dev");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

let mainWindow;

const notePath = path.join(app.getPath("appData"), ".note-md", "notes");
const settingDir = path.join(
  app.getPath("appData"),
  ".note-md",
  "user-setting.json"
);
let setting = {
  editor: {
    background: "#2d3545",
    foreground: "#d8dee9",
    caret: "#d8dee9",
    selection: "#434c5e",
    selectionMatch: "#434c5e",
    gutterBackground: "#3b4252",
    gutterForeground: "#d8dee9",
    showLineNumbers: false,
  },
  primary: "#2e3441",
  secondary: "#3a4351",
  button: {
    primary: "#3a4351",
    hover: "#343b48",
    secondary: "#2e3441",
    danger: "#fc5f59",
    success: "#38cc51",
    warning: "#fcbd49",
  },
  text: "#dee0e2",
};

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.js");
  const indexPath = isDev
    ? "http://localhost:8000/"
    : path.join(__dirname, "index.html");

  const win = new BrowserWindow({
    width: 1080,
    height: 800,
    minWidth: 820,
    minHeight: 600,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath,
    },
  });
  mainWindow = win;
  if (isDev) win.loadURL(indexPath);
  else win.loadFile(indexPath);

  if (isDev) win.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(() => {
  const markdownDir = notePath;
  if (!fs.existsSync(markdownDir)) {
    fs.mkdirSync(markdownDir, { recursive: true });
  }
  if (fs.existsSync(settingDir)) {
    const raw = fs.readFileSync(settingDir, "utf-8");
    setting = raw ? JSON.parse(raw) : setting;
  } else {
    fs.writeFileSync(settingDir, JSON.stringify(setting), "utf-8");
  }
  createWindow();
});

function getImageDataUri(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const mimeType = getMimeType(imagePath);
  const base64Data = imageBuffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64Data}`;
  return dataUri;
}

function getMimeType(imagePath) {
  const extname = path.extname(imagePath).toLowerCase();

  switch (extname) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    default:
      throw new Error(`Unsupported image format: ${extname}`);
  }
}

ipcMain.on("get-content", (e, file) => {
  e.reply(
    "get-content-reply",
    fs.readFileSync(path.join(notePath, file), "utf-8")
  );
});

ipcMain.on("get-app-setting", (e) => {
  e.reply("get-app-setting-reply", setting);
});

const handleTasks = (text) => {
  const lines = text.split("\n");
  const checked = lines.filter((line) => /^- \[x\] \S+/.test(line)).length || 0;
  const unchecked =
    lines.filter((line) => /^- \[ \] \S+/.test(line)).length || 0;
  return {
    checked,
    unchecked,
    total: checked + unchecked,
  };
};

ipcMain.on("get-note-list", (e) => {
  const notes = fs.readdirSync(notePath).map((filename) => {
    const filePath = path.join(notePath, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const truncatedContent =
      fileContent.length > 50
        ? fileContent.substring(0, 50) + "..."
        : fileContent;
    const stats = fs.statSync(filePath);
    const createdDate = stats.birthtime;
    const tasks = handleTasks(fileContent);
    const formattedDate = createdDate
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");
    return {
      title: filename,
      content: truncatedContent,
      createdDate: formattedDate,
      tasks,
    };
  });
  e.reply("get-note-list-reply", notes);
});

ipcMain.on("get-data-uri", (e, payload) => {
  const { path } = payload;
  let dataUri = [];
  for (const p of path) dataUri.push(getImageDataUri(p));
  e.reply("get-data-uri-reply", dataUri);
});

ipcMain.on("save-note-content", (e, payload) => {
  const { name, isNewNote, content } = payload;
  if (isNewNote) {
    fs.writeFileSync(path.join(notePath, `${name}.md`), content, "utf-8");
  } else {
    fs.unlinkSync(path.join(notePath,name));
    fs.writeFileSync(path.join(notePath, name), content, "utf-8");
  }

  e.reply("save-note-content-reply", { name: payload.name });
});

ipcMain.on("save-setting", (e, payload) => {
  const { primary, secondary, text } = payload;
  setting.primary = primary;
  setting.secondary = secondary;
  setting.text = text;
  fs.writeFileSync(settingDir, JSON.stringify(setting), "utf-8");
  const raw = fs.readFileSync(settingDir, "utf-8");
  setting = JSON.parse(raw);
  mainWindow.reload();
  e.reply("save-setting-reply", "success");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("open-link", (e, link) => {
  shell.openExternal(link);
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("close-window", () => {
  mainWindow.close();
});

ipcMain.on("minimize-window", () => {
  mainWindow.minimize();
});

ipcMain.on("maximize-window", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.restore();
  } else {
    mainWindow.maximize();
  }
});

let lastPayload = null;

ipcMain.on("get-note", (e, filename) => {
  const exist = fs.existsSync(path.join(notePath, filename));
  let content = "";
  if (exist) content = fs.readFileSync(path.join(notePath, filename), "utf-8");
  e.reply("get-note-reply", exist ? content : false);
});

ipcMain.on("update-text", (e, payload) => {
  if (
    lastPayload &&
    lastPayload.file === payload.file &&
    lastPayload.id === payload.id &&
    lastPayload.value === payload.value
  ) {
    lastPayload = payload;
    return;
  }
  lastPayload = payload;
  const markdown = fs.readFileSync(path.join(notePath, payload.file), "utf-8");
  const lines = markdown.split("\n");
  const lineNumber = parseInt(payload.id, 10);
  const index = lineNumber - 1;
  let line = lines[index];
  if (line.includes("- [ ]") || line.includes("- [x]")) {
    if (payload.value) {
      line = line.replace("- [ ]", "- [x]");
    } else {
      line = line.replace("- [x]", "- [ ]");
    }
    lines[index] = line;
  }

  const updatedMarkdown = lines.join("\n");

  fs.writeFileSync(path.join(notePath, payload.file), updatedMarkdown);
});
