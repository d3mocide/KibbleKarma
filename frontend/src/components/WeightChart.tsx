import {
  Area,
  CartesianGrid,
  Line,
  ComposedChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Pet, WeightLog } from "../api/types";
import { useUnits } from "../hooks/useUnits";
import { num } from "../utils/format";

export default function WeightChart({ pet, weights }: { pet: Pet; weights: WeightLog[] }) {
  const u = useUnits();

  if (weights.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-cocoa/50">
        No weigh-ins yet — log one to see the trend line.
      </div>
    );
  }

  const data = weights.map((w) => ({
    date: new Date(w.weighedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    weight: u.fromKg(w.weightKg),
  }));

  const idealMin = pet.idealWeightMinKg != null ? u.fromKg(pet.idealWeightMinKg) : null;
  const idealMax = pet.idealWeightMaxKg != null ? u.fromKg(pet.idealWeightMaxKg) : null;

  const weightsOnly = weights.map((w) => u.fromKg(w.weightKg));
  const min = idealMin ?? Math.min(...weightsOnly);
  const max = idealMax ?? Math.max(...weightsOnly);
  const padding = Math.max(0.5, (max - min) * 0.4);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#81B29A" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#81B29A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EFE6D6" />
        <XAxis dataKey="date" tick={{ fill: "#3D405B", fontSize: 12 }} />
        <YAxis
          domain={[Math.floor(min - padding), Math.ceil(max + padding)]}
          tick={{ fill: "#3D405B", fontSize: 12 }}
          unit={` ${u.weightUnit}`}
          width={56}
        />
        {idealMin != null && idealMax != null && (
          <ReferenceArea
            y1={idealMin}
            y2={idealMax}
            fill="#FDF3EF"
            fillOpacity={0.7}
            label={{ value: "ideal range", fill: "#B95A40", fontSize: 11, position: "insideTopRight" }}
          />
        )}
        <Tooltip
          contentStyle={{ borderRadius: 16, border: "none", backgroundColor: "#FFFFFF", boxShadow: "0 4px 20px rgba(91,74,66,0.08)" }}
          formatter={(value: number) => [`${num(value, 2)} ${u.weightUnit}`, "Weight"]}
        />
        <Area type="monotone" dataKey="weight" stroke="none" fill="url(#weightFill)" />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#81B29A"
          strokeWidth={3}
          dot={{ r: 4, fill: "#6FA088" }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
