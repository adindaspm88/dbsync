import { useState } from "react";
import {
  LayoutDashboard,
  Table2,
  CheckCircle2,
  BarChart3,
  FolderKanban,
  Download,
  Settings,
  Menu,
  MapPinned,
  X,
  ChevronLeft,
} from "lucide-react";

export default function SidebarLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menus = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    // {
    //   title: "Perbandingan",
    //   icon: Table2,
    //   href: "/comparison",
    // },
    {
      title: "Luas Tanam luar LBS",
      icon: MapPinned,
      href: "/luarlbs",
    },
    // {
    //   title: "Grafik",
    //   icon: BarChart3,
    //   href: "/grafik",
    // },
    // {
    //   title: "Rekap",
    //   icon: FolderKanban,
    //   href: "/rekap",
    // },
    // {
    //   title: "Export",
    //   icon: Download,
    //   href: "/export",
    // },
    // {
    //   title: "Pengaturan",
    //   icon: Settings,
    //   href: "/settings",
    // },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE TOPBAR */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-sky-100 px-4 py-3 sticky top-0 z-40">
        <div>
          <h1 className="font-bold text-slate-800">
            Dashboard Padi
          </h1>
        </div>

        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-sky-50 transition"
        >
          <Menu size={22} className="text-sky-700" />
        </button>
      </div>

      {/* OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-white border-r border-sky-100
          shadow-sm flex flex-col
          transition-all duration-300

          ${isCollapsed ? "w-20" : "w-72"}

          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="h-20 border-b border-sky-100 flex items-center justify-between px-5">
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg text-slate-800">
                Dashboard Padi
              </h1>
            </div>
          )}

          {/* DESKTOP COLLAPSE */}
          <button
            onClick={() =>
              setIsCollapsed(!isCollapsed)
            }
            className="hidden lg:flex p-2 rounded-xl hover:bg-sky-50 transition"
          >
            <ChevronLeft
              size={18}
              className={`text-sky-700 transition-transform ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* MOBILE CLOSE */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-sky-50 transition"
          >
            <X size={20} className="text-sky-700" />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-5 space-y-2 overflow-y-auto">
          {menus.map((menu, index) => {
            const Icon = menu.icon;

            return (
              <a
                key={index}
                href={menu.href}
                className="
                  group flex items-center gap-3
                  px-4 py-3 rounded-2xl
                  text-slate-700
                  hover:bg-sky-50
                  hover:text-sky-700
                  transition-all duration-200
                "
              >
                <Icon
                  size={20}
                  className="flex-shrink-0"
                />

                {!isCollapsed && (
                  <span className="font-medium text-sm">
                    {menu.title}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="border-t border-sky-100 p-4">
          {!isCollapsed && (
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
              <p className="text-sm font-semibold text-slate-700">
                Monitoring Statistik
              </p>

              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Dashboard perbandingan data statistik
                antara BPS dan Dinas terkait.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* CONTENT */}
      <main
        className={`
          transition-all duration-300
          p-6

          ${isCollapsed ? "lg:ml-20" : "lg:ml-72"}
        `}
      >
        {children}
      </main>
    </div>
  );
}