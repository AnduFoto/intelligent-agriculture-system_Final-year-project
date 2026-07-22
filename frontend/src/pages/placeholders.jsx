// Temporary placeholder components. AdminLocationManagementPage will
// be replaced in Step 53. NotFoundPage is a permanent, real page —
// it just lives here since it doesn't warrant its own file.

export function AdminLocationManagementPage() {
  return <PlaceholderPage title="Admin Location Management" note="Step 53" />;
}

export function NotFoundPage() {
  return <PlaceholderPage title="404 - Page Not Found" note="No matching route" />;
}

function PlaceholderPage({ title, note }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-2">
      <h1 className="text-2xl font-semibold text-primary-700">{title}</h1>
      <p className="text-sm text-gray-400">Placeholder — built in {note}</p>
    </div>
  );
}