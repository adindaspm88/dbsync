import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import DashboardModul from "./pages/DashboardModul";
import PerbandinganModul from "./pages/PerbandinganModul";
import LuarLbs from "./pages/module/LuarLbs";
import NotFound from "./pages/NotFound";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import ModuleHome from "./pages/ModuleHome";
import { ThemeProvider } from "./components/ThemeContext";
import AdminManagement from "./pages/AdminManagement";
import OperatorImport from "./pages/OperatorImport";

export default function App() {
  return <ThemeProvider><BrowserRouter><Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedLayout />}>
      <Route path="/" element={<ModuleHome />} />
      <Route path="/admin" element={<AdminManagement />} />
      <Route path="/import" element={<OperatorImport />} />
      <Route path="/modul/:kodeModul" element={<DashboardModul />} />
      <Route path="/modul/:kodeModul/luar-lbs" element={<LuarLbs />} />
    <Route path="/modul/:kode_modul/perbandingan/:kode_variabel?" element={<PerbandinganModul />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes></BrowserRouter></ThemeProvider>;
}
