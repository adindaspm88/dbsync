import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { Card } from "flowbite-react";
import { BarChart3 } from "lucide-react";

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(value);

export default function BarChartCard({
  data = [],
  title = "Perbandingan Data",
  subtitle = "Perbandingan sumber data",
  satuan = "",

  xKey = "month",

  leftKey = "nilai_bps",
  rightKey = "nilai_dinas",

  leftLabel = "BPS",
  rightLabel = "Dinas",

  leftColor = "#0ea5e9",
  rightColor = "#ea580c",
}) {
  const isEmpty = !data || data.length === 0;

  return (
    <Card className="rounded-3xl border border-sky-100 shadow-sm bg-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
            <BarChart3
              size={20}
              className="text-sky-700"
            />
          </div>

          <div>
            <h5 className="text-lg text-left font-semibold text-slate-800">
              {title}
            </h5>

            <p className="text-sm text-left text-slate-500">
              {subtitle}
            </p>
          </div>
        </div>

        {/* CUSTOM LEGEND */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: leftColor }}
            />

            <span className="text-slate-600">
              {leftLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: rightColor }}
            />

            <span className="text-slate-600">
              {rightLabel}
            </span>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
          Tidak terdapat data
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 5,
              }}
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0f2fe"
                vertical={false}
              />

              <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
              />

              <YAxis
                tickFormatter={formatNumber}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
              />

              <Tooltip
                formatter={(value, name) => [
                  `${formatNumber(value)} ${
                    satuan || ""
                  }`,
                  name,
                ]}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #e0f2fe",
                  boxShadow:
                    "0 4px 14px rgba(0,0,0,0.08)",
                  backgroundColor: "white",
                }}
              />

              <Bar
                dataKey={leftKey}
                name={leftLabel}
                fill={leftColor}
                radius={[10, 10, 0, 0]}
                barSize={28}
              />

              <Bar
                dataKey={rightKey}
                name={rightLabel}
                fill={rightColor}
                radius={[10, 10, 0, 0]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}