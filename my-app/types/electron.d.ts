interface ElectronIpcRenderer {
  invoke(channel: string, ...args: unknown[]): Promise<unknown>;
  on(channel: string, func: (...args: unknown[]) => void): void;
  removeListener(channel: string, func: (...args: unknown[]) => void): void;
}

interface Electron {
  ipcRenderer: ElectronIpcRenderer;
}

declare global {
  interface Window {
    require?: (module: string) => Electron;
  }
}

export {};

