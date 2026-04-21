import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export default function Library({ getBookMeta, library, removeFromLibrary, onOpen }) {
  const [fname, setFname]   = useState('');
  const [books, setBooks]   = useState([]);
  const [err, setErr]       = useState('');

  useEffect(() => {
    setBooks(library().map(f => ({ fname: f, ...getBookMeta(f) })));
  }, []);

  function refresh() {
    setBooks(library().map(f => ({ fname: f, ...getBookMeta(f) })));
  }

  function remove(e, f) {
    e.stopPropagation();
    removeFromLibrary(f);
    refresh();
  }

  function attempt() {
    let f = fname.trim();
    if (!f) return;
    if (!f.endsWith('.bin')) f += '.bin';
    setFname('');
    onOpen(f, true);
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 18px 60px' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Your</div>
          <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.03em', color: '#fff' }}>Library</div>
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <input
            type="text"
            value={fname}
            onChange={e => { setFname(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            placeholder="filename.bin"
            style={{
              flex: 1, background: 'rgba(255,255,255,0.07)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 300,
              padding: '11px 14px', outline: 'none', fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
          <button
            onClick={attempt}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '0.5px solid rgba(255,255,255,0.15)',
              borderRadius: 12, color: '#fff', fontSize: 14,
              padding: '11px 18px', cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'inherit', transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            Open
          </button>
        </div>

        {err && <div style={{ fontSize: 12, color: 'rgba(255,80,80,0.8)', marginBottom: 16, marginTop: -12 }}>{err}</div>}

        {/* Book list */}
        <AnimatePresence>
          {books.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.2)' }}
            >
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📚</div>
              <div style={{ fontSize: 15, fontWeight: 300 }}>No books yet</div>
              <div style={{ fontSize: 12, marginTop: 6, color: 'rgba(255,255,255,0.15)' }}>Enter a filename above</div>
            </motion.div>
          ) : books.map((b, i) => (
            <motion.div
              key={b.fname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onOpen(b.fname, false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '0.5px solid rgba(255,255,255,0.09)',
                borderRadius: 18, padding: '15px 16px',
                cursor: 'pointer', marginBottom: 10,
                transition: 'background 0.2s, transform 0.15s',
                position: 'relative',
              }}
              whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.09)' }}
            >
              <div style={{
                width: 40, height: 54, borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>📖</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 400, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                  {b.title || b.fname.replace('.bin', '')}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                  {b.progress > 0 ? Math.round(b.progress * 100) + '% read' : 'Not started'}
                </div>
                <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: ((b.progress || 0) * 100) + '%', background: 'rgba(255,255,255,0.4)', borderRadius: 999 }} />
                </div>
              </div>
              <button
                onClick={e => remove(e, b.fname)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,80,80,0.4)', padding: 6,
                  transition: 'color 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.color = 'rgba(255,80,80,0.8)'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,80,80,0.4)'}
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
