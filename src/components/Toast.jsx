import React, { useEffect, useState } from 'react';

export default function Toast({ message, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 2800);
      return () => clearTimeout(t);
    }
}, [message, onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: '2rem', left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 16}px)`,
      background: '#1e2330', color: 'var(--text-1)',
      border: '1px solid var(--border-med)', borderLeft: '3px solid var(--c-elec)',
      padding: '0.7rem 1.5rem', borderRadius: 100, fontSize: '0.82rem',
      fontWeight: 500, boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      opacity: visible ? 1 : 0, pointerEvents: 'none',
      transition: 'all 0.3s cubic-bezier(0.34,1.5,0.64,1)',
      zIndex: 999, whiteSpace: 'nowrap'
    }}>
      {message}
    </div>
  );
}