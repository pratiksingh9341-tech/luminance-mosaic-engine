
import { MosaicConfig } from '../types';

/**
 * Calculates the average luminance of an image from its pixel data
 */
export const calculateAverageLuminance = (data: Uint8ClampedArray): number => {
  let totalLuminance = 0;
  for (let i = 0; i < data.length; i += 4) {
    totalLuminance += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return totalLuminance / (data.length / 4);
};

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

// Reusable offscreen elements
const offscreenTileCanvas = document.createElement('canvas');
const offscreenGridCanvas = document.createElement('canvas');

/**
 * Optimized generator with High Performance rendering logic for 10K output
 */
export const drawMosaicFrame = (
  source: HTMLImageElement,
  tileImg: HTMLImageElement,
  config: MosaicConfig,
  targetCtx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const { 
    gridSize, 
    detailOverlay, 
    sourceZoom, 
    sourceFocusX, 
    sourceFocusY, 
    gridGap,
    tileContrast,
    highResTiles
  } = config;
  
  const fullW = source.width;
  const fullH = source.height;

  const sw = fullW / sourceZoom;
  const sh = fullH / sourceZoom;
  
  const maxSX = fullW - sw;
  const maxSY = fullH - sh;
  const sx = Math.max(0, Math.min(maxSX, maxSX * sourceFocusX));
  const sy = Math.max(0, Math.min(maxSY, maxSY * sourceFocusY));

  const blockSize = width / gridSize;
  const drawSize = blockSize - gridGap;
  const cols = gridSize;
  const rows = Math.floor(gridSize * (height / width));

  // 1. Prepare Tile (Buffered)
  // For 10K output, we increase buffer size slightly if highRes is on to maintain sharpness
  const tileBufferSize = highResTiles ? 512 : 128;
  offscreenTileCanvas.width = tileBufferSize;
  offscreenTileCanvas.height = tileBufferSize;
  const tCtx = offscreenTileCanvas.getContext('2d', { alpha: false });
  if (!tCtx) return;

  // Pre-process tile to grayscale and high contrast once
  tCtx.filter = `grayscale(100%) contrast(${tileContrast * 100}%)`;
  tCtx.imageSmoothingEnabled = true;
  tCtx.imageSmoothingQuality = 'high';
  tCtx.drawImage(tileImg, 0, 0, tileBufferSize, tileBufferSize);
  
  // 2. Prepare Source Grid
  offscreenGridCanvas.width = cols;
  offscreenGridCanvas.height = rows;
  const gCtx = offscreenGridCanvas.getContext('2d', { alpha: false });
  if (!gCtx) return;
  gCtx.imageSmoothingEnabled = true;
  gCtx.imageSmoothingQuality = 'high';
  gCtx.drawImage(source, sx, sy, sw, sh, 0, 0, cols, rows);
  const gridData = gCtx.getImageData(0, 0, cols, rows).data;

  // 3. Render Pipeline
  targetCtx.fillStyle = '#000000';
  targetCtx.fillRect(0, 0, width, height);
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = 'high';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = (y * cols + x) * 4;
      const r = gridData[idx];
      const g = gridData[idx + 1];
      const b = gridData[idx + 2];
      
      const lGrid = (0.299 * r + 0.587 * g + 0.114 * b);
      const intensity = lGrid / 255;
      
      // Using globalAlpha is significantly faster than per-tile filtering for large canvases
      targetCtx.globalAlpha = Math.min(1, intensity * 1.5); 
      targetCtx.drawImage(
        offscreenTileCanvas, 
        x * blockSize + gridGap/2, 
        y * blockSize + gridGap/2, 
        drawSize, 
        drawSize
      );
    }
  }
  targetCtx.globalAlpha = 1.0;

  // 4. Feature Overlay Pass
  if (detailOverlay > 0) {
    targetCtx.save();
    targetCtx.globalCompositeOperation = 'overlay';
    targetCtx.globalAlpha = detailOverlay;
    targetCtx.filter = 'grayscale(100%) contrast(150%)';
    targetCtx.drawImage(source, sx, sy, sw, sh, 0, 0, width, height);
    targetCtx.restore();
  }
};

export const generateMosaic = async (
  targetImg: HTMLImageElement,
  tileImg: HTMLImageElement,
  config: MosaicConfig
): Promise<string> => {
  const canvas = document.createElement('canvas');
  // Elevated to 10,000px (Extreme UHD)
  const canvasWidth = 10000; 
  const aspectRatio = targetImg.height / targetImg.width;
  canvas.width = canvasWidth;
  canvas.height = canvasWidth * aspectRatio;
  
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Context acquisition failed');

  // Perform render
  drawMosaicFrame(targetImg, tileImg, config, ctx, canvas.width, canvas.height);
  
  // Return high-quality JPEG (10K DataURLs are large, ensure browser doesn't prune them)
  return canvas.toDataURL('image/jpeg', 0.85);
};
