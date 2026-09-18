function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          QuickRx
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-gray-900">
            Dr. Romel
          </p>

          <p className="text-xs text-gray-500">
            Ophthalmologist
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600">
          D
        </div>
      </div>
    </header>
  );
}

export default TopBar;