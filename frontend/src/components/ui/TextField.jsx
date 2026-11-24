/**
 * Reusable labeled text input with optional error message.
 * Works for both controlled-value usage (value/onChange) and
 * react-hook-form's register() spread usage (via ...rest).
 */
function TextField({ label, error, type = 'text', value, onChange, ...rest }) {
  const isControlled = value !== undefined && onChange !== undefined;

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-300 uppercase tracking-wider mb-1">{label}</label>
      )}
      <input
        type={type}
        className={`w-full bg-slate-50 dark:bg-zinc-950/80 border rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all outline-none ${
          error
            ? 'border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-slate-200 dark:border-zinc-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
        }`}
        {...(isControlled
          ? { value, onChange: (e) => onChange(e.target.value) }
          : {})}
        {...rest}
      />
      {error && <p className="text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight mt-1">{error}</p>}
    </div>
  );
}

export default TextField;