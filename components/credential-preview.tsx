export function CredentialPreview() {
  return (
    <aside className="sample" aria-labelledby="sample-title">
      <p className="sample-kicker" id="sample-title">
        Ejemplo de ficha
      </p>
      <div className="sample-hero">
        <div className="seal" aria-hidden="true">
          <svg width="42" height="42" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M32 4 55 14v18c0 13-9 22-23 28C18 54 9 45 9 32V14L32 4Z" />
            <path d="m22 32 7 7 15-17" strokeWidth="4" />
          </svg>
        </div>
        <div>
          <p className="eyebrow">Certificación profesional</p>
          <p className="sample-heading">Professional Scrum Master I</p>
          <p className="sample-name">Ana Ruiz Castell</p>
          <span className="pill-issuer">Scrum.org</span>
        </div>
      </div>
      <dl className="sample-fields">
        <div>
          <dt>Fecha de obtención</dt>
          <dd>7 de junio de 2019</dd>
        </div>
        <div>
          <dt>Identificación</dt>
          <dd>6b167744-35dd-4c43</dd>
        </div>
      </dl>
      <div className="skills" aria-label="Competencias de ejemplo">
        <span>Scrum Framework</span>
        <span>Agile Principles</span>
        <span>Scrum Master</span>
      </div>
    </aside>
  );
}
