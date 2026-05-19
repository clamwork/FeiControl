"use client";

import {
  LineChart, Line, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useI18n } from "@/i18n";

const COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#30B0C7', '#32ADE6', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'];

interface DailyData {
  date: string;
  cost: number;
  input: number;
  output: number;
}
interface CostData {
  daily: DailyData[];
  byAgent: Array<{ agent: string; cost: number }>;
  byModel: Array<{ model: string; cost: number }>;
}

export default function Charts({ costData }: { costData: CostData }) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Trend */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          {t("costs.chart.daily_trend")}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={costData.daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: "12px" }} />
            <YAxis stroke="var(--text-muted)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="cost" stroke="var(--accent)" strokeWidth={2} name={t("costs.chart.cost_label")} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cost by Agent */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          {t("costs.chart.by_agent")}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costData.byAgent}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="agent" stroke="var(--text-muted)" style={{ fontSize: "12px" }} />
            <YAxis stroke="var(--text-muted)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="cost" fill="var(--accent)" name={t("costs.chart.cost_label")} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost by Model */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          {t("costs.chart.by_model")}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RePieChart>
            <Pie
              data={costData.byModel}
              dataKey="cost"
              nameKey="model"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry: { model: string; cost: number }) => `${entry.model}: $${(entry.cost ?? 0).toFixed(2)}`}
            >
              {costData.byModel.map((_entry: { model: string; cost: number }, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
          </RePieChart>
        </ResponsiveContainer>
      </div>

      {/* Token Usage */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          {t("costs.chart.token_usage")}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costData.daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: "12px" }} />
            <YAxis stroke="var(--text-muted)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="input" stackId="a" fill="#60A5FA" name={t("costs.chart.input_tokens")} />
            <Bar dataKey="output" stackId="a" fill="#F59E0B" name={t("costs.chart.output_tokens")} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
