import { useState, useRef, useEffect, useCallback } from 'react';
import '../css/common-text-editor-box.css';

const BLOCK_FORMAT_OPTIONS = [
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
  { label: 'Heading 5', value: 'h5' },
  { label: 'Heading 6', value: 'h6' },
  { label: 'Paragraph', value: 'p' },
];

const BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'blockquote']);

const ALLOWED_TAGS = new Set([
  'p', 'br', 'div', 'span',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
  'ul', 'ol', 'li',
  'a', 'blockquote', 'sub', 'sup',
]);

const ALLOWED_ATTRS = {
  a: ['href', 'title', 'target', 'rel'],
  '*': ['style'],
};

const ALLOWED_STYLES = new Set([
  'text-align',
  'font-weight',
  'font-style',
  'text-decoration',
]);

function normalizeEmptyHtml(html) {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = (temp.textContent || '').replace(/\u00a0/g, ' ').trim();
  if (text) return html;
  return '';
}

function sanitizePastedHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html;

  const cleanStyles = (styleValue) =>
    String(styleValue || '')
      .split(';')
      .map((part) => part.trim())
      .filter((part) => {
        if (!part) return false;
        const prop = part.split(':')[0]?.trim().toLowerCase();
        return ALLOWED_STYLES.has(prop);
      })
      .join('; ');

  const walk = (node) => {
    const children = Array.from(node.childNodes);

    children.forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        return;
      }

      if (child.nodeType !== Node.ELEMENT_NODE) return;

      const el = child;
      const tag = el.tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(tag)) {
        const parent = el.parentNode;
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        el.remove();
        return;
      }

      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const allowedForTag = ALLOWED_ATTRS[tag] || [];
        const allowedGlobal = ALLOWED_ATTRS['*'] || [];
        const allowed = [...allowedForTag, ...allowedGlobal];

        if (!allowed.includes(name) || name.startsWith('on')) {
          el.removeAttribute(attr.name);
          return;
        }

        if (name === 'href') {
          const href = el.getAttribute('href') || '';
          if (/^\s*javascript:/i.test(href)) {
            el.removeAttribute('href');
          }
        }

        if (name === 'style') {
          const cleaned = cleanStyles(el.getAttribute('style'));
          if (cleaned) el.setAttribute('style', cleaned);
          else el.removeAttribute('style');
        }
      });

      if (tag === 'a') {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }

      walk(el);
    });
  };

  walk(template.content);
  return template.innerHTML;
}

function extractFormattedContent(element, editorRoot) {
  const result = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null
  );

  let node;
  let currentLine = { content: [], lineNumber: 1, alignment: 'left', isList: false };
  let lineNumber = 1;

  const getAppliedStyles = (startEl) => {
    const styles = { bold: false, italic: false, underline: false, strike: false };
    let current = startEl;
    while (current && current !== editorRoot) {
      const tagName = current.tagName?.toLowerCase();
      const computedStyle = window.getComputedStyle(current);

      if (
        tagName === 'b' ||
        tagName === 'strong' ||
        computedStyle.fontWeight === 'bold' ||
        Number(computedStyle.fontWeight) >= 700
      ) {
        styles.bold = true;
      }
      if (tagName === 'i' || tagName === 'em' || computedStyle.fontStyle === 'italic') {
        styles.italic = true;
      }
      if (tagName === 'u' || computedStyle.textDecoration.includes('underline')) {
        styles.underline = true;
      }
      if (
        tagName === 's' ||
        tagName === 'strike' ||
        tagName === 'del' ||
        computedStyle.textDecoration.includes('line-through')
      ) {
        styles.strike = true;
      }
      current = current.parentElement;
    }
    return styles;
  };

  const getAlignment = (el) => {
    const textAlign = window.getComputedStyle(el).textAlign;
    if (textAlign === 'center' || textAlign === 'right' || textAlign === 'justify') {
      return textAlign;
    }
    return 'left';
  };

  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const parentStyles = getAppliedStyles(node.parentElement);
      const textContent = node.textContent;
      const lines = textContent.split('\n');

      lines.forEach((line, index) => {
        if (line.trim()) {
          currentLine.content.push({
            text: line,
            styles: parentStyles,
            position: { start: 0, end: line.length },
          });
        }

        if (index < lines.length - 1 || textContent.endsWith('\n')) {
          result.push({ ...currentLine });
          lineNumber += 1;
          currentLine = {
            content: [],
            lineNumber,
            alignment: 'left',
            isList: false,
          };
        }
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        result.push({ ...currentLine });
        lineNumber += 1;
        currentLine = {
          content: [],
          lineNumber,
          alignment: 'left',
          isList: false,
        };
      } else if (
        node.tagName === 'DIV' ||
        node.tagName === 'P' ||
        /^H[1-6]$/.test(node.tagName)
      ) {
        currentLine.alignment = getAlignment(node);
        if (/^H[1-6]$/.test(node.tagName)) {
          currentLine.heading = node.tagName.toLowerCase();
        }
      } else if (node.tagName === 'UL' || node.tagName === 'OL' || node.tagName === 'LI') {
        currentLine.isList = true;
      }
    }
  }

  if (currentLine.content.length > 0) {
    result.push(currentLine);
  }

  return result;
}

