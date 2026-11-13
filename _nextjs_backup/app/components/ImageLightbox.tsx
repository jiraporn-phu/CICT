"use client";

import React, { useEffect, useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

export function ImageLightbox({ isOpen, onClose, imageUrl, altText }: Readonly<ImageLightboxProps>) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || zoom <= 1) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    container.addEventListener('mousedown', handleMouseDown);
    globalThis.addEventListener('mousemove', handleMouseMove);
    globalThis.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      globalThis.removeEventListener('mousemove', handleMouseMove);
      globalThis.removeEventListener('mouseup', handleMouseUp);
    };
  }, [zoom, isDragging, dragStart, position.x, position.y]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => {
    setZoom(prev => {
      const nextZoom = Math.max(prev - 0.5, 1);
      if (nextZoom === 1) setPosition({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 md:p-10 select-none">
      <button 
        type="button"
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in border-none w-full h-full cursor-default" 
        onClick={onClose} 
        aria-label="Close Lightbox"
      />

      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex items-center border border-white/20">
          <button 
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button 
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
        </div>
        
        <button 
          onClick={onClose}
          className="p-2.5 bg-white text-slate-900 rounded-full shadow-xl hover:bg-slate-100 transition-all hover:rotate-90"
        >
          <X size={24} />
        </button>
      </div>

      {(() => {
        let cursorClass = 'cursor-default';
        if (zoom > 1) {
          cursorClass = isDragging ? 'cursor-grabbing' : 'cursor-grab';
        }

        return (
          <div 
            ref={containerRef}
            className={`relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out ${cursorClass}`}
          >
            <button
              type="button"
              className={`bg-transparent border-none p-0 outline-none transition-transform duration-200 pointer-events-auto ${zoom === 1 ? 'cursor-pointer' : ''}`}
              style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              }}
              onClick={(e) => {
                if (zoom === 1) {
                  e.stopPropagation();
                  onClose();
                }
              }}
              aria-label={`Close lightbox and return to ${altText}`}
            >
              <img 
                src={imageUrl} 
                alt={altText}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
              />
            </button>
            
            {zoom === 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white/60 text-xs px-4 py-2 rounded-full border border-white/5 pointer-events-none flex items-center gap-2">
                    <Maximize2 size={12} /> คลิกที่ปุ่มด้านบนหรือใช้เมาส์ซูมเพื่อดูรายละเอียด
                </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
