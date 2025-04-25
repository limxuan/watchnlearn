'use client';

import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  data: { name: string; xp: number }[];
}

const XPByWeekChart = ({ data }: Props) => {
  return (
    <div className="w-full flex justify-center items-center py-8">
    <div className="w-full md:w-[90%] h-[400px] md:h-[500px]">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top:20, right:40, left:60, bottom:20}} barCategoryGap={10} barGap={5}>
          <XAxis dataKey="username" tick={{ fill: '#f6f8d5' }} w-full />
          <YAxis dataKey="xp" tick={{ fill: '#f6f8d5' }} />
          <Tooltip />
          <Bar dataKey="xp" fill="#98D2C0" barSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
  );
};

export default XPByWeekChart;