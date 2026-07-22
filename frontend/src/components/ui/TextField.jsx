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
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <input
        type={type}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        {...(isControlled
          ? { value, onChange: (e) => onChange(e.target.value) }
          : {})}
        {...rest}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default TextField;