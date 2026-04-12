import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

function AlertInfoIcon() {
  return (
    <div
      className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-brand-red bg-white'
      aria-hidden
    >
      <span className='font-serif text-lg font-bold leading-none text-brand-red'>i</span>
    </div>
  );
}

/**
 * Modal-style alert / confirmation matching shared app UI: soft pink outer shell,
 * white inner card, icon + title + description + actions + optional auto-close footer.
 */
export default function ConfirmAlert({
  open,
  title,
  description,
  primaryLabel,
  onPrimary,
  primaryTone = 'neutral',
  secondaryLabel,
  onSecondary,
  onClose,
  autoCloseSeconds = null,
  zIndexClass = 'z-[200]',
}) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    autoCloseSeconds != null && autoCloseSeconds > 0 ? autoCloseSeconds : 0,
  );

  useEffect(() => {
    if (!open || autoCloseSeconds == null || autoCloseSeconds <= 0) return undefined;
    setSecondsLeft(autoCloseSeconds);
    let remaining = autoCloseSeconds;
    const id = setInterval(() => {
      remaining -= 1;
      setSecondsLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(id);
        onClose?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [open, autoCloseSeconds, onClose]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (secondaryLabel && onSecondary) onSecondary();
        else onClose?.();
      }
    },
    [onClose, onSecondary, secondaryLabel],
  );

  useEffect(() => {
    if (!open) return undefined;
    document.addEventListener('keydown', handleKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, handleKeyDown]);

  const primaryClasses =
    primaryTone === 'danger'
      ? 'bg-brand-red text-white hover:opacity-95'
      : 'bg-gray-100 text-brand-dark hover:bg-gray-200';

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 ${zIndexClass}`}
      role='presentation'
    >
      <button
        type='button'
        className='absolute inset-0 bg-black/25 backdrop-blur-[1px]'
        aria-label='Dismiss'
        onClick={() => (secondaryLabel && onSecondary ? onSecondary() : onClose?.())}
      />
      <div
        className='relative w-full max-w-lg rounded-2xl bg-[#fce8ea]/95 p-3 shadow-sm ring-1 ring-rose-200/60'
        role='alertdialog'
        aria-modal='true'
        aria-labelledby='confirm-alert-title'
        aria-describedby={description ? 'confirm-alert-desc' : undefined}
      >
        <div className='rounded-xl bg-white p-4 shadow-lg'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5'>
            <AlertInfoIcon />
            <div className='min-w-0 flex-1'>
              <h2 id='confirm-alert-title' className='text-base font-bold text-brand-dark'>
                {title}
              </h2>
              {description ? (
                <p id='confirm-alert-desc' className='mt-1 text-sm text-gray-500'>
                  {description}
                </p>
              ) : null}
            </div>
            <div className='flex flex-shrink-0 flex-wrap items-center justify-end gap-2 sm:flex-nowrap'>
              {primaryLabel && onPrimary && (
                <button
                  type='button'
                  onClick={onPrimary}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${primaryClasses}`}
                >
                  {primaryLabel}
                </button>
              )}
              {secondaryLabel && onSecondary && (
                <button
                  type='button'
                  onClick={onSecondary}
                  className='rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:border-gray-300 hover:bg-gray-50'
                >
                  {secondaryLabel}
                </button>
              )}
              <button
                type='button'
                onClick={() => (secondaryLabel && onSecondary ? onSecondary() : onClose?.())}
                className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-dark'
                aria-label='Close'
              >
                <span className='text-lg leading-none'>×</span>
              </button>
            </div>
          </div>
        </div>
        {autoCloseSeconds != null && autoCloseSeconds > 0 && (
          <p className='mt-2 text-center text-xs text-rose-900/55'>
            This message will automatically close in{' '}
            <span className='font-bold text-brand-red'>{secondsLeft} sec</span>
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
