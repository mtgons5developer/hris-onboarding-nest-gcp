function isLocalHost(): boolean {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

function resolvePortalUrl(
  envValue: string | undefined,
  localDefault: string,
  productionDefault: string,
): string {
  if (envValue) return envValue;
  return isLocalHost() ? localDefault : productionDefault;
}

function adminUrl(): string {
  return resolvePortalUrl(
    import.meta.env.VITE_ADMIN_URL,
    'http://localhost:5173',
    'https://admin.getlakbay.com',
  );
}

function onboardingUrl(): string {
  return resolvePortalUrl(
    import.meta.env.VITE_ONBOARDING_URL,
    'http://localhost:5174',
    'https://onboarding.getlakbay.com',
  );
}

const FEATURES = [
  {
    title: 'Hire-to-onboard events',
    description:
      'Create an onboarding case when someone joins. HR assigns tasks, due dates, and owners in one workflow — no spreadsheet handoffs.',
    image:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop&q=80',
    alt: 'Team collaborating around a laptop in a modern office',
  },
  {
    title: 'Day-one access',
    description:
      'New hires sign in with Cognito Hosted UI and land on a checklist scoped to their case. Managers and HR see the same source of truth.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=80',
    alt: 'People in a meeting reviewing onboarding materials',
  },
  {
    title: 'Document collection',
    description:
      'Upload IDs and forms with size quotas and review states. Storage swaps between local disk and S3 without changing the API contract.',
    image:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop&q=80',
    alt: 'Person signing paperwork at a desk',
  },
  {
    title: 'Manager + HR roles',
    description:
      'RBAC via JWT claims: HR admins manage cases and employees; managers approve tasks; new hires complete their own checklist.',
    image:
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=500&fit=crop&q=80',
    alt: 'Manager and colleague discussing work at a whiteboard',
  },
] as const;

const PROOF_ITEMS = [
  { stat: 'NestJS', label: 'modular API' },
  { stat: 'PostgreSQL', label: 'Prisma ORM' },
  { stat: 'Cognito', label: 'OIDC + PKCE' },
  { stat: 'Cloudflare', label: 'Pages + Tunnel' },
] as const;

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M15 20c.3-2.2 1.8-4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const ADMIN_URL = adminUrl();
  const ONBOARDING_URL = onboardingUrl();

  return (
    <div className="page">
      <header className="nav">
        <div className="nav__inner">
          <a className="brand" href="/">
            <span className="brand__mark" aria-hidden="true">
              G
            </span>
            <span className="brand__text">
              Getlakbay
              <span className="brand__sub">A24 HRIS Lab</span>
            </span>
          </a>
          <nav className="nav__links" aria-label="Primary">
            <a href="#products">Products</a>
            <a href="#features">Features</a>
            <a href="#stack">Stack</a>
          </nav>
          <div className="nav__actions">
            <a className="btn btn--ghost btn--sm" href={ONBOARDING_URL}>
              Employee portal
            </a>
            <a className="btn btn--primary btn--sm" href={ADMIN_URL}>
              HR Admin
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero__inner">
            <div className="hero__copy">
              <p className="eyebrow">Staff-aug &amp; BPO demo · Emapta interview lab</p>
              <h1>
                HR + onboarding
                <em> in one place</em>
              </h1>
              <p className="hero__lead">
                A portfolio-grade stack for hiring workflows: NestJS modules, PostgreSQL, Cognito
                IAM, and two React portals — plus a Flutter mobile client on the same API.
              </p>
              <div className="hero__ctas">
                <a className="btn btn--primary btn--lg" href={ADMIN_URL}>
                  <IconShield />
                  HR Admin
                  <IconArrow />
                </a>
                <a className="btn btn--secondary btn--lg" href={ONBOARDING_URL}>
                  <IconUsers />
                  Employee onboarding
                  <IconArrow />
                </a>
              </div>
              <p className="hero__note">
                Separate sign-in flows · Hosted UI on production · Dev bypass on localhost only
              </p>
            </div>
            <div className="hero__visual">
              <div className="hero__image-wrap">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80"
                  alt="Bright modern office workspace with desks and natural light"
                  width={1200}
                  height={800}
                  loading="eager"
                />
                <div className="hero__card hero__card--admin">
                  <span className="hero__card-label">HR Admin</span>
                  <strong>3 open cases</strong>
                  <span className="hero__card-meta">Luis Reyes · due Friday</span>
                </div>
                <div className="hero__card hero__card--onboard">
                  <span className="hero__card-label">Onboarding</span>
                  <strong>6 / 8 tasks done</strong>
                  <span className="hero__card-meta">Upload ID · pending review</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="proof" aria-label="Technology stack">
          <div className="proof__inner">
            {PROOF_ITEMS.map((item) => (
              <div className="proof__item" key={item.stat}>
                <span className="proof__stat">{item.stat}</span>
                <span className="proof__label">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="products" id="products">
          <div className="section-head">
            <p className="eyebrow">Two portals, one API</p>
            <h2>Pick your entry point</h2>
            <p className="section-head__lead">
              HR operators and new hires never share the same UI — but they share cases, tasks, and
              documents through Nest.
            </p>
          </div>
          <div className="products__grid">
            <article className="product-tile product-tile--admin">
              <div className="product-tile__icon" aria-hidden="true">
                <IconShield />
              </div>
              <h3>HR Admin</h3>
              <p>
                Manage employees, open onboarding cases, review uploaded documents, and audit
                state changes. Built for HR admins and managers.
              </p>
              <ul className="product-tile__list">
                <li>Employee directory &amp; roles</li>
                <li>Case lifecycle &amp; task assignment</li>
                <li>Document review queue</li>
              </ul>
              <a className="btn btn--primary" href={ADMIN_URL}>
                Open HR Admin
                <IconArrow />
              </a>
              <img
                className="product-tile__thumb"
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&q=80"
                alt="HR professional working at a laptop with charts on screen"
                width={600}
                height={400}
                loading="lazy"
              />
            </article>

            <article className="product-tile product-tile--onboard">
              <div className="product-tile__icon" aria-hidden="true">
                <IconUsers />
              </div>
              <h3>Employee onboarding</h3>
              <p>
                New hires sign in, see their checklist, upload required documents, and mark tasks
                complete — scoped to their case only.
              </p>
              <ul className="product-tile__list">
                <li>Personalized task checklist</li>
                <li>Secure document upload</li>
                <li>Mobile app on the same API</li>
              </ul>
              <a className="btn btn--secondary" href={ONBOARDING_URL}>
                Start onboarding
                <IconArrow />
              </a>
              <img
                className="product-tile__thumb"
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f1e?w=600&h=400&fit=crop&q=80"
                alt="New employee smiling while setting up at a desk"
                width={600}
                height={400}
                loading="lazy"
              />
            </article>
          </div>
        </section>

        <section className="features" id="features">
          <div className="section-head section-head--light">
            <p className="eyebrow">End-to-end workflow</p>
            <h2>From offer letter to day one</h2>
            <p className="section-head__lead">
              The lab mirrors how staff-aug teams run hire events — without copying any vendor UI.
            </p>
          </div>
          <div className="features__grid">
            {FEATURES.map((feature, index) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-card__media">
                  <img src={feature.image} alt={feature.alt} width={800} height={500} loading="lazy" />
                  <span className="feature-card__index">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="feature-card__body">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-band" id="stack">
          <div className="cta-band__inner">
            <div className="cta-band__copy">
              <h2>Ready to explore the demo?</h2>
              <p>
                Sign in with Cognito on production hosts. Local dev uses Keycloak seed tokens and
                Harper shortcuts — never on getlakbay.com.
              </p>
            </div>
            <div className="cta-band__actions">
              <a className="btn btn--light btn--lg" href={ADMIN_URL}>
                HR Admin
                <IconArrow />
              </a>
              <a className="btn btn--outline-light btn--lg" href={ONBOARDING_URL}>
                Employee onboarding
                <IconArrow />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="brand__mark brand__mark--footer" aria-hidden="true">
              G
            </span>
            <div>
              <strong>Getlakbay</strong>
              <p>A24 HRIS Lab · portfolio demo</p>
            </div>
          </div>
          <div className="footer__links">
            <a href={ADMIN_URL}>admin.getlakbay.com</a>
            <a href={ONBOARDING_URL}>onboarding.getlakbay.com</a>
            <a href="https://api.getlakbay.com/health">api.getlakbay.com</a>
          </div>
          <p className="footer__disclaimer">
            Lab demo · Nest + Postgres + Cognito + Cloudflare · Not production · Not an Emapta
            deliverable
          </p>
        </div>
      </footer>
    </div>
  );
}
