'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useFormContext, useWatch, type FieldPath } from 'react-hook-form';
import type { RegistrationInput } from '@/lib/registration';
import { FieldError } from './Field';

/**
 * Custom accessible dropdown (the native select popup can't be styled and
 * clashed with the site). Keyboard support: Enter/Space/ArrowDown opens,
 * arrows move, Enter selects, Esc closes, Home/End jump.
 */
export default function SelectField({
  name,
  label,
  options,
}: {
  name: FieldPath<RegistrationInput>;
  label: string;
  options: readonly string[];
}) {
  const { setValue, getFieldState, formState } = useFormContext<RegistrationInput>();
  const { error } = getFieldState(name, formState);
  const value = (useWatch({ name: name as never }) as unknown as string) ?? '';

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const choose = (opt: string) => {
    setValue(name, opt as never, { shouldValidate: true, shouldDirty: true });
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(Math.max(0, options.indexOf(value)));
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(options[active]);
    }
  };

  const floated = value.length > 0;
  const listId = `sel-${String(name)}`;

  return (
    <div className={`field${error ? ' has-error' : ''}`} ref={rootRef}>
      <button
        type="button"
        className={`field-shell select-shell${open ? ' open' : ''}`}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-invalid={error ? true : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className={`select-value${floated ? '' : ' empty'}`}>{value || '\u00A0'}</span>
        <label className="field-label" id={`${listId}-label`}>
          {label}
        </label>
        <ChevronDown size={18} strokeWidth={1.5} className={`field-caret${open ? ' up' : ''}`} aria-hidden="true" />
      </button>

      {open ? (
        <div
          className="select-pop"
          id={listId}
          role="listbox"
          aria-labelledby={`${listId}-label`}
          ref={listRef}
        >
          {options.map((opt, i) => {
            const selected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={selected}
                data-active={i === active}
                className="select-opt"
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(opt)}
              >
                <span>{opt}</span>
                {selected ? <Check size={16} strokeWidth={2} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <FieldError message={error?.message} />
    </div>
  );
}
