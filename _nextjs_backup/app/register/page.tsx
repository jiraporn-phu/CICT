"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  UserPlus,
  User,
  Lock,
  Eye,
  EyeOff,
  Phone,
  AlertCircle,
  CheckCircle,
  Loader2,
  IdCard,
  Building,
} from "lucide-react";

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  department: string;
  phone: string;
}

interface FieldError {
  username?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  department?: string;
  phone?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const [form, setForm] = useState<FormData>({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    department: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-sky-500" />
      </div>
    );
  }

  const validateUsername = (value: string): string => {
    if (!value) return "";
    if (value.length < 4) return "ต้องมีอย่างน้อย 4 ตัวอักษร";
    if (!/^[a-zA-Z0-9]+$/.test(value)) return "ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษและตัวเลข";
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) return "";
    if (value.length < 8) return "ต้องมีอย่างน้อย 8 ตัวอักษร";
    return "";
  };

  const validateConfirmPassword = (value: string): string => {
    if (!value) return "";
    if (value !== form.password) return "รหัสผ่านไม่ตรงกัน";
    return "";
  };

  const validateFullName = (value: string): string => {
    if (!value) return "";
    if (/\d/.test(value)) return "ชื่อ-นามสกุลต้องไม่มีตัวเลข";
    if (!/^[a-zA-Zก-์\s]+$/.test(value)) return "ใช้ได้เฉพาะตัวอักษรไทย/อังกฤษ และช่องว่าง";
    return "";
  };

  const validatePhone = (value: string): string => {
    if (!value) return "";
    const clean = value.replaceAll(/[-\s]/g, "");
    if (!/^\d+$/.test(clean)) return "เบอร์โทรต้องเป็นตัวเลขเท่านั้น";
    if (clean.length > 0 && !clean.startsWith("0")) return "เบอร์โทรต้องเริ่มด้วย 0";
    if (clean.length !== 10) return "เบอร์โทรต้องมี 10 หลัก";
    return "";
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "username": return validateUsername(value);
      case "password": return validatePassword(value);
      case "confirmPassword": return validateConfirmPassword(value);
      case "fullName": return validateFullName(value);
      case "department": return value ? "" : "กรุณากรอกแผนก";
      case "phone": return validatePhone(value);
      default: return "";
    }
  };

  const handleChange = (name: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "password" && form.confirmPassword) {
      const isMatch = value === form.confirmPassword;
      const confirmErr = isMatch ? "" : "รหัสผ่านไม่ตรงกัน";
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const isFormValid = (): boolean => {
    const { username, password, confirmPassword, fullName, department, phone } = form;
    if (!username || !password || !confirmPassword || !fullName || !department || !phone)
      return false;
    const allErrors = {
      username: validateField("username", username),
      password: validateField("password", password),
      confirmPassword: validateField("confirmPassword", confirmPassword),
      fullName: validateField("fullName", fullName),
      department: validateField("department", department),
      phone: validateField("phone", phone),
    };
    return Object.values(allErrors).every((e) => e === "");
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setServerError("");

    if (!isFormValid()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          fullName: form.fullName,
          department: form.department,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setServerError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-emerald-50 to-green-50 p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4 animate-bounce">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            ลงทะเบียนสำเร็จ!
          </h2>
          <p className="text-slate-500 mt-2">
            กำลังพาไปหน้าเข้าสู่ระบบ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white! drop-shadow-md">ลงทะเบียน</h1>
          <p className="text-sm font-medium text-white! mt-1 drop-shadow-sm">
            ลงทะเบียนเพื่อเข้าใช้งานระบบ
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-slate-200 p-8">
          {serverError && (
            <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-600 mb-1.5">
                ชื่อผู้ใช้งาน <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder="ตัวอักษรภาษาอังกฤษหรือตัวเลข อย่างน้อย 4 ตัว"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                    errors.username
                      ? "border-red-300 bg-red-50/50 focus:ring-red-500/20 focus:border-red-400"
                      : "border-slate-200 bg-slate-50/50 focus:ring-sky-500/20 focus:border-sky-400"
                  }`}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.username}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-600 mb-1.5">
                ชื่อ-นามสกุล <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <IdCard
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="เช่น สมชาย วงศ์สวัสดิ์"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                    errors.fullName
                      ? "border-red-300 bg-red-50/50 focus:ring-red-500/20 focus:border-red-400"
                      : "border-slate-200 bg-slate-50/50 focus:ring-sky-500/20 focus:border-sky-400"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-600 mb-1.5">
                แผนก <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Building
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="department"
                  type="text"
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  placeholder="กรอกชื่อแผนก (เช่น ไอที, บัญชี)"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                    errors.department
                      ? "border-red-300 bg-red-50/50 focus:ring-red-500/20 focus:border-red-400"
                      : "border-slate-200 bg-slate-50/50 focus:ring-sky-500/20 focus:border-sky-400"
                  }`}
                />
              </div>
              {errors.department && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.department}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-1.5">
                เบอร์โทรศัพท์ <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => {
                      const val = e.target.value.replaceAll(/\D/g, "");
                      if (val.length <= 10) handleChange("phone", val);
                    }}
                    placeholder="0XXXXXXXXX"
                    maxLength={10}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                    errors.phone
                      ? "border-red-300 bg-red-50/50 focus:ring-red-500/20 focus:border-red-400"
                      : "border-slate-200 bg-slate-50/50 focus:ring-sky-500/20 focus:border-sky-400"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1.5">
                รหัสผ่าน <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm outline-none transition-all ${
                    errors.password
                      ? "border-red-300 bg-red-50/50 focus:ring-red-500/20 focus:border-red-400"
                      : "border-slate-200 bg-slate-50/50 focus:ring-sky-500/20 focus:border-sky-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-600 mb-1.5">
                ยืนยันรหัสผ่าน <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                    errors.confirmPassword
                      ? "border-red-300 bg-red-50/50 focus:ring-red-500/20 focus:border-red-400"
                      : "border-slate-200 bg-slate-50/50 focus:ring-sky-500/20 focus:border-sky-400"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-linear-to-r from-sky-500 to-sky-500 hover:from-sky-600 hover:to-sky-600 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <UserPlus size={18} />
              )}
              {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              มีบัญชีอยู่แล้ว?{" "}
              <Link
                href="/login"
                className="text-sky-500 font-semibold hover:text-sky-600 transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/60! mt-6 font-medium">
          ICTC-Asset Management System
        </p>
      </div>
    </div>
  );
}
