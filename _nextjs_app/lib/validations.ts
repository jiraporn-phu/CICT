import { z } from "zod";

export const equipmentCreateSchema = z.object({
  name: z
    .string()
    .min(1, "กรุณากรอกชื่ออุปกรณ์")
    .max(200, "ชื่ออุปกรณ์ต้องไม่เกิน 200 ตัวอักษร"),
  department: z
    .string()
    .min(1, "กรุณาเลือกแผนก"),
  category: z
    .string()
    .min(1, "กรุณาเลือกหมวดหมู่"),
  description: z
    .string()
    .max(1000, "คำอธิบายต้องไม่เกิน 1000 ตัวอักษร")
    .optional()
    .nullable(),
  quantity: z
    .number()
    .int("จำนวนต้องเป็นจำนวนเต็ม")
    .min(1, "จำนวนต้องมากกว่า 0")
    .default(1),
  imageUrl: z.string().optional().nullable(),
  location: z
    .string()
    .max(200, "สถานที่ต้องไม่เกิน 200 ตัวอักษร")
    .optional()
    .nullable(),
  createdAt: z.string().optional().nullable(),
});

export const equipmentUpdateSchema = equipmentCreateSchema;

export const borrowCreateSchema = z.object({
  equipmentId: z.string().min(1, "กรุณาเลือกอุปกรณ์"),
  borrowerId: z.string().min(1, "ไม่พบข้อมูลผู้ยืม"),
  borrowQuantity: z
    .number()
    .int("จำนวนต้องเป็นจำนวนเต็ม")
    .min(1, "จำนวนยืมต้องมากกว่า 0")
    .default(1),
  dueDate: z.string().min(1, "กรุณาระบุวันกำหนดคืน"),
  pickupLocation: z.string().optional().nullable(),
  status: z
    .enum(["pending", "approved", "borrowed", "returned", "overdue", "rejected", "requisitioned"])
    .optional(),
  transactionType: z.enum(["BORROW", "REQUISITION"]).default("BORROW"),
}).refine((data) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(data.dueDate);
  return due >= today;
}, {
  message: "วันกำหนดคืนต้องไม่เป็นวันที่พ้นมาแล้ว",
  path: ["dueDate"],
});

export const borrowPatchSchema = z.object({
  status: z
    .enum(["pending", "approved", "borrowed", "returned", "overdue", "rejected", "requisitioned"])
    .optional(),
  note: z.string().max(500, "หมายเหตุต้องไม่เกิน 500 ตัวอักษร").optional(),
  afterImageUrl: z.string().optional(),
  returnLocation: z.string().max(200).optional(),
});

export const returnSchema = z.object({
  transactionId: z.string().min(1, "ไม่พบรายการยืม"),
  afterImageUrl: z.string().optional().nullable(),
  returnLocation: z.string().max(200).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

export const userCreateSchema = z.object({
  username: z
    .string()
    .min(4, "Username ต้องมีอย่างน้อย 4 ตัวอักษร")
    .regex(/^[a-zA-Z0-9]+$/, "Username ต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  fullName: z
    .string()
    .min(1, "กรุณากรอกชื่อ-นามสกุล")
    .max(50, "ชื่อ-นามสกุลต้องไม่เกิน 50 ตัวอักษร")
    .regex(/^[a-zA-Zก-์]+(?:\s[a-zA-Zก-์]+)?$/, "ชื่อ-นามสกุลต้องเป็นตัวอักษร และเว้นวรรคได้ไม่เกิน 1 ครั้ง"),
  phone: z
    .string()
    .min(1, "กรุณากรอกเบอร์โทร")
    .regex(/^0\d{9}$/, "เบอร์โทรต้องเป็นตัวเลข 10 หลัก เริ่มต้นด้วย 0"),
  department: z.string().min(1, "กรุณากรอกแผนก").optional().or(z.literal("")),
  role: z.enum(["user", "admin", "moderator"]).optional(),
});

export const userPatchSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  role: z.enum(["user", "admin", "moderator"]).optional(),
  status: z.enum(["active", "inactive", "suspended", "pending"]).optional(),
  password: z.string().min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร").optional(),
});

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, "กรุณากรอกชื่อ-นามสกุล")
    .regex(/^[a-zA-Z\u0E00-\u0E7F\s]+$/, "ชื่อ-นามสกุลต้องเป็นตัวอักษรเท่านั้น")
    .optional(),
  phone: z
    .string()
    .regex(/^0\d{9}$/, "เบอร์โทรต้องเป็นตัวเลข 10 หลัก เริ่มต้นด้วย 0")
    .optional()
    .or(z.literal("")),
  image: z.string().optional().nullable(),
  department: z.string().optional(),
  password: z
    .string()
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
    .optional(),
  confirmPassword: z.string().optional(),
});

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((e) => e.message).join(", ");
}
