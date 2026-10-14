import { useEffect, useRef, useCallback, useState } from 'react';
import '../css/common-text-editor-box.css';

const styles = `
  .rte-wrapper {
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    background: var(--surface);
    font-family: var(--font);
    overflow: hidden;
    box-shadow: var(--shadow-xs);
    transition: border-color var(--transition), box-shadow var(--transition);
  }

  .rte-wrapper:focus-within {
    border-color: var(--primary);
    box-shadow: var(--ring);
  }

  .rte-wrapper.rte-error {
    border-color: var(--danger);
  }

  .rte-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--divider);
  }

  .rte-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: grab;
    user-select: none;
  }

  .rte-drag-icon {
    color: var(--text-3);
    display: flex;
    align-items: center;
  }

  .rte-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rte-icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-xs);
    color: var(--text-3);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--transition), color var(--transition);
  }

  .rte-icon-btn:hover {
    background: var(--surface-hover);
    color: var(--text);
  }

  .rte-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }

  .rte-toolbar.rte-disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .rte-btn {
    height: 30px;
    padding: 0 9px;
    border: 1px solid transparent;
    border-radius: var(--radius-xs);
    background: none;
    font-family: var(--font);
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-2);
    cursor: pointer;
    transition: background-color var(--transition), color var(--transition);
    white-space: nowrap;
    line-height: 1.5;
  }

  .rte-btn:hover {
    background: var(--surface-hover);
    color: var(--text);
  }

  .rte-btn.rte-active {
    background: var(--primary-soft-2);
    color: var(--primary-text);
    border-color: transparent;
  }

  .rte-btn-icon {
    height: 30px;
    padding: 0 7px;
    border: 1px solid transparent;
    border-radius: var(--radius-xs);
    background: none;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-2);
    cursor: pointer;
    transition: background-color var(--transition), color var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    line-height: 1.5;
  }

  .rte-btn-icon:hover {
    background: var(--surface-hover);
    color: var(--text);
  }

  .rte-btn-icon.rte-active {
    background: var(--primary-soft-2);
    color: var(--primary-text);
  }

  .rte-divider {
    width: 1px;
    height: 18px;
    background: var(--border-strong);
    margin: 0 6px;
  }

  .rte-body {
    padding: 14px 16px;
    min-height: 80px;
    position: relative;
    background: var(--surface);
  }

  .rte-editor {
    outline: none;
    min-height: 60px;
    color: var(--text);
    font-size: 14px;
    line-height: 1.65;
    caret-color: var(--primary);
    word-break: break-word;
  }

  .rte-editor:empty::before {
    content: attr(data-placeholder);
    color: var(--text-3);
    pointer-events: none;
    position: absolute;
    font-size: 14px;
  }

  .rte-editor[contenteditable="false"] {
    cursor: default;
    color: var(--text-2);
  }

  .rte-editor h1 { font-size: 2em; font-weight: 700; margin: 0.4em 0; }
  .rte-editor h2 { font-size: 1.5em; font-weight: 700; margin: 0.4em 0; }
  .rte-editor h3 { font-size: 1.17em; font-weight: 700; margin: 0.4em 0; }
  .rte-editor h4 { font-size: 1em; font-weight: 700; margin: 0.4em 0; }
  .rte-editor h5 { font-size: 0.83em; font-weight: 700; margin: 0.4em 0; }
  .rte-editor h6 { font-size: 0.67em; font-weight: 700; margin: 0.4em 0; }
  .rte-editor p  { margin: 0.3em 0; }

  .rte-editor ul {
    padding-left: 1.8em;
    margin: 0.3em 0;
    list-style-type: disc !important;
  }
  .rte-editor ol {
    padding-left: 1.8em;
    margin: 0.3em 0;
    list-style-type: decimal !important;
  }
  .rte-editor ul li {
    list-style-type: disc !important;
    display: list-item !important;
  }
  .rte-editor ol li {
    list-style-type: decimal !important;
    display: list-item !important;
  }

  .rte-editor ul ul li {
    list-style-type: circle !important;
  }
  .rte-editor ul ul ul li {
    list-style-type: square !important;
  }
  .rte-editor ol ol li {
    list-style-type: lower-alpha !important;
  }
  .rte-editor ol ol ol li {
    list-style-type: lower-roman !important;
  }

  .rte-editor a  { color: var(--primary-text); text-decoration: underline; }

  .rte-link-modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--overlay);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .rte-link-modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px;
    width: 360px;
    box-shadow: var(--shadow-lg);
    animation: ui-fade-in 160ms var(--ease);
  }

  .rte-link-modal h3 {
    margin: 0 0 14px;
    font-size: 16px;
    font-weight: 650;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  .rte-link-modal input {
    width: 100%;
    height: 40px;
    padding: 9px 12px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    background: var(--surface);
    font-family: var(--font);
    font-size: 14px;
    color: var(--text);
    box-sizing: border-box;
    margin-bottom: 16px;
    outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
  }

  .rte-link-modal input::placeholder {
    color: var(--text-3);
  }

  .rte-link-modal input:focus {
    border-color: var(--primary);
    box-shadow: var(--ring);
  }

  .rte-link-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .rte-link-modal-actions button {
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    font-family: var(--font);
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background-color var(--transition), border-color var(--transition);
  }

  .rte-link-cancel {
    background: var(--surface);
    border-color: var(--border-strong) !important;
    color: var(--text);
  }

  .rte-link-cancel:hover {
    background: var(--surface-hover);
  }

  .rte-link-apply {
    background: var(--primary);
    color: var(--primary-contrast);
    box-shadow: var(--shadow-primary);
  }

  .rte-link-apply:hover {
    background: var(--primary-hover);
  }
`;

