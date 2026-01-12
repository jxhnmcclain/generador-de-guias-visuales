export const BRAND_COLORS = {
  green: '#4cbf8c',
  blue: '#005fc5',
  celeste: '#eef3fe',
  yellow: '#ffc000',
  red: '#ff6b75',
  gray: '#4e526e',
};

export interface GeneratedContent {
  html: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
