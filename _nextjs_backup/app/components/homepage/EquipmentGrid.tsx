import React, { useState } from 'react';
import { EquipmentItem } from "@/app/lib/types";
import { EquipmentImage } from "./EquipmentImage";
import { ArrowLeftRight, RotateCcw, MapPin, Heart, FileText } from "lucide-react";
import { EquipmentDetailModal } from "../DetailModals";
import { ImageLightbox } from "../ImageLightbox";
import { StatusBadge } from '../StatusBadge';
import { APP_CONFIG } from '@/app/lib/constants';

interface EquipmentGridProps {
  readonly items: EquipmentItem[];
  readonly onBorrow: (item: EquipmentItem) => void;
  readonly onReturn: (item: EquipmentItem) => void;
  readonly onRequisition: (item: EquipmentItem) => void;
  readonly wishlistedIds?: Set<string>;
  readonly onToggleWishlist?: (item: EquipmentItem) => void;
}

export function EquipmentGrid({ items, onBorrow, onReturn, onRequisition, wishlistedIds, onToggleWishlist }: EquipmentGridProps) {
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [lightbox, setLightbox] = useState({ isOpen: false, url: '', alt: '' });

  const handleOpenDetail = (item: EquipmentItem) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleOpenLightbox = (url: string, alt: string) => {
    setLightbox({ isOpen: true, url, alt });
  };

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => {
        const isAvailable = item.availableQuantity > 0 && item.status !== 'maintenance';
        const isWishlisted = wishlistedIds?.has(item.id);

        let actionButton;
        if (item.myBorrowId) {
            actionButton = (
                <button
                    onClick={(e) => { e.stopPropagation(); onReturn(item); }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg text-sm transition-colors"
                >
                    <RotateCcw size={16} /> คืนอุปกรณ์
                </button>
            );
        } else if (isAvailable) {
            actionButton = (
                <div className="flex gap-2 w-full">
                    <button
                        onClick={(e) => { e.stopPropagation(); onBorrow(item); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm shadow-sky-200"
                    >
                        <ArrowLeftRight size={14} /> ยืม
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRequisition(item); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm shadow-orange-200"
                    >
                        <FileText size={14} /> เบิก
                    </button>
                </div>
            );
        } else {
            actionButton = (
                <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-400 font-semibold rounded-lg text-sm cursor-not-allowed"
                >
                    ไม่มีอุปกรณ์ในคลัง
                </button>
            );
        }

        return (
            <article
                key={item.id}
                className="group bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:border-sky-200 dark:hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/20 hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden flex flex-col"
            >
            <button 
                type="button"
                className="absolute inset-0 z-0 bg-transparent border-none w-full h-full cursor-pointer"
                onClick={() => handleOpenDetail(item)}
                aria-label={`View details for ${item.name}`}
            />
            <div className="relative z-10">
                <button 
                    type="button"
                    className="aspect-video w-full rounded-xl bg-slate-50 mb-4 flex items-center justify-center group-hover:bg-sky-50/50 transition-colors relative overflow-hidden border-none outline-none focus:ring-2 focus:ring-sky-500/50"
                    onClick={(e) => {
                        if (item.imageUrl) {
                            e.stopPropagation();
                            handleOpenLightbox(item.imageUrl, item.name);
                        } else {
                            handleOpenDetail(item);
                        }
                    }}
                    aria-label={`View ${item.name} image`}
                >
                    <EquipmentImage item={item} />
                </button>
                
                {onToggleWishlist && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log("Heart clicked for item:", item.id);
                            onToggleWishlist(item);
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full shadow-lg transition-all z-50 cursor-pointer hover:scale-110 active:scale-95 pointer-events-auto
                            ${isWishlisted 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' 
                                : 'bg-white/90 text-slate-400 hover:bg-white hover:text-red-500 backdrop-blur-sm border border-slate-200/50'
                            }
                        `}
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart size={18} className={isWishlisted ? "fill-red-700" : ""} />
                    </button>
                )}
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-2 z-10">
                      <button 
                        type="button"
                        onClick={() => handleOpenDetail(item)}
                        className="text-left bg-transparent border-none p-0 outline-none focus:underline"
                      >
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 text-lg group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" title={item.name}>{item.name}</h3>
                      </button>
                    <div className="flex gap-2 items-center mt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded transition-colors">{item.category}</span>
                    </div>
                    </div>
                    <div className="shrink-0 z-10">
                        {item.availableQuantity === 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full font-bold border bg-red-100 text-red-700 border-red-200 px-2 py-0.5 text-[10px] shadow-sm whitespace-nowrap">
                                หมดสต็อก
                            </span>
                        ) : (
                            <StatusBadge status={item.status} />
                        )}
                    </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <span className="font-medium">คงเหลือ: <span className={`font-bold text-base ${item.availableQuantity === 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-500'}`}>{item.availableQuantity}</span></span>
                <span className="text-xs bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md flex items-center gap-1 transition-colors">
                    <MapPin size={12} /> {item.location || APP_CONFIG.defaultLocation}
                </span>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 flex gap-2 z-10">
                {actionButton}
            </div>
            </article>
        );
      })}
    </div>

    <EquipmentDetailModal 
      isOpen={showDetail} 
      onClose={() => setShowDetail(false)} 
      equipment={selectedItem}
      onImageClick={(url) => handleOpenLightbox(url, selectedItem?.name || '')}
      onBorrow={(item) => {
        setShowDetail(false);
        onBorrow(item);
      }}
      onRequisition={(item) => {
        setShowDetail(false);
        onRequisition(item);
      }}
    />

    <ImageLightbox 
      isOpen={lightbox.isOpen}
      onClose={() => setLightbox({ ...lightbox, isOpen: false })}
      imageUrl={lightbox.url}
      altText={lightbox.alt}
    />
    </>
  );
}
