const VARIANT_CLASSES = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white',
  secondary: 'bg-gray-700 hover:bg-gray-800 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
};

function Button({ children, variant = 'primary', isLoading = false, loadingText, className = '', ...rest }) {
  return (
    <button
      className={`w-full font-medium py-2.5 rounded-md transition disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      disabled={isLoading || rest.disabled}
      {...rest}
    >
      {isLoading ? (loadingText || 'Please wait...') : children}
    </button>
  );
}

export default Button;