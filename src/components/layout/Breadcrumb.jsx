import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getModules, getModuleVariables } from "../../services/dashboardService";

const labels = { "luar-lbs": "Luas Tanam Luar LBS", perbandingan: "Perbandingan" };
export default function Breadcrumb() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  const moduleCode = parts[1];
  const [modules,setModules]=useState([]);
  const [variables,setVariables]=useState([]);
  useEffect(()=>{getModules().then(setModules).catch(()=>{});},[]);
  useEffect(()=>{if(moduleCode)getModuleVariables(moduleCode).then(setVariables).catch(()=>setVariables([]));},[moduleCode]);
  const links = [{ label: "Pilih Modul", to: "/" }];
  if (parts[0] === "modul" && parts[1]) {
    links.push({ label: modules.find((m)=>m.kode===parts[1])?.nama||parts[1], to: `/modul/${parts[1]}` });
    if (parts[2] === "luar-lbs") links.push({ label: labels[parts[2]] });
    if (parts[2] === "perbandingan") links.push({ label: `${labels[parts[2]]} · ${variables.find((v)=>v.kode===parts[3])?.nama||parts[3]}` });
  }
  return <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center text-sm text-slate-500">
    {links.map((item,index)=><div key={`${item.label}-${index}`} className="flex items-center">{index>0&&<ChevronRight size={14} className="mx-2"/>}{item.to&&index!==links.length-1?<Link className="hover:text-emerald-700" to={item.to}>{item.label}</Link>:<span className={index===links.length-1?"font-medium text-slate-700":""}>{item.label}</span>}</div>)}
  </nav>;
}
