import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Auth from './components/Auth';
import Topbar from './components/Topbar';
import Library from './components/Library';
import ReaderPane from './components/ReaderPane';
import Particles from './components/Particles';
import { useStore } from './hooks/useStore';
import { decryptBin } from './utils/crypto';
import { parseEpub, parseTxt } from './utils/epub';

const BG_COLORS = {
  blacked:  { bg: '#000', blob1: '#000000', blob2: '#010004' },
  black:  { bg: '#000', blob1: '#1a3a8f', blob2: '#5b21b6' },
  navy:   { bg: '#050d1a', blob1: '#1a4080', blob2: '#0a2060' },
  forest: { bg: '#05120a', blob1: '#0a3a15', blob2: '#143d20' },
  sepia:  { bg: '#120f08', blob1: '#3a2a10', blob2: '#2a1a08' },
};

export default function App() {
  const store = useStore();
  const [loading, setLoading]         = useState(false);
  const [loadMsg, setLoadMsg]         = useState('');
  const [progress, setProgress]       = useState(0);
  const [activeChapIdx, setActiveChap] = useState(-1);
  const [chapters, setChapters]       = useState([]);
  const [errMsg, setErrMsg]           = useState('');

  const theme = BG_COLORS[store.bgTheme] || BG_COLORS.black;

  // earthquake
useEffect(() => {
  const el = document.getElementById('app-root');
  if (!el) return;
  if (!store.features.earthquake) { el.style.animation = ''; return; }
  const style = document.createElement('style');
  style.id = 'eq-style';
  style.textContent = `@keyframes quake {
    0%,100%{transform:translate(0,0) rotate(0deg)}
    20%{transform:translate(-3px,2px) rotate(-0.5deg)}
    40%{transform:translate(3px,-2px) rotate(0.5deg)}
    60%{transform:translate(-2px,3px) rotate(-0.3deg)}
    80%{transform:translate(2px,-1px) rotate(0.3deg)}
  }`;
  document.head.appendChild(style);
  el.style.animation = 'quake 0.4s infinite';
  return () => {
    el.style.animation = '';
    document.getElementById('eq-style')?.remove();
  };
}, [store.features.earthquake]);

// drunk
useEffect(() => {
  const el = document.getElementById('app-root');
  if (!el) return;
  if (!store.features.drunk) { el.style.animation = ''; return; }
  const style = document.createElement('style');
  style.id = 'drunk-style';
  style.textContent = `@keyframes drunk {
    0%{transform:rotate(0deg) translateX(0px)}
    25%{transform:rotate(1.5deg) translateX(4px)}
    50%{transform:rotate(0deg) translateX(0px)}
    75%{transform:rotate(-1.5deg) translateX(-4px)}
    100%{transform:rotate(0deg) translateX(0px)}
  }`;
  document.head.appendChild(style);
  el.style.animation = 'drunk 3s ease-in-out infinite';
  return () => {
    el.style.animation = '';
    document.getElementById('drunk-style')?.remove();
  };
}, [store.features.drunk]);

// cursor trail
useEffect(() => {
  if (!store.features.cursortrail) return;
  function onMove(e) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed;left:${e.clientX}px;top:${e.clientY}px;
      width:6px;height:6px;border-radius:50%;
      background:rgba(255,255,255,0.7);
      pointer-events:none;z-index:9999;
      transform:translate(-50%,-50%);
      transition:opacity 0.6s,transform 0.6s;
    `;
    document.body.appendChild(dot);
    setTimeout(() => { dot.style.opacity = '0'; dot.style.transform = 'translate(-50%,-50%) scale(0)'; }, 50);
    setTimeout(() => dot.remove(), 650);
  }
  window.addEventListener('mousemove', onMove);
  return () => window.removeEventListener('mousemove', onMove);
}, [store.features.cursortrail]);

  //techno feature 
  useEffect(() => {
    const el = document.getElementById('app-root');
    if (!el) return;
    if (!store.features.techno) {
      el.style.filter = '';
      return;
    }
    const t = setInterval(() => {
      const el = document.getElementById('app-root');
      if (!el) return;
      el.style.filter = el.style.filter === 'invert(1)' ? '' : 'invert(1)';
    }, 80);
    return () => {
      clearInterval(t);
      const el = document.getElementById('app-root');
      if (el) el.style.filter = '';
    };
  }, [store.features.techno]);

  function onAuth(pw) {
    store.setPassword(pw);
    store.setAuthed(true);
  }

  async function openBook(fname, addToLibrary) {
    setLoading(true);
    setLoadMsg('Fetching…');
    setErrMsg('');
    try {
      const resp = await fetch('./lib/' + fname);
      if (!resp.ok) throw new Error('File not found: ' + fname);

      setLoadMsg('Decrypting…');
      const ab = await resp.arrayBuffer();
      const { decrypted, origName } = await decryptBin(ab, store.password);

      setLoadMsg('Parsing…');
      let parsed;
      if (/\.epub$/i.test(origName)) {
        parsed = await parseEpub(decrypted);
      } else {
        parsed = parseTxt(decrypted, origName);
      }

      if (addToLibrary) store.saveToLibrary(fname);
      store.saveBookMeta(fname, { title: parsed.title, progress: 0 });
      store.setBook({ ...parsed, fname, buffer: decrypted });
      store.setView('reader');
      setChapters(parsed.chapters);
      setProgress(0);
      setActiveChap(0);
    } catch (e) {
      setErrMsg(e.message);
      setTimeout(() => setErrMsg(''), 3000);
    } finally {
      setLoading(false);
      setLoadMsg('');
    }
  }

  function goBack() {
    store.setView('library');
    store.setBook(null);
    setChapters([]);
    setProgress(0);
  }

  const onProgress = useCallback((pct) => {
    setProgress(pct);
    if (store.book) {
      store.saveBookMeta(store.book.fname, { title: store.book.title, progress: pct });
    }
  }, [store.book]);

  function jumpToChapter(ch) {
    // stored on renditionRef in ReaderPane — need to expose it
    // simplest: use a custom event
    window.dispatchEvent(new CustomEvent('rdr-jump', { detail: ch.href }));
    setActiveChap(ch.index);
  }

  if (!store.authed) return <Auth onAuth={onAuth} />;

  return (
    <div id="app-root" style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: theme.bg, color: '#fff', position: 'relative', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
      transition: 'background 0.5s',
    }}>
      {/* Ambient blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: theme.blob1, filter: 'blur(120px)', opacity: 0.45, top: -150, left: -100, transition: 'background 0.5s' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: theme.blob2, filter: 'blur(120px)', opacity: 0.35, bottom: -100, right: -80, transition: 'background 0.5s' }} />
      </div>

      {store.features.particles && <Particles />}

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 2 }}>
        <Topbar
          inReader={store.view === 'reader'}
          title={store.view === 'reader' ? (store.book?.title || '') : 'Library'}
          chapters={chapters}
          activeChapIdx={activeChapIdx}
          fontSize={store.fontSize}
          onFontChange={store.changeFontSize}
          bgTheme={store.bgTheme}
          onBgChange={store.changeBg}
          features={store.features}
          onFeatureToggle={store.toggleFeature}
          onBack={goBack}
          onChapterJump={jumpToChapter}
          progress={progress}
        />

        {/* Reading progress bar */}
        {store.view === 'reader' && (
          <div style={{ height: 1.5, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ height: '100%', width: (progress * 100) + '%', background: 'rgba(255,255,255,0.5)', transition: 'width 0.2s' }} />
          </div>
        )}

        {/* Error toast */}
        <AnimatePresence>
          {errMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(200,50,50,0.9)', backdropFilter: 'blur(20px)',
                border: '0.5px solid rgba(255,100,100,0.3)',
                borderRadius: 10, padding: '8px 16px',
                fontSize: 13, color: '#fff', zIndex: 30, whiteSpace: 'nowrap',
              }}
            >
              {errMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 30,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.1)',
                borderTopColor: 'rgba(255,255,255,0.6)',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{loadMsg}</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Views */}
        <AnimatePresence mode="wait">
          {store.view === 'library' ? (
            <motion.div
              key="lib"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <Library
                library={store.library}
                getBookMeta={store.getBookMeta}
                removeFromLibrary={store.removeFromLibrary}
                onOpen={openBook}
              />
            </motion.div>
          ) : (
            <motion.div
              key="reader"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <ReaderPane
                book={store.book}
                fontSize={store.fontSize}
                features={store.features}
                onProgress={onProgress}
                onChaptersReady={setChapters}
                activeChapIdx={activeChapIdx}
                setActiveChapIdx={setActiveChap}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
