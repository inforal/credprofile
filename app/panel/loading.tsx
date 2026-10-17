export default function PanelLoading() {
  return (
    <main className="container stack" id="contenido" aria-busy="true">
      <p className="loading-line" role="status">Cargando el panel…</p>
      <div className="card pad skeleton" />
      <div className="card pad skeleton tall" />
    </main>
  );
}
