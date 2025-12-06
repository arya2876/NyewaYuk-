'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const donutColors = ['#0ea5e9', '#bfdbfe'];

export function DonutChart({ data }) {
  return (
    <div className="w-28 h-28 min-w-0 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={28} outerRadius={40} dataKey="value" strokeWidth={0}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={donutColors[idx % donutColors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyLineChart({ data }) {
  return (
    <div className="w-full h-40 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
