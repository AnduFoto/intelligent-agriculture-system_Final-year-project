function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-soft border border-slate-100 dark:border-zinc-800 p-6 sm:p-8 transition-all duration-300 hover:shadow-md ${className}`}>
      {children}
    </div>
  );
}

export default Card;