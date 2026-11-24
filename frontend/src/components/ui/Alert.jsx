const VARIANT_CLASSES = {
  success: 'bg-primary-50 text-primary-800 border-l-4 border-primary-500',
  error: 'bg-red-50 text-red-800 border-l-4 border-red-500',
  info: 'bg-blue-50 text-blue-800 border-l-4 border-blue-500',
  warning: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500',
};

function Alert({ variant = 'info', children, className = '' }) {
  if (!children) return null;

  return (
    <div className={`p-4 text-sm rounded-r-lg shadow-sm ${VARIANT_CLASSES[variant]} ${className}`}>
      {children}
    </div>
  );
}

export default Alert;