"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsView } from "@/lib/learning/analytics";
import { FadeSlideIn } from "@/app/home/components/motion/ui";

type TokenTrendChartProps = {
  data: AnalyticsView["token"]["trend7d"];
};

export function TokenTrendChart({ data }: TokenTrendChartProps) {
  return (
    <FadeSlideIn delay={0.12}>
      <article className="lingstack-card-v2 h-full p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-neutral-950">
            Token 消耗趋势（近 7 天）
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="size-2 rounded-full bg-[#2170E4]" />
            消耗量
          </div>
        </div>

        <div className="h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="tokenTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2170E4" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#2170E4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#E8EEFF"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: "#2170E4", strokeOpacity: 0.15 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E8E8E8",
                  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                }}
                formatter={(value) => [
                  `${Number(value).toLocaleString()} tokens`,
                  "消耗量",
                ]}
              />
              <Area
                type="monotone"
                dataKey="tokens"
                stroke="#2170E4"
                strokeWidth={2.5}
                fill="url(#tokenTrendFill)"
                animationDuration={800}
                dot={false}
                activeDot={{ r: 5, fill: "#2170E4", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>
    </FadeSlideIn>
  );
}
