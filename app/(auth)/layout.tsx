export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000]" style={{ padding: '20px' }}>
      <div className="w-full max-w-md">
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <h1 className="text-4xl font-bold text-[#FFFFFF]" style={{ marginBottom: '8px' }}>
            Be<span className="text-[#10B981]">Busy</span>
          </h1>
          <p className="text-[#9BA1A6]">Social network for productive people</p>
        </div>
        {children}
      </div>
    </div>
  )
}
