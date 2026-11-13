import { Monitor, Laptop, Keyboard, Mouse, Headphones, Printer, Tablet, Projector, Router, HardDrive, Package } from "lucide-react";

export const categoryIcons: Record<string, any> = {
  "Laptop": Laptop,
  "Monitor": Monitor,
  "Keyboard": Keyboard,
  "Mouse": Mouse,
  "Headset": Headphones,
  "Printer": Printer,
  "Tablet": Tablet,
  "Projector": Projector,
  "Router / Switch": Router,
  "External Storage": HardDrive,
  "Uncategorized": Package,
};

export const DEPARTMENTS = ["IT", "PR"];

export const DEFAULT_DEPARTMENT_CATEGORIES: Record<string, string[]> = {
  "IT": ["คอมพิวเตอร์", "จอภาพ", "เครื่องพิมพ์", "อุปกรณ์เครือข่าย", "อุปกรณ์ต่อพ่วง", "เซิร์ฟเวอร์", "อุปกรณ์จัดเก็บข้อมูล"],
  "PR": ["กล้องถ่ายภาพ", "กล้องวิดีโอ", "ไมโครโฟน", "ไฟส่องสว่าง", "ขาตั้งกล้อง", "อุปกรณ์บันทึกเสียง", "อุปกรณ์สตูดิโอ"],
};

export const APP_CONFIG = {
  orgName: "ICTC-Asset",
  defaultLocation: "ห้อง ICTC",
  defaultDepartment: "ICTC General",
};

export const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    available: "มีในสต็อก",
    borrowed: "กำลังยืมอุปกรณ์",
    maintenance: "ซ่อมบำรุง",
    retired: "ปลดระวาง",
    overdue: "เกินกำหนดคืนอุปกรณ์",
    returned: "คืนอุปกรณ์แล้ว",
    pending: "รออนุมัติ", 
    approved: "อนุมัติแล้ว",
    rejected: "ปฏิเสธ",
    requisitioned: "เบิกอุปกรณ์แล้ว",
  };
  return labels[status] || status;
};
