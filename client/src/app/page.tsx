// client/src/app/page.tsx
export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <main className="flex flex-col items-center gap-8 rounded-2xl bg-surface px-12 py-16 shadow-sm">
        {/* Logo Mark */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-400">
          <span className="text-3xl font-bold text-neutral-900">N</span>
        </div>

        {/* Heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Welcome to <span className="text-primary-500">Nyan Market</span>
          </h1>
          <p className="max-w-md text-lg text-neutral-500">
            Nền tảng thương mại điện tử đa người bán.
            <br />
            Mua sắm thông minh, giá tốt mỗi ngày.
          </p>
        </div>

        {/* CTA Button — Primary Yellow */}
        <button
          type="button"
          className="rounded-full bg-primary-400 px-8 py-3 text-base font-semibold text-neutral-900 shadow-sm transition-all duration-200 hover:bg-primary-500 hover:shadow-md active:scale-[0.98]"
        >
          Khám phá ngay
        </button>
      </main>
    </div>
  );
}