const HEADING_BUTTONS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

const ALIGN_BUTTONS = [
  { cmd: 'justifyLeft', title: 'Align Left' },
  { cmd: 'justifyCenter', title: 'Align Center' },
  { cmd: 'justifyRight', title: 'Align Right' },
  { cmd: 'justifyFull', title: 'Justify' },
];

const STRIP_ENTIRELY_SELECTOR =
  'style, script, meta, link, xml, w\\:sdt, o\\:p';

const KEEP_TAGS = [
  'b',
  'strong',
  'i',
  'em',
  'u',
  'a',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'br',
  'span',
  'div',
  'blockquote',
];

function removeComments(node) {
  for (let i = node.childNodes.length - 1; i >= 0; i--) {
    const child = node.childNodes[i];
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      removeComments(child);
    }
  }
}

const WORD_LIST_STYLE_RE = /mso-list:\s*(l\d+)\s+level(\d+)/i;

function getWordListInfo(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return null;
  const style = el.getAttribute('style') || '';
  const match = style.match(WORD_LIST_STYLE_RE);
  if (!match) return null;
  return { listId: match[1], level: parseInt(match[2], 10) };
}

function isOrderedWordItem(el) {
  const marker = el.querySelector('span[style*="mso-list"]');
  const text = (marker ? marker.textContent : el.textContent || '').trim();
  return /^[0-9ivxlcdm]+[.)]/i.test(text);
}

function stripWordListMarker(el) {
  el.querySelectorAll('span[style*="mso-list"]').forEach((s) => s.remove());
  while (
    el.firstChild &&
    el.firstChild.nodeType === Node.TEXT_NODE &&
    /^[\s\u00A0]*$/.test(el.firstChild.textContent)
  ) {
    el.firstChild.remove();
  }
}

function convertWordLists(container) {
  const children = [...container.childNodes];
  let i = 0;
  while (i < children.length) {
    if (!getWordListInfo(children[i])) {
      i++;
      continue;
    }

    const run = [];
    let j = i;
    while (j < children.length) {
      const info = getWordListInfo(children[j]);
      if (!info) break;
      run.push({ el: children[j], ...info });
      j++;
    }

    const root = document.createDocumentFragment();
    const stack = [];

    run.forEach(({ el, level }) => {
      stripWordListMarker(el);
      const ordered = isOrderedWordItem(el);
      const li = document.createElement('li');
      li.append(...el.childNodes);

      while (stack.length && stack[stack.length - 1].level > level) {
        stack.pop();
      }

      if (!stack.length || stack[stack.length - 1].level < level) {
        const listEl = document.createElement(ordered ? 'ol' : 'ul');
        if (stack.length) {
          const parentLi = stack[stack.length - 1].listEl.lastElementChild;
          (parentLi || stack[stack.length - 1].listEl).appendChild(listEl);
        } else {
          root.appendChild(listEl);
        }
        stack.push({ level, listEl });
      }

      stack[stack.length - 1].listEl.appendChild(li);
    });

    const anchor = children[i];
    anchor.parentNode.insertBefore(root, anchor);
    run.forEach(({ el }) => el.remove());

    i = j;
  }

  container.querySelectorAll('div, blockquote, td').forEach((child) => {
    if (child.querySelector('[style*="mso-list"]')) convertWordLists(child);
  });
}

function cleanPastedHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;

  div.querySelectorAll(STRIP_ENTIRELY_SELECTOR).forEach((el) => el.remove());
  removeComments(div);
  convertWordLists(div);

  const walk = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      [...node.childNodes].forEach(walk);

      if (!KEEP_TAGS.includes(node.tagName.toLowerCase())) {
        node.replaceWith(...node.childNodes);
        return;
      }
      const attrs = [...node.attributes];
      attrs.forEach((a) => {
        if (a.name !== 'href') node.removeAttribute(a.name);
      });
    }
  };
  [...div.childNodes].forEach(walk);

  return div.innerHTML;
}

