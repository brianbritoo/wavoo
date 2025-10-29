export default function Phone({ children }: { children: React.ReactNode }) {
    return (
      <div className="mx-auto w-full max-w-sm bg-white min-h-dvh flex flex-col">
        <div className="flex-1 overflow-y-auto">{children}</div>
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </div>
    );
  }
  