const VARIANT_CLASSES = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow focus:ring-primary-500',
  secondary: 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white shadow-sm hover:shadow focus:ring-slate-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow focus:ring-red-500',
  outline: 'border border-slate-300 dark:border-zinc-700 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 focus:ring-slate-200',
  ghost: 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white',
};

function Button({ children, variant = 'primary', isLoading = false, loadingText, className = '', ...rest }) {
  return (
    <button
      className={`w-full inline-flex items-center justify-center font-medium py-2.5 px-4 rounded-lg transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${className}`}
      disabled={isLoading || rest.disabled}
      {...rest}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText || 'Please wait...'}
        </>
      ) : children}
    </button>
  );
}

export default Button;