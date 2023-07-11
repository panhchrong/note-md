const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  isElectron: () => true,
  closeWindow: () => ipcRenderer.send("close-window"),
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  maximizeWindow: () => ipcRenderer.send("maximize-window"),
  updateText: (value) => ipcRenderer.send("update-text", value),
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
    return new Promise((resolve) => {
      ipcRenderer.once(`${channel}-reply`, (event, data) => {
        resolve(data);
      });
    });
  },
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners();
  },
});
