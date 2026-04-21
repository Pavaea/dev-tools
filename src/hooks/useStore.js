import { useState, useCallback } from 'react';

export function useStore() {
  const [password, setPassword]     = useState('');
  const [authed, setAuthed]         = useState(false);
  const [view, setView]             = useState('library'); // library | reader
  const [book, setBook]             = useState(null);      // { title, html, chapters, fname }
  const [fontSize, setFontSize]     = useState(() => parseInt(localStorage.getItem('rdr_fs') || '17'));
  const [bgTheme, setBgTheme]       = useState(() => localStorage.getItem('rdr_bg') || 'black');
  const [features, setFeatures]     = useState({
    particles: false,
    typewriter: false,
    speedometer: false,
    techno: false,
    earthquake: false,
    drunk: false,
    cursortrail: false,
  });

  const library = useCallback(() => {
    return JSON.parse(localStorage.getItem('rdr_library') || '[]');
  }, []);

  const saveToLibrary = useCallback((fname) => {
    const saved = JSON.parse(localStorage.getItem('rdr_library') || '[]');
    if (!saved.includes(fname)) {
      saved.push(fname);
      localStorage.setItem('rdr_library', JSON.stringify(saved));
    }
  }, []);

  const removeFromLibrary = useCallback((fname) => {
    const saved = JSON.parse(localStorage.getItem('rdr_library') || '[]').filter(f => f !== fname);
    localStorage.setItem('rdr_library', JSON.stringify(saved));
  }, []);

  const getBookMeta = useCallback((fname) => {
    return JSON.parse(localStorage.getItem('rdr_' + fname) || '{}');
  }, []);

  const saveBookMeta = useCallback((fname, data) => {
    localStorage.setItem('rdr_' + fname, JSON.stringify(data));
  }, []);

  const changeFontSize = useCallback((delta) => {
    setFontSize(prev => {
      const next = Math.min(28, Math.max(13, prev + delta));
      localStorage.setItem('rdr_fs', next);
      return next;
    });
  }, []);

  const changeBg = useCallback((theme) => {
    setBgTheme(theme);
    localStorage.setItem('rdr_bg', theme);
  }, []);

  const toggleFeature = useCallback((key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return {
    password, setPassword,
    authed, setAuthed,
    view, setView,
    book, setBook,
    fontSize, changeFontSize,
    bgTheme, changeBg,
    features, toggleFeature,
    library, saveToLibrary, removeFromLibrary,
    getBookMeta, saveBookMeta,
  };
}
