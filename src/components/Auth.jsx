import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { sha256, CORRECT_HASH } from '../utils/crypto';

export default function Auth({ onAuth }) {
  const [pw, setPw]       = useState('');
  const [show, setShow]   = useState(false);
  const [err, setErr]     = useState('');
  const [shaking, setShaking] = useState(false);

  async function attempt() {
    if (!pw) return;
    const hash = await sha256(pw);
    if (hash === CORRECT_HASH) {
      onAuth(pw);
    } else {
      setErr('Incorrect');
      setShaking(true);
      setTimeout(() => { setShaking(false); setErr(''); }, 600);
      setPw('');
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      {/* ambient blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: '#1a3a8f', filter: 'blur(100px)', opacity: 0.2, top: -100, left: -100 }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: '#5b21b6', filter: 'blur(100px)', opacity: 0.15, bottom: -80, right: -60 }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '0.5px solid rgba(255,255,255,0.15)',
          borderRadius: 24,
          padding: '44px 36px',
          width: '100%', maxWidth: 320,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 20,
          position: 'relative',
        }}
      >
        <motion.div
          animate={shaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
        >
          {/* Title */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 36, fontWeight: 200, letterSpacing: '0.15em',
              color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
            }}>RDR</div>
          </div>

          {/* Input */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              placeholder="Password"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: `0.5px solid ${err ? 'rgba(255,80,80,0.6)' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 12,
                color: '#fff',
                fontSize: 17, fontWeight: 300,
                padding: '13px 48px 13px 16px',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
            />
            <button
              onClick={() => setShow(s => !s)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)', padding: 4, display: 'flex',
              }}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error */}
          <div style={{ height: 12, fontSize: 12, color: 'rgba(255,80,80,0.8)', marginTop: -8 }}>
            {err}
          </div>

          {/* Button */}
          <button
            onClick={attempt}
            style={{
              width: '100%', background: '#fff', border: 'none', borderRadius: 12,
              color: '#000', fontSize: 16, fontWeight: 500, padding: '14px',
              cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em',
              transition: 'opacity 0.15s, transform 0.1s',
            }}
            onMouseOver={e => e.target.style.opacity = '0.88'}
            onMouseOut={e => e.target.style.opacity = '1'}
            onMouseDown={e => e.target.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.target.style.transform = 'scale(1)'}
          >
            Unlock
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