const CommonTextEditorBox = ({
  initialContent = '',
  value = '',
  onChange = () => {},
  onSelectionChange = () => {},
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
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const isFocusedRef = useRef(false);
  const isInternalChangeRef = useRef(false);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    createLink: false,
  });
  const [blockFormat, setBlockFormat] = useState('p');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const getBlockFormatAtSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return 'p';

    let node = selection.anchorNode;
    if (node?.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    while (node && node !== editorRef.current) {
      const tag = node.tagName?.toLowerCase();
      if (tag && BLOCK_TAGS.has(tag)) {
        if (/^h[1-6]$/.test(tag)) return tag;
        if (tag === 'blockquote') return 'p';
        return 'p';
      }
      node = node.parentElement;
    }

    return 'p';
  }, []);

  const isSelectionInsideLink = useCallback(() => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return false;

    let node = selection.anchorNode;
    if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;

    while (node && node !== editorRef.current) {
      if (node.tagName?.toLowerCase() === 'a') return true;
      node = node.parentElement;
    }
    return false;
  }, []);

  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;

    const formats = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      justifyFull: document.queryCommandState('justifyFull'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      createLink: isSelectionInsideLink(),
    };

    setActiveFormats(formats);
    setBlockFormat(getBlockFormatAtSelection());
    setCanUndo(document.queryCommandEnabled('undo'));
    setCanRedo(document.queryCommandEnabled('redo'));
    onSelectionChange(formats);
  }, [onSelectionChange, getBlockFormatAtSelection, isSelectionInsideLink]);

  const syncEmptyState = useCallback(() => {
    if (!editorRef.current) return;
    const text = (editorRef.current.textContent || '')
      .replace(/\u00a0/g, ' ')
      .trim();
    editorRef.current.setAttribute('data-empty', text ? 'false' : 'true');
  }, []);

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;

    const html = editorRef.current.innerHTML;
    const textContent =
      editorRef.current.textContent || editorRef.current.innerText || '';

    syncEmptyState();

    isInternalChangeRef.current = true;
    onChange({
      html,
      text: textContent,
      formatted: extractFormattedContent(editorRef.current, editorRef.current),
    });

    requestAnimationFrame(() => {
      isInternalChangeRef.current = false;
    });

    updateActiveFormats();
  }, [onChange, updateActiveFormats, syncEmptyState]);

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (
      selection?.rangeCount &&
      editorRef.current &&
      editorRef.current.contains(selection.anchorNode)
    ) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!savedRangeRef.current || !selection) return false;

    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
    return true;
  }, []);

  const focusEditor = useCallback(() => {
    if (!editorRef.current || disabled) return;
    editorRef.current.focus();
    restoreSelection();
  }, [disabled, restoreSelection]);

  const executeCommand = useCallback(
    (command, commandValue = null) => {
      if (disabled || !editorRef.current) return;

      focusEditor();
      document.execCommand(command, false, commandValue);
      emitChange();
    },
    [disabled, focusEditor, emitChange]
  );

  const applyBlockFormat = useCallback(
    (tag) => {
      if (disabled || !editorRef.current) return;

      focusEditor();
      const blockTag = tag || 'p';
      const applied =
        document.execCommand('formatBlock', false, blockTag) ||
        document.execCommand('formatBlock', false, `<${blockTag}>`);

      if (!applied) {
        const selection = window.getSelection();
        if (selection?.rangeCount) {
          const range = selection.getRangeAt(0);
          const block = document.createElement(blockTag);
          if (!range.collapsed) {
            block.appendChild(range.extractContents());
          } else {
            block.appendChild(document.createElement('br'));
          }
          range.insertNode(block);
          range.selectNodeContents(block);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }

      setBlockFormat(blockTag);
      emitChange();
    },
    [disabled, focusEditor, emitChange]
  );

  const handleLink = useCallback(() => {
    if (disabled) return;
    focusEditor();

    if (isSelectionInsideLink()) {
      executeCommand('unlink');
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    const url = window.prompt('Enter link URL', 'https://');
    if (!url) return;

    const trimmed = url.trim();
    if (!trimmed) return;

    if (!selectedText) {
      executeCommand(
        'insertHTML',
        `<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${trimmed}</a>`
      );
      return;
    }

    executeCommand('createLink', trimmed);

    // Ensure anchors open in a new tab
    if (editorRef.current) {
      editorRef.current.querySelectorAll('a[href]').forEach((anchor) => {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      });
      emitChange();
    }
  }, [
    disabled,
    focusEditor,
    isSelectionInsideLink,
    executeCommand,
    emitChange,
  ]);

  const clearFormatting = useCallback(() => {
    if (disabled) return;
    focusEditor();
    document.execCommand('removeFormat', false, null);
    document.execCommand('unlink', false, null);
    emitChange();
  }, [disabled, focusEditor, emitChange]);

  const handlePaste = useCallback(
    (e) => {
      if (disabled) return;
      e.preventDefault();

      const clipboard = e.clipboardData || window.clipboardData;
      const html = clipboard.getData('text/html');
      const text = clipboard.getData('text/plain');

      if (html) {
        document.execCommand('insertHTML', false, sanitizePastedHtml(html));
      } else if (text) {
        document.execCommand('insertText', false, text);
      }

      emitChange();
    },
    [disabled, emitChange]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return;

      const isMod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isMod && key === 'b') {
        e.preventDefault();
        executeCommand('bold');
        return;
      }
      if (isMod && key === 'i') {
        e.preventDefault();
        executeCommand('italic');
        return;
      }
      if (isMod && key === 'u') {
        e.preventDefault();
        executeCommand('underline');
        return;
      }
      if (isMod && key === 'k') {
        e.preventDefault();
        handleLink();
        return;
      }
      if (isMod && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        executeCommand('undo');
        return;
      }
      if ((isMod && key === 'y') || (isMod && e.shiftKey && key === 'z')) {
        e.preventDefault();
        executeCommand('redo');
        return;
      }
      if (isMod && e.shiftKey && key === '7') {
        e.preventDefault();
        executeCommand('insertOrderedList');
        return;
      }
      if (isMod && e.shiftKey && key === '8') {
        e.preventDefault();
        executeCommand('insertUnorderedList');
        return;
      }
      if (isMod && e.shiftKey && key === 'x') {
        e.preventDefault();
        executeCommand('strikeThrough');
        return;
      }
      if (isMod && e.shiftKey && key === '\\') {
        e.preventDefault();
        clearFormatting();
        return;
      }

      // Improve list UX: Enter on empty list item exits the list
      if (e.key === 'Enter' && !e.shiftKey) {
        const inList =
          document.queryCommandState('insertUnorderedList') ||
          document.queryCommandState('insertOrderedList');
        if (inList) {
          const selection = window.getSelection();
          const li =
            selection?.anchorNode?.nodeType === Node.ELEMENT_NODE
              ? selection.anchorNode.closest?.('li')
              : selection?.anchorNode?.parentElement?.closest?.('li');

          if (li && !(li.textContent || '').trim()) {
            e.preventDefault();
            if (document.queryCommandState('insertUnorderedList')) {
              executeCommand('insertUnorderedList');
            } else {
              executeCommand('insertOrderedList');
            }
          }
        }
      }
    },
    [disabled, executeCommand, handleLink, clearFormatting]
  );

  // Sync external value only when editor is not being edited
  useEffect(() => {
    if (!editorRef.current) return;
    if (isInternalChangeRef.current) return;
    if (isFocusedRef.current) return;

    const nextValue = value !== undefined && value !== null ? value : initialContent;
    const current = editorRef.current.innerHTML;

    if (normalizeEmptyHtml(current) === normalizeEmptyHtml(nextValue || '')) {
      return;
    }

    editorRef.current.innerHTML = nextValue || '';
    syncEmptyState();
    updateActiveFormats();
  }, [value, initialContent, updateActiveFormats, syncEmptyState]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onSelectionChangeDoc = () => {
      if (!editorRef.current) return;
      const selection = window.getSelection();
      if (!selection?.anchorNode) return;
      if (!editorRef.current.contains(selection.anchorNode)) return;
      saveSelection();
      updateActiveFormats();
    };

    const onMouseUp = () => {
      saveSelection();
      updateActiveFormats();
    };

    const onKeyUp = () => {
      saveSelection();
      updateActiveFormats();
    };

    const onInput = () => emitChange();

    editor.addEventListener('mouseup', onMouseUp);
    editor.addEventListener('keyup', onKeyUp);
    editor.addEventListener('input', onInput);
    document.addEventListener('selectionchange', onSelectionChangeDoc);

    return () => {
      editor.removeEventListener('mouseup', onMouseUp);
      editor.removeEventListener('keyup', onKeyUp);
      editor.removeEventListener('input', onInput);
      document.removeEventListener('selectionchange', onSelectionChangeDoc);
    };
  }, [emitChange, saveSelection, updateActiveFormats]);

  const onToolbarMouseDown = (e) => {
    // Always remember current editor selection for toolbar actions.
    saveSelection();

    // Keep selection for button clicks, but let native <select> open.
    const tag = e.target?.tagName?.toLowerCase();
    if (tag === 'select' || tag === 'option') return;
    e.preventDefault();
  };

  return (
    <div className="common-text-editor-box">
      {label ? (
        <p className="rte-label">
          {label}
          {required ? <span>*</span> : null}
        </p>
      ) : null}

      <div className={`rich-text-editor ${className} ${error ? 'error' : ''}`}>
        <div className="rte-toolbar" onMouseDown={onToolbarMouseDown}>
          <div className="rte-group rte-group-blocks">
            {BLOCK_FORMAT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`rte-btn rte-btn-block ${blockFormat === option.value ? 'active' : ''}`}
                onClick={() => applyBlockFormat(option.value)}
                disabled={disabled}
                title={option.label}
              >
                {option.value === 'p' ? 'Paragraph' : option.value.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="rte-group">
            <button
              type="button"
              className={`rte-btn ${activeFormats.bold ? 'active' : ''}`}
              onClick={() => executeCommand('bold')}
              disabled={disabled}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className={`rte-btn ${activeFormats.italic ? 'active' : ''}`}
              onClick={() => executeCommand('italic')}
              disabled={disabled}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className={`rte-btn ${activeFormats.underline ? 'active' : ''}`}
              onClick={() => executeCommand('underline')}
              disabled={disabled}
              title="Underline (Ctrl+U)"
            >
              <u>U</u>
            </button>
          </div>

          <div className="rte-group">
            <button
              type="button"
              className={`rte-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`}
              onClick={() => executeCommand('insertUnorderedList')}
              disabled={disabled}
              title="Bullet list (Ctrl+Shift+8)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="4" cy="6" r="1.5" fill="currentColor" />
                <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                <circle cx="4" cy="18" r="1.5" fill="currentColor" />
                <path d="M9 6H20M9 12H20M9 18H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="rte-group">
            <button
              type="button"
              className={`rte-btn ${activeFormats.justifyLeft ? 'active' : ''}`}
              onClick={() => executeCommand('justifyLeft')}
              disabled={disabled}
              title="Align left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M4 12H14M4 18H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              className={`rte-btn ${activeFormats.justifyCenter ? 'active' : ''}`}
              onClick={() => executeCommand('justifyCenter')}
              disabled={disabled}
              title="Align center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M7 12H17M5 18H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              className={`rte-btn ${activeFormats.justifyRight ? 'active' : ''}`}
              onClick={() => executeCommand('justifyRight')}
              disabled={disabled}
              title="Align right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M10 12H20M6 18H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              className={`rte-btn ${activeFormats.justifyFull ? 'active' : ''}`}
              onClick={() => executeCommand('justifyFull')}
              disabled={disabled}
              title="Justify"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="rte-group">
            <button
              type="button"
              className={`rte-btn ${activeFormats.createLink ? 'active' : ''}`}
              onClick={handleLink}
              disabled={disabled}
              title="Insert / remove link (Ctrl+K)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.5-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={editorRef}
          className={`rte-editor ${disabled ? 'disabled' : ''}`}
          contentEditable={!disabled}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={label || placeholder}
          spellCheck
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => {
            isFocusedRef.current = true;
            updateActiveFormats();
          }}
          onBlur={() => {
            isFocusedRef.current = false;
            saveSelection();
          }}
          style={{
            minHeight,
            maxHeight: maxHeight !== 'none' ? maxHeight : undefined,
          }}
          data-placeholder={placeholder}
        />
      </div>

      {required && error ? (
        <p className="rte-error-message">{errorMessage}</p>
      ) : null}
    </div>
  );
};

export default CommonTextEditorBox;
