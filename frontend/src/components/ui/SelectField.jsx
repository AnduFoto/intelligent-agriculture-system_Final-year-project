function SelectField({ label, error, children, value, onChange, ...rest }) {
  const isControlled = value !== undefined && onChange !== undefined;

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-300 uppercase tracking-wider mb-1">{label}</label>
      )}
      <select
        className={`w-full bg-slate-50 dark:bg-zinc-950/80 border rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white transition-all outline-none appearance-none bg-no-repeat bg-right ${
          error
            ? 'border-red-500 focus:ring-1 focus:ring-red-500'
            : 'border-slate-200 dark:border-zinc-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
        }`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em 1.2em', paddingRight: '2.5rem' }}
        {...(isControlled
          ? { value, onChange: (e) => onChange(e.target.value) }
          : {})}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight mt-1">{error}</p>}
    </div>
  );
}

export default SelectField;
