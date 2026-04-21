import { useEffect, useRef, useState } from 'react';
import Epub from 'epubjs';

const AVG_WPM = 250;

function Speedometer({ scrollPct }) {
  const mins = Math.ceil(Math.max(0, (1 - scrollPct) * 60));
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 20,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '0.5px solid rgba(255,255,255,0.12)',
      borderRadius: 12, padding: '8px 14px',
      fontSize: 12, color: 'rgba(255,255,255,0.6)',
      zIndex: 5, pointerEvents: 'none',
    }}>
      {mins <= 1 ? '< 1 min left' : `~${mins} min left`}
    </div>
  );
}

export default function ReaderPane({
  book, fontSize, features,
  onProgress, onChaptersReady,
  activeChapIdx, setActiveChapIdx,
}) {
  const containerRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef      = useRef(null);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    if (!book || !containerRef.current) return;

    if (renditionRef.current) { try { renditionRef.current.destroy(); } catch(e) {} }
    if (bookRef.current) { try { bookRef.current.destroy(); } catch(e) {} }

    const epubBook = Epub(book.buffer, { openAs: 'binary' });
    bookRef.current = epubBook;

    const rendition = epubBook.renderTo(containerRef.current, {
      width: '100%',
      height: '100%',
      flow: 'scrolled-continuous',
      allowScriptedContent: false,
      stylesheet: '',
    });
    renditionRef.current = rendition;

    renditionRef.current = rendition;

    rendition.themes.default({
      body: {
        'background': 'transparent !important',
        'color': 'rgba(255,255,255,0.84) !important',
        'font-family': '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif !important',
        'font-size': `${fontSize}px !important`,
        'font-weight': '300 !important',
        'line-height': '1.85 !important',
        'max-width': '640px !important',
        'margin': '0 auto !important',
        'padding': '32px 20px !important',
      },
      'h1,h2,h3,h4': {
        'color': '#fff !important',
        'font-weight': '300 !important',
        'letter-spacing': '-0.02em !important',
      },
      'p': {
        'margin-bottom': '1.8em !important',
      },
      'a': {
        'color': 'rgba(255,255,255,0.5) !important',
        'text-decoration': 'none !important',
      },
    });

    const saved = JSON.parse(localStorage.getItem('rdr_' + book.fname) || '{}');
    rendition.display(saved.cfi || undefined);

    rendition.on('relocated', (location) => {
      const pct = location.start.percentage || 0;
      setScrollPct(pct);
      onProgress(pct);
      epubBook.loaded.navigation.then(nav => {
        const href = location.start.href;
        const idx = nav.toc.findIndex(item => href.includes(item.href.split('#')[0]));
        if (idx !== -1) setActiveChapIdx(idx);
      });
      localStorage.setItem('rdr_' + book.fname, JSON.stringify({
        cfi: location.start.cfi,
        progress: pct,
        title: book.title,
      }));
    });

    epubBook.loaded.navigation.then(nav => {
      const chapters = nav.toc.map((item, idx) => ({
        title: item.label.trim(),
        href: item.href,
        anchorId: item.href,
        index: idx,
      }));
      onChaptersReady(chapters);
    });

    const onJump = (e) => { try { rendition.display(e.detail); } catch(err) {} };
    window.addEventListener('rdr-jump', onJump);
    rendition.on('click', () => {
      window.dispatchEvent(new CustomEvent('rdr-click'));
    });

    return () => {
      window.removeEventListener('rdr-jump', onJump);
      try { rendition.destroy(); } catch(e) {}
      try { epubBook.destroy(); } catch(e) {}
    };
  }, [book]);

  useEffect(() => {
    if (!renditionRef.current) return;
    try {
      renditionRef.current.themes.register('dark', {
        body: { 'font-size': `${fontSize}px !important` }
      });
      renditionRef.current.themes.select('dark');
    } catch(e) {}
  }, [fontSize]);

  if (!book) return null;

  return (
    <>
      <div
        ref={containerRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}
      />
      {features.speedometer && <Speedometer scrollPct={scrollPct} />}
    </>
  );
}