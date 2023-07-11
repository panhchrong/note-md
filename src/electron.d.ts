interface Window {
  electron: {
    isElectron: boolean;
    closeWindow: () => void;
    maximizeWindow: () => void;
    minimizeWindow: () => void;
    navigate: (path: string) => void;
    onMusicFiles: (callback: (musicFiles: string[]) => void) => void;
    updateText: (value) => void;
    send: (channel: string, data?: any) => Promise<any>;
    getAppSetting: () => Promise<any>;
    on: (channel: string, callback: (data: any) => void) => void;
    removeListener: (
      channel: string,
      callback: (...args: any[]) => void
    ) => void;
    getContent: (file: string) => string;
    removeAllListeners: () => void;
  };
}
