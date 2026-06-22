export function AdminUnderConstruction() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="max-w-md rounded-2xl border border-border bg-card px-8 py-10 text-center shadow-xs">
        <p className="text-4xl" aria-hidden="true">
          🚧
        </p>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          Dashboard under construction
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We&apos;re rebuilding this page. Use Bookings, Inquiries, or Fleet from the sidebar
          for now.
        </p>
      </div>
    </div>
  );
}
