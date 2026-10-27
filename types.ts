
export interface MosaicConfig {
  gridSize: number;
  zoomScale: number;
  brightnessBoost: number;
  detailOverlay: number; // 0 to 1
  sourceZoom: number; // 1 to 8
  sourceFocusX: number; // 0 to 1
  sourceFocusY: number; // 0 to 1
  gridGap: number; // 0 to 5
  tileContrast: number; // 0.5 to 2.0
  highResTiles: boolean;
}

export interface ImageDataState {
  target: string | null;
  tile: string | null;
  isProcessing: boolean;
  isLive: boolean;
  resultUrl: string | null;
}
