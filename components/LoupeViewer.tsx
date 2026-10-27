
import React, { useState, useRef, useEffect } from 'react';

interface LoupeViewerProps {
  imageUrl: string;
  zoomScale: number;
}

const LoupeViewer: React.FC<LoupeViewerProps> = ({ imageUrl, zoomScale }) => {
  const [showLoupe, setShowLoupe] = useState(false);
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setLoupePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const loupeSize = 250; // pixels

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 group cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowLoupe(true)}
      onMouseLeave={() => setShowLoupe(false)}
    >
      <img 
        src={imageUrl} 
        alt="Mosaic Result" 
        className="w-full h-auto block select-none"
      />
      
      {showLoupe && (
        <div 
          className="absolute pointer-events-none rounded-full border-4 border-indigo-500 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-900 overflow-hidden z-10"
          style={{
            width: `${loupeSize}px`,
            height: `${loupeSize}px`,
            left: `calc(${loupePos.x}% - ${loupeSize / 2}px)`,
            top: `calc(${loupePos.y}% - ${loupeSize / 2}px)`,
            backgroundImage: `url(${imageUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${100 * zoomScale}%`,
            backgroundPosition: `${loupePos.x}% ${loupePos.y}%`
          }}
        >
          {/* Subtle crosshair inside loupe */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
             <div className="w-full h-0.5 bg-indigo-300"></div>
             <div className="h-full w-0.5 bg-indigo-300 absolute"></div>
          </div>
        </div>
      )}

      {/* Instructional Badge */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono text-slate-300 border border-slate-700 pointer-events-none transition-opacity group-hover:opacity-0">
        HOVER TO INSPECT BLOCKS
      </div>
    </div>
  );
};

export default LoupeViewer;
