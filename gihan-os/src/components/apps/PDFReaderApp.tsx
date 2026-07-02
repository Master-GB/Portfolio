"use client";

import { useState, useEffect } from "react";
import { Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface PDFReaderAppProps {
  pdfPath: string;
}

export default function PDFReaderApp({ pdfPath }: PDFReaderAppProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfPath;
    link.download = "CV.pdf";
    link.click();
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  // On mobile, hide native PDF toolbar; on tablet/desktop, show native controls
  const pdfSrc = isMobile ? `${pdfPath}#toolbar=0&navpanes=0&scrollbar=0` : pdfPath;

  return (
    <div className="h-full w-full flex flex-col">
      {/* Mobile toolbar - only shows on mobile screens */}
      <div className="md:hidden flex items-center justify-between gap-2 p-2 bg-slate-950/50 border-b border-white/10">
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded hover:bg-white/10 text-slate-300 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-slate-400 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded hover:bg-white/10 text-slate-300 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleRotate}
            className="p-2 rounded hover:bg-white/10 text-slate-300 hover:text-white transition"
            title="Rotate"
          >
            <RotateCw size={16} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded hover:bg-white/10 text-slate-300 hover:text-white transition text-xs"
            title="Reset"
          >
            Reset
          </button>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 transition text-xs"
          title="Download PDF"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
      
      {/* PDF Viewer - Responsive iframe */}
      <div className="flex-1 w-full h-full relative">
        <div
          className="w-full h-full transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: "top center",
          }}
        >
          <iframe
            src={pdfSrc}
            className="w-full h-full border-0"
            style={{
              minHeight: '400px',
            }}
            title="PDF Viewer"
          />
        </div>
      </div>
    </div>
  );
}
