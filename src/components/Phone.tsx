export default function Phone({ children }: { children: React.ReactNode }) {
    // Contenedor tipo “móvil” con alto de pantalla y scroll interno
    return (
      <div className="mx-auto w-full max-w-sm bg-white min-h-dvh flex flex-col">
        {/* contenido scrollable */}
        <div className="flex-1 overflow-y-auto">{children}</div>
        {/* espacio para la safe-area en iOS si lo necesitas */}
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </div>
    );
  }
  