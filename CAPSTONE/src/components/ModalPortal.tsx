// ./components/ModalPortal.tsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;

  const containerRef = useRef<HTMLDivElement | null>(null);
  if (!containerRef.current) {
    containerRef.current = document.createElement('div');
  }

  useEffect(() => {
    const container = containerRef.current!;
    document.body.appendChild(container);

    // inline styles agar tak terganggu CSS lain
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.right = '0';
    container.style.bottom = '0';
    container.style.zIndex = '1000';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.pointerEvents = 'auto';

    return () => {
      if (container.parentNode === document.body) document.body.removeChild(container);
    };
  }, []);

  return createPortal(children, containerRef.current);
}
