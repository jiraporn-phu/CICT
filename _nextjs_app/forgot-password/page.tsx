import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-slate-200 p-8 text-center animate-in fade-in zoom-in-95 duration-300 relative">
          <div className="w-16 h-16 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-800 mb-2">ลืมรหัสผ่าน?</h1>
          
          <p className="text-slate-500 mb-8 text-sm">
            กรุณาติดต่อ <b>ผู้ดูแลระบบ (Admin)</b> หรือแผนก IT <br/>เพื่อทำการรีเซ็ตรหัสผ่านใหม่ให้กับคุณ
          </p>

          <div className="bg-slate-50 rounded-xl p-4 mb-8 text-sm text-slate-600 border border-slate-200">
            <p className="font-semibold mb-1">ช่องทางติดต่อ:</p>
            <p>📞 โทร: 056-803569 ต่อ 104</p>
          </div>

          <Link 
            href="/login" 
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/20 transition-all"
          >
            <ArrowLeft size={18} />
            กลับไปเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
