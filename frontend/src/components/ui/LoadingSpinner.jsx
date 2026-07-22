function LoadingSpinner({ fullScreen = false, message = 'Loading...' }) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      {message && <p className="text-sm text-gray-400">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return content;
}

export default LoadingSpinner;