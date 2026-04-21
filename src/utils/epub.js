import Epub from 'epubjs';

export async function parseEpub(buffer) {
  const epubBook = Epub(buffer, { openAs: 'binary' });
  await epubBook.ready;
  const title = epubBook.packaging?.metadata?.title || 'Unknown';
  return { title, html: '', chapters: [], buffer };
}

export function parseTxt(buffer, origName) {
  const text  = new TextDecoder().decode(buffer);
  const title = origName.replace(/\.[^.]+$/, '');
  const lines = text.split('\n');
  let html = '';
  const chapters = [];
  let chapIdx = 0;

  lines.forEach(line => {
    const trimmed = line.trim();
    const isChap = /^(chapter|ch\.?|prologue|epilogue|part|volume)\s*[\d\w]/i.test(trimmed) && trimmed.length < 120;
    if (isChap) {
      const anchorId = 'txt-' + chapIdx;
      html += `<span class="chap-anchor" id="${anchorId}" style="display:block;position:relative;top:-80px;visibility:hidden;"></span><h2>${trimmed}</h2>`;
      chapters.push({ title: trimmed, anchorId, index: chapIdx });
      chapIdx++;
    } else if (trimmed === '') {
      html += '<br>';
    } else {
      html += `<p>${trimmed}</p>`;
    }
  });

  return { title, html, chapters };
}