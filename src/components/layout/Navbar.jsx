import { LogOut, LayoutDashboard, Wheat } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import ThemeToggle from "../ThemeToggle";
import { useTheme } from "../ThemeContext";

export default function NavbarLayout({ children }) {
  const location=useLocation(); const navigate=useNavigate();
  const kode=location.pathname.split("/")[2];
  const user=JSON.parse(localStorage.getItem("user")||"{}");
  const { theme, setTheme } = useTheme();
  const logout=()=>{localStorage.removeItem("token");localStorage.removeItem("user");navigate("/login");};
  return <div className="app-shell min-h-screen bg-slate-50">
    <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Wheat size={20}/></span><span><b className="block text-lg text-left text-slate-800">DBSync</b><small className="text-slate-500">Monitoring Data BPS dan Dinas</small></span></Link>
        <div className="flex items-center gap-2 sm:gap-3"><Link to={kode?`/modul/${kode}`:"/"} className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 md:flex"><LayoutDashboard size={17}/> Dashboard</Link><div className="hidden text-right md:block"><span className="block text-sm font-semibold text-slate-800">{user.nama||"Pengguna"}</span><span className="text-xs text-slate-500">{user.email||""}</span></div><ThemeToggle compact theme={theme} onToggle={() => setTheme((current) => current === "dark" ? "light" : "dark")} /><button onClick={logout} aria-label="Keluar" title="Keluar" className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><LogOut size={19}/></button></div>
      </div>
    </header>
    <main className="mx-auto max-w-screen-2xl p-4 sm:p-6 lg:px-8"><Breadcrumb/>{children}</main>
  </div>;
}
