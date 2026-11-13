import React, { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  className?: string;
  placeholder?: string;
}

const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export function CustomDatePicker({ value, onChange, min, max, className = "", placeholder = "เลือกวันที่" }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down');
  
  const [vY, vM, vD] = (value || "").split("-");
  const initialDate = value && vY && vM && vD ? new Date(parseInt(vY), parseInt(vM) - 1, parseInt(vD)) : new Date();
  
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceBelow < 380 && spaceAbove > spaceBelow) {
        setDropdownPosition('up');
      } else {
        setDropdownPosition('down');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split("-");
      if (y && m && d) {
        setCurrentMonth(parseInt(m) - 1);
        setCurrentYear(parseInt(y));
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(parseInt(e.target.value));
  };

  const handleSelectDate = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const newDateStr = `${yyyy}-${mm}-${dd}`;
    
    onChange(newDateStr);
    setIsOpen(false);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    if (!y || !m || !d) return dateStr;
    const yearThai = parseInt(y) + 543;
    return `${d} ${MONTHS[parseInt(m) - 1]} ${yearThai}`;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const isSelected = value === dateStr;
    
    let isDisable = false;
    if (min && dateStr < min) isDisable = true;
    if (max && dateStr > max) isDisable = true;

    days.push(
      <button
        key={`day-${i}`}
        type="button"
        disabled={isDisable}
        onClick={() => handleSelectDate(i)}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors
          ${isSelected ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30' : 
            isDisable ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 
            'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer'}
        `}
      >
        {i}
      </button>
    );
  }

  const currentActualYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentActualYear - 10; i <= currentActualYear + 10; i++) {
    yearOptions.push(i);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 overflow-hidden outline-none ${className}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`text-sm font-black truncate ${value ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
            {value ? formatDisplayDate(value) : placeholder}
            </span>
        </div>
        <CalendarIcon size={16} className="text-slate-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className={`absolute z-50 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 w-[300px] animate-in fade-in zoom-in-95 duration-150 ${
          dropdownPosition === 'up' ? 'bottom-full mb-2' : 'mt-2'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              <select 
                value={currentMonth} 
                onChange={handleMonthChange}
                className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <select 
                value={currentYear} 
                onChange={handleYearChange}
                className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y + 543}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-slate-400 uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 place-items-center">
            {days}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button 
                type="button" 
                onClick={() => {
                    const today = new Date();
                    setCurrentMonth(today.getMonth());
                    setCurrentYear(today.getFullYear());
                }} 
                className="text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors"
            >
                กลับไปเดือนปัจจุบัน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
