/* ═══ DataSourceBadge — Icon + name + description ═══
   Used for displaying authoritative data sources in a grid.
*/

import type { ReactNode } from 'react';

interface DataSourceBadgeProps {
  icon: ReactNode;
  name: string;
  desc: string;
}

export default function DataSourceBadge({ icon, name, desc }: DataSourceBadgeProps) {
  return (
    <div style={{
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start',
      background: '#FFFFFF',
      borderRadius: 14,
      border: '1px solid rgba(26,26,24,0.08)',
      padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(26,26,24,0.05)',
    }}>
      <div style={{
        flexShrink: 0,
        width: 36,
        height: 36,
        borderRadius: 10,
        background: '#FFF0EB',
        color: '#D4714E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#1A1A18',
          marginBottom: 2,
        }}>
          {name}
        </div>
        <div style={{
          fontSize: 13,
          lineHeight: 1.5,
          color: '#6E6A63',
        }}>
          {desc}
        </div>
      </div>
    </div>
  );
}
