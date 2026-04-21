import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, Type, Palette, Zap } from 'lucide-react';

const BG_OPTIONS = [
  { key: 'blacked',  label: 'Blacked',  color: '#000' },
  { key: 'black',  label: 'Black',  color: '#000' },
  { key: 'navy',   label: 'Navy',   color: '#050d1a' },
  { key: 'forest', label: 'Forest', color: '#05120a' },
  { key: 'sepia',  label: 'Sepia',  color: '#120f08' },
];

const FEATURE_OPTIONS = [
  { key: 'techno', label: 'Techno mode', desc: 'Stroboscopic invert every second' },
  { key: 'particles',   label: 'Particles',        desc: 'Floating ambient particles' },
  { key: 'earthquake', label: 'Earthquake', desc: 'Screen shakes while reading' },
  { key: 'drunk',      label: 'Drunk mode',  desc: 'Text wobbles and sways' },
];

function IconBtn({ onClick, children, active, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
        border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: 8, color: '#fff',
        fontSize: 12, fontWeight: 400,
        padding: '6px 10px', cursor: 'pointer',
        fontFamily: 'inherit', display: 'flex',
        alignItems: 'center', gap: 5,
        transition: 'background 0.2s',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
      onMouseOut={e => e.currentTarget.style.background = active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}
    >
      {children}
    </button>
  );
}

export default function Topbar({
  inReader, title, chapters, activeChapIdx,
  fontSize, onFontChange,
  bgTheme, onBgChange,
  features, onFeatureToggle,
  onBack, onChapterJump,
  progress,
}) {
  const [chapOpen, setChapOpen]   = useState(false);
  const [playOpen, setPlayOpen]   = useState(false);
  const [chapQuery, setChapQuery] = useState('');
  const chapRef  = useRef(null);
  const playRef  = useRef(null);

  // close dropdowns on outside click
  useEffect(() => {
    function handle(e) {
      if (chapRef.current && !chapRef.current.contains(e.target)) setChapOpen(false);
      if (playRef.current && !playRef.current.contains(e.target)) setPlayOpen(false);
    }
    function handleIframe() {
      setChapOpen(false);
      setPlayOpen(false);
    }
    document.addEventListener('mousedown', handle);
    window.addEventListener('rdr-click', handleIframe);
    return () => {
      document.removeEventListener('mousedown', handle);
      window.removeEventListener('rdr-click', handleIframe);
    };
  }, []);

  const filtered = chapters.filter(c =>
    !chapQuery || c.title.toLowerCase().includes(chapQuery.toLowerCase())
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px',
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      position: 'relative', zIndex: 20, flexShrink: 0,
    }}>
      {/* Back */}
      <AnimatePresence>
        {inReader && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: 8, color: '#fff', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ChevronLeft size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Title */}
      <div style={{
        flex: 1, fontSize: 15, fontWeight: 400,
        color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', letterSpacing: '-0.01em',
      }}>
        {title}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>

        {inReader && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginRight: 2 }}>
            {Math.round(progress * 100)}%
          </span>
        )}

        {/* Chapters */}
        {inReader && chapters.length > 0 && (
          <div ref={chapRef} style={{ position: 'relative' }}>
          <IconBtn onClick={() => {
            setPlayOpen(false);
            setChapOpen(o => {
              const next = !o;
              if (next) {
                setTimeout(() => {
                  const active = document.querySelector('[data-active-chap="true"]');
                  if (active) active.scrollIntoView({ block: 'center' });
                }, 150);
              }
              return next;
            });
          }} active={chapOpen}>
              Chapters <ChevronDown size={11} />
            </IconBtn>
            <AnimatePresence>
              {chapOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 'min(340px, 90vw)',
                    background: 'rgba(14,14,18,0.96)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: '0.5px solid rgba(255,255,255,0.14)',
                    borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search chapters…"
                    value={chapQuery}
                    onChange={e => setChapQuery(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: 'none', borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                      color: '#fff', fontSize: 14, fontWeight: 300,
                      padding: '12px 16px', outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {filtered.length === 0 && (
                      <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
                        No results
                      </div>
                    )}
                    {filtered.map(ch => (
                      <div
                        key={ch.index}
                        data-active-chap={ch.index === activeChapIdx ? 'true' : undefined}
                        onClick={() => { onChapterJump(ch); setChapOpen(false); setChapQuery(''); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 16px', fontSize: 13, fontWeight: 300,
                          color: ch.index === activeChapIdx ? '#fff' : 'rgba(255,255,255,0.65)',
                          cursor: 'pointer',
                          background: ch.index === activeChapIdx ? 'rgba(255,255,255,0.06)' : 'transparent',
                          borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                          transition: 'background 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseOut={e => e.currentTarget.style.background = ch.index === activeChapIdx ? 'rgba(255,255,255,0.06)' : 'transparent'}
                      >
                        <div style={{
                          width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
                          background: ch.index === activeChapIdx ? '#fff' : 'rgba(255,255,255,0.2)',
                        }} />
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', minWidth: 24 }}>{ch.index + 1}</span>
                        <span>{ch.title}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Font size */}
        {inReader && (
          <>
            <IconBtn onClick={() => onFontChange(-1)}><Type size={11} />−</IconBtn>
            <IconBtn onClick={() => onFontChange(+1)}><Type size={11} />+</IconBtn>
          </>
        )}

        {/* Playground dropdown */}
        <div ref={playRef} style={{ position: 'relative' }}>
          <IconBtn onClick={() => { setPlayOpen(o => !o); setChapOpen(false); }} active={playOpen}>
            <Zap size={11} /> <ChevronDown size={11} />
          </IconBtn>
          <AnimatePresence>
            {playOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 260,
                  background: 'rgba(14,14,18,0.96)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  border: '0.5px solid rgba(255,255,255,0.14)',
                  borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                }}
              >
                {/* Background */}
                <div style={{ padding: '14px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Palette size={10} /> Background
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {BG_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => onBgChange(opt.key)}
                        title={opt.label}
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: opt.color,
                          border: bgTheme === opt.key ? '2px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer', transition: 'border 0.2s',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div style={{ padding: '10px 0' }}>
                  <div style={{ padding: '4px 16px 10px', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={10} /> Features
                  </div>
                  {FEATURE_OPTIONS.map(f => (
                    <div
                      key={f.key}
                      onClick={() => onFeatureToggle(f.key)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 16px', cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: '#fff', fontWeight: 300 }}>{f.label}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{f.desc}</div>
                      </div>
                      {/* Toggle */}
                      <div style={{
                        width: 36, height: 20, borderRadius: 999,
                        background: features[f.key] ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                        position: 'relative', transition: 'background 0.25s', flexShrink: 0,
                      }}>
                        <div style={{
                          position: 'absolute', top: 3, left: features[f.key] ? 19 : 3,
                          width: 14, height: 14, borderRadius: '50%',
                          background: features[f.key] ? '#000' : 'rgba(255,255,255,0.6)',
                          transition: 'left 0.25s, background 0.25s',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
