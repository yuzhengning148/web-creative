export function initSpanner() {
  document.querySelectorAll('[data-spanner]').forEach((el) => {
    const tag = el.getAttribute('data-spanner') || 'w';
    const spanSkip = el.classList.contains('spanSkip');
    splitElement(el, tag, spanSkip);
  });
}

function splitElement(el, tag, spanSkip = false) {
  let html = el.innerHTML;
  html = html.replaceAll('<p>', ' ¥¥¥ ').replaceAll('</p>', ' ### ');
  const parts = html.split(' ');
  let result = '';
  let index = 1;
  let inSpan = false;
  let spanBuffer = '';

  for (const part of parts) {
    if (!part || part === '\n') continue;

    if (!inSpan) {
      if (part === '¥¥¥') {
        result += '<p>';
      } else if (part === '###') {
        result += '</p>';
      } else if (part.includes('<span')) {
        inSpan = true;
        spanBuffer = `${part} `;
      } else {
        result += `<span class="${tag}" data-i="${index}">${part} </span>`;
        index += 1;
      }
    } else {
      spanBuffer += `${part} `;
      if (part.includes('</span>')) {
        inSpan = false;
        if (spanSkip) {
          result += `<span class="${tag} skip" data-i="${index}">${spanBuffer} </span>`;
          index += 1;
        } else {
          result += spanBuffer;
        }
        spanBuffer = '';
      }
    }
  }

  el.innerHTML = result;
  el.classList.add('spanned');
}
