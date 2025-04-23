'use client';

import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  data: { name: string; xp: number }[];
}

const XPByWeekChart = ({ data }: Props) => {
  return (
    <div className="w-full h-[500px] flex justify-center items-center">
      <div className="w-4/5">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="username" tick={{ fill: '#f6f8d5' }} />
            <YAxis dataKey="xp" tick={{ fill: '#f6f8d5' }} />
            <Tooltip wrapperStyle={{  backgroundColor: '#ccc' }} />
            <Bar dataKey="xp" fill="#98D2C0" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default XPByWeekChart;