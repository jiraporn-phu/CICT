import React, { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getThaiNowISO } from "@/app/lib/utils";

interface CustomDateTimePickerProps {
  value: string; // YYYY-MM-DDTHH:mm
  onChange: (date: string) => void;
  className?: string;
}

const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export function CustomDateTimePicker({ value, onChange, className = "" }: CustomDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceBelow < 450 && spaceAbove > spaceBelow) { // DateTimePicker is taller (~450px)
        setDropdownPosition('up');
      } else {
        setDropdownPosition('down');
      }
    }
  }, [isOpen]);

  const [datePart, timeStr] = (value || getThaiNowISO()).split('T');
  const [vY, vM, vD] = datePart.split("-");
  const initialDate = vY && vM && vD ? new Date(parseInt(vY), parseInt(vM) - 1, parseInt(vD)) : new Date();
  
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  
  const [hours, setHours] = useState(value ? value.split('T')[1].split(':')[0] : "00");
  const [minutes, setMinutes] = useState(value ? value.split('T')[1].split(':')[1] : "00");

  useEffect(() => {
    if (value) {
        try {
            const [datePart, timePart] = value.split('T');
            const [y, m, d] = datePart.split('-');
            setCurrentYear(parseInt(y));
            setCurrentMonth(parseInt(m) - 1);
            if (timePart) {
                const [h, min] = timePart.split(':');
                setHours(h);
                setMinutes(min);
            }
        } catch(e) {
            console.error("Invalid datetime format", value);
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

  const handleApply = (newYear: number, newMonth: number, day: number, h: string, m: string) => {
    const yyyy = newYear;
    const mm = String(newMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}T${h}:${m}`);
  };

  const handleSelectDate = (day: number) => {
    handleApply(currentYear, currentMonth, day, hours, minutes);
    setIsOpen(false);
  };

  const handleTimeChange = (type: 'h' | 'm', val: string) => {
      let newH = hours;
      let newM = minutes;
      if (type === 'h') { newH = val; setHours(val); }
      if (type === 'm') { newM = val; setMinutes(val); }
      
      if (value) {
          const day = parseInt(value.split('T')[0].split('-')[2]);
          handleApply(currentYear, currentMonth, day, newH, newM);
      }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const formatDisplay = (val: string) => {
    if (!val) return "เลือกวันและเวลา";
    const [datePart, timePart] = val.split('T');
    if (!datePart || !timePart) return val;
    const [y, m, d] = datePart.split('-');
    const yearThai = parseInt(y) + 543;
    return `${d} ${MONTHS[parseInt(m) - 1]} ${yearThai} เวลา ${timePart} น.`;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
  }
  
  const activeDay = value ? parseInt(value.split('T')[0].split('-')[2]) : null;
  const activeMonth = value ? parseInt(value.split('T')[0].split('-')[1]) - 1 : null;
  const activeYear = value ? parseInt(value.split('T')[0].split('-')[0]) : null;

  for (let i = 1; i <= daysInMonth; i++) {
    const isSelected = activeYear === currentYear && activeMonth === currentMonth && activeDay === i;
    days.push(
      <button
        key={`day-${i}`}
        type="button"
        onClick={() => handleSelectDate(i)}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors cursor-pointer
          ${isSelected ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30' : 
            'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}
        `}
      >
        {i}
      </button>
    );
  }

  const currentActualYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentActualYear - 5; i <= currentActualYear + 5; i++) yearOptions.push(i);

  const hourOptions = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));
  const minOptions = Array.from({length: 60}, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:text-white text-sm ${className}`}
      >
        <CalendarIcon size={16} className="text-slate-400 shrink-0 mr-2" />
        <span className="flex-1 text-left font-black">{formatDisplay(value)}</span>
      </button>

      {isOpen && (
        <div className={`absolute z-50 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 w-[300px] animate-in fade-in zoom-in-95 duration-150 ${
          dropdownPosition === 'up' ? 'bottom-full mb-2' : 'mt-2'
        }`}>
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => {
                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                else setCurrentMonth(currentMonth - 1);
            }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              <select value={currentMonth} onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold outline-none cursor-pointer">
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select value={currentYear} onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold outline-none cursor-pointer">
                {yearOptions.map(y => <option key={y} value={y}>{y + 543}</option>)}
              </select>
            </div>
            <button type="button" onClick={() => {
                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                else setCurrentMonth(currentMonth + 1);
            }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-[11px] font-bold text-slate-400 uppercase">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 place-items-center mb-4">
            {days}
          </div>

          {/* Time Picker */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
             <div className="flex items-center justify-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <select value={hours} onChange={e => handleTimeChange('h', e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold outline-none cursor-pointer">
                  {hourOptions.map(h => <option key={`h-${h}`} value={h}>{h}</option>)}
                </select>
                <span className="font-bold text-slate-400">:</span>
                <select value={minutes} onChange={e => handleTimeChange('m', e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold outline-none cursor-pointer">
                  {minOptions.map(m => <option key={`m-${m}`} value={m}>{m}</option>)}
                </select>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
