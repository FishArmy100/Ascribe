import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

export const WINDOW_ID: string = getCurrentWebviewWindow().label;