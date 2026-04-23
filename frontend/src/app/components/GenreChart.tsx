import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { MOCK_GENRE_PREFERENCES } from '../data/mockData';

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1F1F1F', border: '1px solid #333', borderRadius: 8,
        padding: '8px 12px', fontSize: '0.8rem', color: '#fff',
      }}>
        <p style={{ margin: 0 }}>{payload[0].value} films watched</p>
      </div>
    );
  }
  return null;
};

// Generate a stable random ID for the chart instance
const generateChartId = () => {
  return `chart-${Math.random().toString(36).substr(2, 9)}`;
};

export const GenreChart: React.FC = () => {
  const data = MOCK_GENRE_PREFERENCES;
  // Use useMemo to keep the same ID across re-renders
  const chartId = React.useMemo(() => generateChartId(), []);

  return (
    <div>
      <p style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Genre Preferences
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="genre"
            width={52}
            tick={{ fill: '#888', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(229,9,20,0.05)' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={10}>
            {data.map((entry, index) => (
              <Cell key={`${chartId}-cell-${entry.id}-${index}`} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Genre learning progress bars
export const GenreProgress: React.FC = () => {
  const data = MOCK_GENRE_PREFERENCES.slice(0, 5);
  const max = Math.max(...data.map(d => d.count));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(item => (
        <div key={item.genre}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: '#ccc', fontSize: '0.78rem' }}>{item.genre}</span>
            <span style={{ color: '#666', fontSize: '0.75rem' }}>{item.count} films</span>
          </div>
          <div style={{ background: '#2a2a2a', borderRadius: 4, height: 5, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(item.count / max) * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
                borderRadius: 4,
                transition: 'width 1s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};