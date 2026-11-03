export type AppId = 
  | 'journal' 
  | 'vault' 
  | 'graph' 
  | 'recall' 
  | 'academy'
  | 'loci-world'
  | 'settings' 
  | 'memory-viewer';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  iconName: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  payload?: any;
}

export interface DesktopIcon {
  appId: AppId;
  title: string;
  iconName: string;
  description?: string;
  badge?: string | number;
}
