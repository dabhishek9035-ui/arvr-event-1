'use client';

import { useEffect } from 'react';

/**
 * Checks whether the target element is the GitHub or LinkedIn profile URL input.
 * Copy and paste are strictly allowed ONLY in these two inputs.
 */
function isAllowedUrlField(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const name = target.getAttribute('name');
  const id = target.getAttribute('id');
  return (
    name === 'githubUrl' ||
    name === 'linkedinUrl' ||
    id === 'f-githubUrl' ||
    id === 'f-linkedinUrl'
  );
}

export default function CopyPasteGuard() {
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      // Allow copy only inside GitHub & LinkedIn URL fields
      if (isAllowedUrlField(e.target)) return;
      e.preventDefault();
    };

    const handlePaste = (e: ClipboardEvent) => {
      // Allow paste only inside GitHub & LinkedIn URL fields
      if (isAllowedUrlField(e.target)) return;
      e.preventDefault();
    };

    const handleCut = (e: ClipboardEvent) => {
      if (isAllowedUrlField(e.target)) return;
      e.preventDefault();
    };

    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu only inside GitHub & LinkedIn URL fields (so user can right-click -> Paste)
      if (isAllowedUrlField(e.target)) return;
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;
      if (!isModifier) return;

      const key = e.key.toLowerCase();
      const inAllowedField = isAllowedUrlField(e.target);

      // In allowed URL fields, allow Ctrl+V (paste), Ctrl+C (copy), Ctrl+X (cut), and Ctrl+A (select all)
      if (inAllowedField && (key === 'v' || key === 'c' || key === 'x' || key === 'a')) {
        return;
      }

      // Everywhere else on the website, prevent copy, paste, cut, inspect, view source, save
      if (key === 'c' || key === 'v' || key === 'x' || key === 'u' || key === 's') {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  return null;
}
