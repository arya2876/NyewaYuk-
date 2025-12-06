export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="p-4 bg-white rounded-xl border shimmer">
            <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-6 w-32 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-xl border p-4 shimmer">
            <div className="h-3 w-28 bg-gray-200 rounded mb-4" />
            <div className="h-40 w-full bg-gray-100 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4">
  <div className="bg-white rounded-xl border p-4 shimmer">
          <div className="h-3 w-28 bg-gray-200 rounded mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-5 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
  <div className="bg-white rounded-xl border p-4 shimmer">
          <div className="h-3 w-28 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl border p-3 shimmer">
                <div className="h-28 rounded-lg bg-gray-100 mb-2" />
                <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
