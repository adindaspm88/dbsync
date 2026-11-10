import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { useTheme } from "../ThemeContext";

const numberFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });
const variableColors = ["#0284c7", "#16a34a", "#7c3aed", "#db2777", "#ca8a04"];
const dinasColors = ["#f97316", "#dc2626", "#0891b2", "#9333ea", "#65a30d"];

function comparisonRows(data, variables) {
  const variableData = variables.map((variable) => ({
    variable,
    rows: data.filter((row) => row.kode === variable.kode),
  }));
  const barData = variableData.map(({ variable, rows }) => {
    const annual = rows.filter((row) => row.jenis_periode === "tahun");
    const monthly = rows.filter((row) => row.jenis_periode === "bulanan");
    const quarterly = rows.filter((row) => row.jenis_periode === "triwulanan");
    const source = annual.length ? annual : monthly.length ? monthly : quarterly.length ? quarterly : rows;
    return {
      variable: variable.nama,
      [`${variable.kode}_bps`]: annual.length ? Number(annual[0].total_bps || 0) : source.reduce((sum, row) => sum + Number(row.total_bps || 0), 0),
      [`${variable.kode}_dinas`]: annual.length ? Number(annual[0].total_dinas || 0) : source.reduce((sum, row) => sum + Number(row.total_dinas || 0), 0),
    };
  });

  const hasMonthlyData = variableData.some(({ rows }) => rows.some((row) => row.jenis_periode === "bulanan"));
  const periodRows = data.filter((row) => variables.some((variable) => variable.kode === row.kode)
    && (!hasMonthlyData || row.jenis_periode === "bulanan"));
  const byPeriod = new Map();
  for (const row of periodRows) {
    if (!byPeriod.has(row.periode_id)) {
      byPeriod.set(row.periode_id, { month: row.periode_label, order: Number(row.nomor_periode || 0), periodId: row.periode_id });
    }
    const point = byPeriod.get(row.periode_id);
    point[`${row.kode}_bps`] = Number(row.total_bps || 0);
    point[`${row.kode}_dinas`] = Number(row.total_dinas || 0);
  }
  const lineData = [...byPeriod.values()].sort((a, b) => a.order - b.order || Number(a.periodId) - Number(b.periodId));
  return { barData, lineData };
}

function ChartPanel({ title, subtitle, icon: Icon, children }) {
  return (
    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"><Icon size={19}/></span>
        <span><span className="block font-bold text-slate-800 dark:text-slate-100">{title}</span><span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{subtitle}</span></span>
      </header>
      {children}
    </section>
  );
}

export default function VariableGroupCharts({ group, data, variables }) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const groupVariables = group.codes.map((code) => variables.find((variable) => variable.kode === code)).filter(Boolean);
  const { barData, lineData } = useMemo(() => comparisonRows(data, groupVariables), [data, groupVariables]);
  const axisColor = dark ? "#cbd5e1" : "#64748b";
  const gridColor = dark ? "#334155" : "#e2e8f0";
  const tooltipStyle = {
    borderRadius: 12,
    border: `1px solid ${dark ? "#475569" : "#cbd5e1"}`,
    backgroundColor: dark ? "#0f172a" : "#ffffff",
    color: dark ? "#f1f5f9" : "#0f172a",
  };
  const series = groupVariables.flatMap((variable, index) => ([
    { key: `${variable.kode}_bps`, name: `${variable.nama} · BPS`, color: variableColors[index % variableColors.length], variable },
    { key: `${variable.kode}_dinas`, name: `${variable.nama} · Dinas`, color: dinasColors[index % dinasColors.length], variable, dashed: true },
  ]));

  return (
    <section className="space-y-3">
      <h3 className="px-1 text-lg font-bold text-slate-800 dark:text-slate-100">{group.title}</h3>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartPanel title={`Perbandingan ${group.title.toLowerCase()}`} subtitle="Total BPS dan Dinas untuk tahun dan wilayah terpilih" icon={BarChart3}>
          {barData.length ? <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }} barGap={3}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="variable" tick={{ fontSize: 11, fill: axisColor }} interval={0} axisLine={{ stroke: gridColor }} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: axisColor }} tickFormatter={(value) => numberFormat.format(value)} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [numberFormat.format(value), name]}/>
                <Legend wrapperStyle={{ color: axisColor, fontSize: 11 }}/>
                {series.map((item) => <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} radius={[5, 5, 0, 0]} maxBarSize={24}/>) }
              </BarChart>
            </ResponsiveContainer>
          </div> : <p className="flex h-[340px] items-center justify-center text-sm text-slate-500">Data belum tersedia.</p>}
        </ChartPanel>

        <ChartPanel title={`Tren ${group.title.toLowerCase()}`} subtitle="Perubahan bulanan BPS dan Dinas" icon={TrendingUp}>
          {lineData.length ? <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: axisColor }} interval="preserveStartEnd" axisLine={{ stroke: gridColor }} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: axisColor }} tickFormatter={(value) => numberFormat.format(value)} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [numberFormat.format(value), name]}/>
                <Legend wrapperStyle={{ color: axisColor, fontSize: 10 }}/>
                {series.map((item) => <Line key={item.key} type="monotone" dataKey={item.key} name={item.name} stroke={item.color} strokeWidth={2.5} strokeDasharray={item.dashed ? "6 4" : undefined} dot={false} activeDot={{ r: 4 }}/>) }
              </LineChart>
            </ResponsiveContainer>
          </div> : <p className="flex h-[340px] items-center justify-center text-sm text-slate-500">Data tren belum tersedia.</p>}
        </ChartPanel>
      </div>
    </section>
  );
}
