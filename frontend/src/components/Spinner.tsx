export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        <div className="text-sm text-gray-600">Loading…</div>
      </div>
    </div>
  )
}
