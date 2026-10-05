import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './DriftWall.css';

const FALLBACK_IDS = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164];
const FALLBACK_HEIGHTS = [380, 460, 320, 500, 400, 360, 480, 340, 420, 520, 340, 460, 380, 500, 360];

const DEFAULT_ITEMS = Array.from({ length: 15 }, (_, i) => ({
  id: `fallback-${i}`,
  img: `https://picsum.photos/id/${FALLBACK_IDS[i % FALLBACK_IDS.length]}/600/${FALLBACK_HEIGHTS[i % FALLBACK_HEIGHTS.length]}`,
  image: `https://picsum.photos/id/${FALLBACK_IDS[i % FALLBACK_IDS.length]}/600/${FALLBACK_HEIGHTS[i % FALLBACK_HEIGHTS.length]}`,
  height: FALLBACK_HEIGHTS[i % FALLBACK_HEIGHTS.length],
  title: `Tile ${i + 1}`,
}));

const useMedia = (queries, values, defaultValue) => {
  const get = useCallback(() => {
    if (typeof window === 'undefined') return defaultValue;
    return values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  }, [queries, values, defaultValue]);

  const [value, setValue] = useState(get);
  useEffect(() => {
    const handler = () => setValue(get());
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
  }, [queries, get]);
  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};
const preloadImages = async urls => {
  await Promise.all(
    urls.map(src => new Promise(res => { const img = new Image(); img.src = src; img.onload = img.onerror = () => res(); }))
  );
};

const DriftWall = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  onClose,
  className = '',
  style,
}) => {
  const normalized = useMemo(() => {
    const src = items && items.length ? items : DEFAULT_ITEMS;
    return src.map((it, idx) => ({
      id: String(it.id ?? `${idx}-${it.img ?? it.image}`),
      img: it.img ?? it.image,
      height: it.height ?? FALLBACK_HEIGHTS[idx % FALLBACK_HEIGHTS.length],
      url: it.url ?? it.href,
      title: it.title ?? it.text ?? '',
    }));
  }, [items]);

  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:380px)'],
    [5, 4, 3, 2],
    2
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);
  const hasMounted = useRef(false);
  const gridRef = useRef(null);

  useEffect(() => {
    setImagesReady(false);
    preloadImages(normalized.map(i => i.img)).then(() => setImagesReady(true));
  }, [normalized]);

  const effectiveWidth = width || (typeof window !== 'undefined' ? window.innerWidth - 32 : 1200);

  const isCompact = columns <= 2;

  const grid = useMemo(() => {
    if (!effectiveWidth || effectiveWidth < 100) return [];
    const colHeights = new Array(columns).fill(0);
    const gutter = isCompact ? 8 : 12;
    const totalGutter = gutter * (columns - 1);
    const columnWidth = (effectiveWidth - totalGutter) / columns;
    return normalized.map((child, idx) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (columnWidth + gutter);
      let h = child.height / 2;
      if (isCompact) {
        const isLandscape = child.height < 350;
        const variance = (idx % 3) * 6;
        if (isLandscape) h = 112 + variance + (idx % 2) * 4;
        else h = 168 + variance + (idx % 2) * 6;
      } else {
        const isLandscape = child.height < 350;
        h = isLandscape ? 190 + (idx % 3) * 12 : 290 + (idx % 3) * 14;
      }
      const gapY = isCompact ? 8 : 12;
      const y = colHeights[col];
      colHeights[col] += h + gapY;
      return { ...child, x, y, w: columnWidth, h };
    });
  }, [columns, normalized, effectiveWidth, isCompact]);

  const contentHeight = useMemo(() => {
    if (!grid.length) return 0;
    return Math.max(...grid.map(g => g.y + g.h));
  }, [grid]);

  const getInitialPosition = item => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: item.x, y: item.y };
    let dir = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'];
      dir = dirs[Math.floor(Math.random() * dirs.length)];
    }
    switch (dir) {
      case 'top': return { x: item.x, y: -200 };
      case 'bottom': return { x: item.x, y: window.innerHeight + 200 };
      case 'left': return { x: -200, y: item.y };
      case 'right': return { x: window.innerWidth + 200, y: item.y };
      case 'center': return { x: rect.width / 2 - item.w / 2, y: contentHeight / 2 - item.h / 2 };
      default: return { x: item.x, y: item.y + 100 };
    }
  };

  useLayoutEffect(() => {
    if (!imagesReady || !grid.length) return;
    grid.forEach((item, index) => {
      const sel = `[data-key="${item.id}"]`;
      const props = { x: item.x, y: item.y, width: item.w, height: item.h };
      if (!hasMounted.current) {
        const init = getInitialPosition(item);
        gsap.fromTo(sel, { opacity: 0, x: init.x, y: init.y, width: item.w, height: item.h, ...(blurToFocus && { filter: 'blur(10px)' }) },
          { opacity: 1, ...props, ...(blurToFocus && { filter: 'blur(0px)' }), duration: 0.8, ease: 'power3.out', delay: index * stagger });
      } else {
        gsap.to(sel, { ...props, duration, ease, overwrite: 'auto' });
      }
    });
    hasMounted.current = true;
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease, contentHeight]);

  const handleEnter = (e, item) => {
    const sel = `[data-key="${item.id}"]`;
    if (scaleOnHover) gsap.to(sel, { scale: hoverScale, duration: 0.3, ease: 'power2.out' });
    if (colorShiftOnHover) {
      const ov = e.currentTarget.querySelector('.masonry-color-overlay');
      if (ov) gsap.to(ov, { opacity: 0.3, duration: 0.3 });
    }
  };
  const handleLeave = (e, item) => {
    const sel = `[data-key="${item.id}"]`;
    if (scaleOnHover) gsap.to(sel, { scale: 1, duration: 0.3, ease: 'power2.out' });
    if (colorShiftOnHover) {
      const ov = e.currentTarget.querySelector('.masonry-color-overlay');
      if (ov) gsap.to(ov, { opacity: 0, duration: 0.3 });
    }
  };

  const handleExit = () => {
    if (!onClose) return;
    const els = gridRef.current?.querySelectorAll('[data-key]');
    if (!els?.length) { onClose(); return; }
    gsap.to(els, {
      opacity: 0, y: '+=40', filter: blurToFocus ? 'blur(8px)' : 'none',
      duration: 0.35, ease: 'power2.in', stagger: 0.02,
      onComplete: () => onClose()
    });
  };

  return (
    <div className={`drift-wall drift-wall--masonry ${className}`.trim()} style={style}>
      {onClose && (
        <button type="button" className="masonry-close" onClick={handleExit} aria-label="Tutup album">
          <span className="masonry-close__icon">×</span> Tutup
        </button>
      )}
      <div ref={containerRef} className="masonry-list" style={{ height: contentHeight || 'auto', minHeight: contentHeight ? `${contentHeight}px` : '320px' }}>
        <div ref={gridRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
          {grid.map(item => (
            <div
              key={item.id}
              data-key={item.id}
              className="masonry-item cursor-target"
              onMouseEnter={e => handleEnter(e, item)}
              onMouseLeave={e => handleLeave(e, item)}
              title={item.title}
            >
              <div className="masonry-item__img" style={{ backgroundImage: `url(${item.img})` }}>
                {colorShiftOnHover && <div className="masonry-color-overlay" />}
                {item.title && <span className="masonry-item__label">{item.title}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriftWall;
