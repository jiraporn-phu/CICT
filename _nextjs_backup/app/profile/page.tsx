"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { User, Mail, Phone, MapPin, Camera, Loader2, Save, Lock } from "lucide-react";
import { uploadFile } from "@/app/lib/utils";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    department: "",
    phone: "",
    password: "",
    confirmPassword: "",
    imageUrl: "",
    imagePreview: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users/myprofile");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            username: data.username || "",
            fullName: data.fullName || "",
            department: data.department || "",
            phone: data.phone || "",
            password: "",
            confirmPassword: "",
            imageUrl: data.image || "",
            imagePreview: data.image || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imagePreview: reader.result as string }));
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const url = await uploadFile(file);

      setFormData(prev => ({ ...prev, imageUrl: url }));

    } catch (error) {
      console.error("Image upload failed:", error);
      setMessage({ type: "error", text: "อัปโหลดรูปภาพไม่สำเร็จ" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "รหัสผ่านไม่ตรงกัน" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/users/myprofile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          department: formData.department,
          phone: formData.phone,
          image: formData.imageUrl,
          password: formData.password || undefined,
          confirmPassword: formData.confirmPassword || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "บันทึกไม่สำเร็จ");

      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: formData.fullName,
          image: formData.imageUrl,
        }
      });

      setMessage({ type: "success", text: "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว" });
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
            <p className="text-slate-400 text-sm animate-pulse">กำลังโหลดข้อมูลส่วนตัว...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">แก้ไขข้อมูลส่วนตัว</h1>

        <div className="card p-8 animate-fade-in mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group w-24 h-24">
              {formData.imagePreview ? (
                <img 
                  src={formData.imagePreview} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-md group-hover:brightness-90 transition-all"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-linear-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white text-4xl font-bold shadow-md border-4 border-white group-hover:brightness-90 transition-all">
                  {formData.fullName ? formData.fullName.charAt(0) : "U"}
                </div>
              )}
              
              <label 
                htmlFor="profile-upload" 
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
              >
                <Camera size={24} className="text-white mb-1 drop-shadow-md" />
                <span className="text-[10px] text-white font-medium drop-shadow-md">เปลี่ยนรูป</span>
                <input 
                  id="profile-upload" 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
                    <Loader2 size={24} className="animate-spin text-white" />
                  </div>
                )}
              </label>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800">{formData.fullName || "ผู้ใช้งาน"}</h2>
              <p className="text-sm text-slate-500">{formData.department || "ไม่มีแผนก"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 opacity-70">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Username
                </span>
                <div className="flex items-center px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500">
                  <User size={18} className="mr-3 opacity-50" />
                  {formData.username}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-3 text-slate-400" />
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition-all text-slate-700"
                    placeholder="กรอกชื่อ-นามสกุล"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="department" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  แผนก
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-3 text-slate-400" />
                  <input
                    id="department"
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition-all text-slate-700"
                    placeholder="ระบุแผนก (เช่น IT, HR, Account)"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  เบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-3 text-slate-400" />
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replaceAll(/\D/g, "");
                      if (val.length <= 10) setFormData({ ...formData, phone: val });
                    }}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition-all text-slate-700"
                    placeholder="0XXXXXXXXX"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
               <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Lock size={16} className="text-sky-500" /> เปลี่ยนรหัสผ่าน (ถ้าต้องการ)
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      รหัสผ่านใหม่
                    </label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition-all text-slate-700"
                      placeholder="ระบุรหัสผ่านใหม่"
                      minLength={6}
                    />
                  </div>
                   <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition-all text-slate-700"
                      placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                    />
                  </div>
               </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save size={20} /> บันทึกการเปลี่ยนแปลง
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}