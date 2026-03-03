"use client";

import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-white/10 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-sm text-white/70 mb-1">
          Semester: <span className="text-white font-medium">{label}</span>
        </p>
        <p className="text-xl font-bold text-blue-400">
          GPA: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
}

export default function PerformanceChart() {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Use ResizeObserver so we only render the chart when the container
    // has a real, non-zero size.
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width, height });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = [
    { semester: "I-I", gpa: 7.6 },
    { semester: "I-II", gpa: 8.1 },
    { semester: "II-I", gpa: 8.42 },
    { semester: "II-II", gpa: 8.85 },
  ];

  const hasSize = size.width > 0 && size.height > 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">
        Performance Trend (GPA)
      </h2>

      <div
        ref={containerRef}
        className="h-64 w-full min-w-[200px] min-h-[200px]"
      >
        {hasSize && (
          <ResponsiveContainer width={size.width} height={size.height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="semester" stroke="#ffffff80" />
              <YAxis domain={[0, 10]} stroke="#ffffff80" />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#3b82f6", strokeDasharray: "3 3" }}
              />
              <Line
                type="monotone"
                dataKey="gpa"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}