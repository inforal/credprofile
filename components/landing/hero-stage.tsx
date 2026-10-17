export function HeroStage() {
  return (
    <div className="lp-stage">
      <p className="lp-sr">
        Ejemplo visual: un perfil con varias credenciales y una ficha pública abierta encima, con insignia y enlace
        oficial opcional.
      </p>
      <div className="lp-stage-glow" aria-hidden="true" />
      <article className="lp-profile" aria-hidden="true">
        <div className="lp-profile-top">
          <span className="lp-avatar" />
          <div>
            <strong>Ana Ruiz</strong>
            <span>credprofile.com/ana</span>
          </div>
          <em>3 fichas</em>
        </div>
        <ul>
          <li>
            <span className="lp-dot cyan" />
            Professional Scrum Master I
            <b>Pública</b>
          </li>
          <li>
            <span className="lp-dot blue" />
            AWS Certified AI Strategist
            <b>Pública</b>
          </li>
          <li>
            <span className="lp-dot muted" />
            PRINCE2 Foundation
            <b className="draft">Borrador</b>
          </li>
        </ul>
      </article>
      <article className="lp-sheet" aria-hidden="true">
        <div className="lp-badge" />
        <div>
          <p>Ficha publicada</p>
          <h3>Professional Scrum Master I</h3>
          <span>Ana Ruiz · Scrum.org</span>
          <div className="lp-sheet-meta">
            <i>Insignia</i>
            <i>PDF</i>
            <i>Enlace oficial</i>
          </div>
        </div>
      </article>
      <p className="lp-chip lp-chip-url" aria-hidden="true">
        credprofile.com/ana/psm-i
      </p>
    </div>
  );
}
