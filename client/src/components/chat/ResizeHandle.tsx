import { useState, useCallback } from 'react';

interface ResizeHandleProps {
  onDrag: (clientX: number) => void;
}

export default function ResizeHandle({ onDrag }: ResizeHandleProps) {
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);

    const onMouseMove = (ev: MouseEvent) => onDrag(ev.clientX);
    const onMouseUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [onDrag]);

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => !dragging && setHovered(false)}
      style={{
        width: 8,
        cursor: 'col-resize',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        background: dragging ? 'rgba(212,113,78,0.06)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <div
        style={{
          width: 3,
          height: 40,
          borderRadius: 2,
          background: dragging ? '#D4714E' : hovered ? 'rgba(212,113,78,0.4)' : '#DDD9D1',
          transition: 'all 0.15s',
        }}
      />
    </div>
  );
}
