import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Card } from "flowbite-react";
import { TrendingUp } from "lucide-react";

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(value);

export default function LineChartCard({
  data,
  title = "Tren Perbandingan",
  description = "Perbandingan nilai BPS dan Dinas",
  satuan = "",
  color = "sky",
}) {
  const colorMap = {
    sky: {
      bg: "bg-sky-100",
      text: "text-sky-700",
      border: "#e0f2fe",
      bps: "#0ea5e9",
      dinas: "#ea580c",
    },

    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "#d1fae5",
      bps: "#10b981",
      dinas: "#f59e0b",
    },

    amber: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "#fde68a",
      bps: "#f59e0b",
      dinas: "#dc2626",
    },
  };

  const theme =
    colorMap[color] || colorMap.sky;
  const isEmpty = !data || data.length === 0;

  return (
    <Card className="rounded-3xl border border-sky-100 shadow-sm bg-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl ${theme.bg} flex items-center justify-center`}>
            <TrendingUp
              size={20}
              className={theme.text}
            />
          </div>

          <div>
            <h5 className="text-lg font-semibold text-left text-slate-800">
              {title}
            </h5>

            <p className="text-sm text-left text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500"></div>

            <span className="text-slate-600">
              Nilai BPS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>

            <span className="text-slate-600">
              Nilai Dinas
            </span>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
          Tidak terdapat data pada variabel ini
        </div>
      ) : (
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              {/* GRID */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0f2fe"
                vertical={false}
              />

              {/* X */}
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                stroke="#94a3b8"
              />

              {/* Y */}
              <YAxis
                tickFormatter={(value) =>
                  formatNumber(value)
                }
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                stroke="#94a3b8"
              />

              {/* TOOLTIP */}
              <Tooltip
                formatter={(value, name) => [
                  `${formatNumber(value)} ${satuan}`,
                  name === "nilai_bps"
                    ? "Nilai BPS"
                    : "Nilai Dinas",
                ]}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #e0f2fe",
                  boxShadow:
                    "0 4px 14px rgba(0,0,0,0.08)",
                  backgroundColor: "white",
                }}
              />

              {/* LEGEND */}
              <Legend />

              {/* LINE BPS */}
              <Line
                type="monotone"
                dataKey="nilai_bps"
                name="Nilai BPS"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#0ea5e9",
                }}
                activeDot={{
                  r: 7,
                }}
                animationDuration={900}
              />

              {/* LINE DINAS */}
              <Line
                type="monotone"
                dataKey="nilai_dinas"
                name="Nilai Dinas"
                stroke="#ea580c"
                strokeWidth={3}
                strokeDasharray="6 4"
                dot={{
                  r: 4,
                  fill: "#ea580c",
                }}
                activeDot={{
                  r: 7,
                }}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}