import React from 'react';

/** Primary map/panel CTA: same colors everywhere; pass `className` for size/layout (e.g. `flex-1 px-4 py-2`, `w-full py-3 !rounded-2xl`). */
export default function PrimaryBrandButton({ children, className = '', ...rest }) {
  return (
    <button
      type='button'
      className={`rounded-xl font-semibold text-sm shadow-sm transition-colors
        bg-brand-dark text-brand-cream
        hover:bg-brand-orange hover:text-brand-cream
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
