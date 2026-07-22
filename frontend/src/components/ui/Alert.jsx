const VARIANT_CLASSES = {
  success: 'bg-primary-50 text-primary-700',
  error: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  warning: 'bg-yellow-50 text-yellow-700',
};

function Alert({ variant = 'info', children }) {
  if (!children) return null;

  return (
    <div className={`mb-4 p-3 text-sm rounded ${VARIANT_CLASSES[variant]}`}>
      {children}
    </div>
  );
}

export default Alert;