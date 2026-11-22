
export {};

declare global {
  interface Window {
    overchat?: {
      minimize: () => void;
      hide: () => void;
      setSettingsOpen: (isOpen: boolean) => void;
    };
  }
}
