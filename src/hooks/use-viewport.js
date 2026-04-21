// Viewport breakpoint hook. Inline-style pattern (no Tailwind, no CSS-in-JS)
// means media queries have to live in JS. Single source of truth for every
// screen deciding between desktop/tablet/mobile layouts.
//
// Breakpoints match the skill's recommended ranges:
//   mobile:  < 768px   (phones, small tablets)
//   tablet:  768-1023  (iPads portrait, small laptops)
//   desktop: ≥ 1024px  (laptops, external monitors)
import { useEffect, useState } from 'react';

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
};

function read() {
  if (typeof window === 'undefined') {
    return { width: 1440, isMobile: false, isTablet: false, isDesktop: true };
  }
  const w = window.innerWidth;
  return {
    width: w,
    isMobile: w < BREAKPOINTS.mobile,
    isTablet: w >= BREAKPOINTS.mobile && w < BREAKPOINTS.tablet,
    isDesktop: w >= BREAKPOINTS.tablet,
  };
}

export function useViewport() {
  const [v, setV] = useState(read);
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setV(read()));
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);
  return v;
}