function getActiveBlock(editorEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return '';
  let node = sel.getRangeAt(0).commonAncestorContainer;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
  while (node && node !== editorEl) {
    const tag = node.tagName?.toLowerCase();
    if (tag && /^(h[1-6]|p|div)$/.test(tag)) return tag;
    node = node.parentElement;
  }
  return '';
}

function isInsideListItem(editorEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  let node = sel.getRangeAt(0).commonAncestorContainer;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
  while (node && node !== editorEl) {
    if (node.tagName?.toLowerCase() === 'li') return true;
    node = node.parentElement;
  }
  return false;
}

function RichTextEditor({
  title = 'Description',
  placeholder = 'Write your description here... Start typing to add content to this section.',
  defaultValue = '',
  value,
  readonly = false,
  minHeight = '60px',
  maxHeight = 'none',
  onChange,
  className = '',
  error = false,
}) {
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const linkUrlRef = useRef(null);
  const isInitialized = useRef(false);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    block: 'p',
  });

  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    if (document.getElementById('rte-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'rte-styles';
    tag.textContent = styles;
    document.head.appendChild(tag);
  }, []);

  useEffect(() => {
    if (!editorRef.current || isInitialized.current) return;
    isInitialized.current = true;
    const initialContent = value ?? defaultValue;
    if (initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [defaultValue, value]);

  useEffect(() => {
    if (!editorRef.current || value === undefined) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const updateActiveFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        justifyFull: document.queryCommandState('justifyFull'),
        block: getActiveBlock(editorRef.current),
      });
    } catch {
      // ignore commandState errors outside editor focus
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveFormats);
    return () => document.removeEventListener('selectionchange', updateActiveFormats);
  }, [updateActiveFormats]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  }, []);

  const exec = useCallback(
    (cmd, cmdValue = null) => {
      if (readonly) return;
      editorRef.current?.focus();
      document.execCommand(cmd, false, cmdValue);
      updateActiveFormats();
    },
    [readonly, updateActiveFormats]
  );

  const handleHeading = useCallback(
    (level) => {
      if (readonly) return;
      editorRef.current?.focus();
      document.execCommand('formatBlock', false, `h${level}`);
      updateActiveFormats();
    },
    [readonly, updateActiveFormats]
  );

  const handleParagraph = useCallback(() => {
    if (readonly) return;
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, 'p');
    updateActiveFormats();
  }, [readonly, updateActiveFormats]);

  const handleChange = useCallback(() => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback(
    (e) => {
      if (readonly) return;
      e.preventDefault();
      const html = e.clipboardData.getData('text/html');
      if (html) {
        const clean = cleanPastedHtml(html);
        document.execCommand('insertHTML', false, clean);
      } else {
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }
      handleChange();
    },
    [readonly, handleChange]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (readonly || e.key !== 'Tab') return;
      e.preventDefault();

      if (isInsideListItem(editorRef.current)) {
        document.execCommand(e.shiftKey ? 'outdent' : 'indent');
      } else if (!e.shiftKey) {
        document.execCommand('insertHTML', false, '&emsp;');
      }

      updateActiveFormats();
      handleChange();
    },
    [readonly, updateActiveFormats, handleChange]
  );

  const openLinkModal = useCallback(() => {
    if (readonly) return;
    saveSelection();
    setShowLinkModal(true);
  }, [readonly, saveSelection]);

  const closeLinkModal = useCallback(() => {
    setShowLinkModal(false);
    if (linkUrlRef.current) linkUrlRef.current.value = '';
  }, []);

  const applyLink = useCallback(() => {
    const url = linkUrlRef.current?.value?.trim();
    closeLinkModal();
    if (!url) return;
    restoreSelection();
    editorRef.current?.focus();
    const href = url.startsWith('http') ? url : `https://${url}`;
    document.execCommand('createLink', false, href);
    handleChange();
  }, [closeLinkModal, restoreSelection, handleChange]);

  useEffect(() => {
    if (showLinkModal) {
      setTimeout(() => linkUrlRef.current?.focus(), 0);
    }
  }, [showLinkModal]);

  return (
    <div className={`rte-wrapper ${className} ${error ? 'rte-error' : ''}`}>
      <div className={`rte-toolbar${readonly ? ' rte-disabled' : ''}`}>
        {HEADING_BUTTONS.map((h, i) => (
          <button
            key={h}
            type="button"
            className={`rte-btn${
              activeFormats.block === `h${i + 1}` ? ' rte-active' : ''
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              handleHeading(i + 1);
            }}
            title={`Heading ${i + 1}`}
          >
            {h}
          </button>
        ))}

        <button
          type="button"
          className={`rte-btn${
            activeFormats.block === 'p' ||
            activeFormats.block === '' ||
            activeFormats.block === 'div'
              ? ' rte-active'
              : ''
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleParagraph();
          }}
          title="Paragraph"
        >
          P
        </button>

        <div className="rte-divider" />

        <button
          type="button"
          className={`rte-btn-icon${activeFormats.bold ? ' rte-active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            exec('bold');
          }}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`rte-btn-icon${activeFormats.italic ? ' rte-active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            exec('italic');
          }}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`rte-btn-icon${activeFormats.underline ? ' rte-active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            exec('underline');
          }}
          title="Underline"
          style={{ textDecoration: 'underline' }}
        >
          U
        </button>

        <div className="rte-divider" />

        <button
          type="button"
          className={`rte-btn-icon${
            activeFormats.insertUnorderedList ? ' rte-active' : ''
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            exec('insertUnorderedList');
          }}
          title="Bullet List"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <line x1="9" y1="6" x2="20" y2="6" />
            <line x1="9" y1="12" x2="20" y2="12" />
            <line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </button>

        <button
          type="button"
          className="rte-btn-icon"
          onMouseDown={(e) => {
            e.preventDefault();
            exec('outdent');
          }}
          title="Outdent (Shift+Tab)"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="11 8 7 12 11 16" />
            <line x1="7" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="3" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          className="rte-btn-icon"
          onMouseDown={(e) => {
            e.preventDefault();
            exec('indent');
          }}
          title="Indent (Tab)"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="13 8 17 12 13 16" />
            <line x1="17" y1="12" x2="3" y2="12" />
            <line x1="21" y1="6" x2="21" y2="18" />
          </svg>
        </button>

        {ALIGN_BUTTONS.map((a, idx) => (
          <button
            key={a.cmd}
            type="button"
            className={`rte-btn-icon${activeFormats[a.cmd] ? ' rte-active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              exec(a.cmd);
            }}
            title={a.title}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              {idx === 0 && (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="15" y2="12" />
                  <line x1="3" y1="18" x2="18" y2="18" />
                </>
              )}
              {idx === 1 && (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="6" y1="12" x2="18" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
              {idx === 2 && (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="9" y1="12" x2="21" y2="12" />
                  <line x1="6" y1="18" x2="21" y2="18" />
                </>
              )}
              {idx === 3 && (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        ))}

        <button
          type="button"
          className="rte-btn-icon"
          onMouseDown={(e) => {
            e.preventDefault();
            openLinkModal();
          }}
          title="Insert Link"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        </button>
      </div>

      <div className="rte-body">
        <div
          ref={editorRef}
          className="rte-editor"
          contentEditable={readonly ? 'false' : 'true'}
          data-placeholder={placeholder}
          onInput={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          style={{
            minHeight,
            maxHeight: maxHeight !== 'none' ? maxHeight : undefined,
          }}
          suppressContentEditableWarning
        />
      </div>

      {showLinkModal && (
        <div
          className="rte-link-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLinkModal();
          }}
        >
          <div className="rte-link-modal">
            <h3>Insert Link</h3>
            <input
              ref={linkUrlRef}
              type="url"
              placeholder="https://example.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyLink();
                if (e.key === 'Escape') closeLinkModal();
              }}
            />
            <div className="rte-link-modal-actions">
              <button type="button" className="rte-link-cancel" onClick={closeLinkModal}>
                Cancel
              </button>
              <button type="button" className="rte-link-apply" onClick={applyLink}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CommonTextEditorBox = ({
  initialContent = '',
  value = '',
  onChange = () => {},
  placeholder = 'Start typing...',
  className = '',
  disabled = false,
  required = false,
  error = false,
  errorMessage = '',
  minHeight = '200px',
  maxHeight = 'none',
  label = '',
}) => {
  const handleChange = (html) => {
    onChange({ html });
  };

  return (
    <div className="common-text-editor-box">
      {label ? (
        <p className="rte-label">
          {label}
          {required ? <span>*</span> : null}
        </p>
      ) : null}

      <RichTextEditor
        title={label || 'Description'}
        placeholder={placeholder}
        defaultValue={initialContent}
        value={value}
        readonly={disabled}
        minHeight={minHeight}
        maxHeight={maxHeight}
        onChange={handleChange}
        className={className}
        error={error}
      />

      {error && errorMessage ? <p className="error">{errorMessage}</p> : null}
    </div>
  );
};

export { RichTextEditor };
export default CommonTextEditorBox;
