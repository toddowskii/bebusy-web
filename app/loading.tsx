export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-4">
            Be<span className="text-[#10B981]">Busy</span>
          </h1>
        </div>

        {/* Spinner */}
        <div className="flex justify-center mb-4">
          <div className="animate-spin h-12 w-12 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-500 text-sm animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  )
}
