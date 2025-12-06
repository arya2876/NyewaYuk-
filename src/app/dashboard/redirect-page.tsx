// This is the root dashboard page that redirects based on user plan
// The actual dashboard logic is now in /basic or /pro folders

export default function DashboardPage() {
  // This will be handled by middleware redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>Redirecting...</div>
    </div>
  );
}