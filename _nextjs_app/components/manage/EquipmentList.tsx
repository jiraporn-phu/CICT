"use client";

import { Package, MapPin, Layers, Trash2, CheckSquare, Square, Edit } from "lucide-react";
import { EquipmentItem } from "@/app/lib/types";
import { useState } from "react";
import { EquipmentDetailModal } from "../DetailModals";
import { ImageLightbox } from "../ImageLightbox";
import { StatusBadge } from "../StatusBadge";
import { APP_CONFIG } from "@/app/lib/constants";

interface EquipmentListProps {
  equipment: EquipmentItem[];
  loading: boolean;
  userRole: string;
  onBorrow: (item: EquipmentItem) => void;
  onDelete: (id: string) => void;
  onEdit?: (item: EquipmentItem) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

function EquipmentCard({ 
  eq,
  userRole,
  onBorrow,
  onDelete,
  onEdit, 
  isSelected, 
  onToggleSelect, 
  showCheckbox,
  onOpenDetail,
  onOpenLightbox
}: Readonly<{
  eq: EquipmentItem;
  userRole: string;
  onBorrow: (item: EquipmentItem) => void;
  onDelete: (id: string) => void;
  onEdit?: (item: EquipmentItem) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showCheckbox?: boolean;
  onOpenDetail?: (item: EquipmentItem) => void;
  onOpenLightbox?: (url: string, alt: string) => void;
}>) {
  const isAvailable = eq.availableQuantity > 0 && eq.status !== 'maintenance';

  let actionButtons;
  if (userRole === "admin") {
    actionButtons = (
       <>
         {onEdit && (
           <button onClick={() => onEdit(eq)} className="p-2 rounded-xl border shadow-sm transition-all duration-200 bg-white border-slate-200 text-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-blue-400 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 hover:scale-105 hover:shadow-md hover:shadow-blue-500/20 group mr-2">
             <Edit size={16} className="transition-colors fill-transparent group-hover:fill-blue-600" />
           </button>
         )}
         <button onClick={() => onDelete(eq.id)} className="p-2 rounded-xl border shadow-sm transition-all duration-200 bg-white border-slate-200 text-red-500 dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 hover:bg-red-50 hover:border-red-500 hover:text-red-600 hover:scale-105 hover:shadow-md hover:shadow-red-500/20 group">
           <Trash2 size={16} className="transition-colors fill-transparent group-hover:fill-red-600" />
         </button>
       </>
    );
  } else {
    let btnText = 'ไม่มีอุปกรณ์ในคลัง';
    if (eq.status === 'maintenance') btnText = 'ซ่อมบำรุง';
    else if (eq.availableQuantity > 0) btnText = 'ยืม';

    actionButtons = (
      <button 
        onClick={() => isAvailable ? onBorrow(eq) : null}
        disabled={!isAvailable}
        className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 ${isAvailable ? 'bg-sky-500 text-white hover:bg-sky-600 hover:shadow-sky-500/30' : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'}`}
      >
        {btnText}
      </button>
    );
  }

  return (
    <section
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-300 ease-out group relative outline-none focus-within:ring-2 focus-within:ring-sky-500/50 ${isSelected ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-50 dark:bg-sky-900/10' : 'border-slate-200 dark:border-slate-700'}`}
    >
      <button 
        type="button"
        className="absolute inset-0 z-0 bg-transparent border-none w-full h-full cursor-pointer"
        onClick={() => onOpenDetail?.(eq)}
        aria-label={`View details for ${eq.name}`}
      />
      
      {showCheckbox && onToggleSelect && (
        <label 
          className="absolute top-3 left-3 z-10 p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-sm cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
        >
          <input 
            type="checkbox" 
            checked={!!isSelected}
            onChange={() => onToggleSelect(eq.id)}
            className="sr-only"
          />
          {isSelected ? <CheckSquare size={20} className="text-sky-500" /> : <Square size={20} className="text-slate-400" />}
        </label>
      )}

      <button 
        type="button"
        className="h-40 w-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden relative z-10 border-none outline-none focus:ring-2 focus:ring-sky-500/50"
        onClick={(e) => {
            if (eq.imageUrl) {
                e.stopPropagation();
                onOpenLightbox?.(eq.imageUrl, eq.name);
            } else {
                onOpenDetail?.(eq);
            }
        }}
        aria-label={`View ${eq.name} image`}
      >
        {eq.imageUrl ? (
          <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <Package size={40} className="text-slate-300 dark:text-slate-600" />
        )}
        
        <div className="absolute top-3 right-3 shadow-sm">
            {eq.availableQuantity === 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full font-bold border bg-red-100 text-red-700 border-red-200 px-2 py-0.5 text-[10px] shadow-sm whitespace-nowrap">
                    หมดสต็อก
                </span>
            ) : (
                <StatusBadge status={eq.status} />
            )}
        </div>
      </button>

      <div className="p-4">
        <h3 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-1 group-hover:text-sky-500 transition-colors">{eq.name}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800/50">
             {eq.department || "IT"}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center gap-1">
            <Layers size={12} /> {eq.category}
          </span>
          {eq.location ? (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center gap-1 line-clamp-1">
              <MapPin size={12} /> {eq.location}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center gap-1 line-clamp-1">
              <MapPin size={12} /> {APP_CONFIG.defaultLocation}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
           <div className="text-xs text-slate-400">
              ทั้งหมด {eq.quantity} รายการ
           </div>

           <div 
            className="flex items-center gap-2 outline-none z-10" 
           >
              {actionButtons}
           </div>
        </div>
      </div>
    </section>
  );
}

export function EquipmentList({ 
  equipment, 
  loading, 
  userRole, 
  onBorrow, 
  onDelete,
  onEdit,
  selectedIds,
  onToggleSelect,
  showCheckbox 
}: Readonly<EquipmentListProps>) {
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
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-slate-500 dark:text-slate-400">ไม่พบรายการอุปกรณ์</p>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {equipment.map(eq => (
        <EquipmentCard
          key={eq.id}
          eq={eq}
          userRole={userRole}
          onBorrow={onBorrow}
          onDelete={onDelete}
          onEdit={onEdit}
          isSelected={selectedIds?.has(eq.id)}
          onToggleSelect={onToggleSelect}
          showCheckbox={showCheckbox}
          onOpenDetail={handleOpenDetail}
          onOpenLightbox={handleOpenLightbox}
        />
      ))}
    </div>

    <EquipmentDetailModal 
      isOpen={showDetail} 
      onClose={() => setShowDetail(false)} 
      equipment={selectedItem}
      userRole={userRole}
      onImageClick={(url) => handleOpenLightbox(url, selectedItem?.name || '')}
      onBorrow={(item) => {
        setShowDetail(false);
        onBorrow(item);
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
