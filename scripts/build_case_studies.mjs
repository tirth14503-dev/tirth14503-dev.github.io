/** Build portable, script-free case studies from the portfolio's existing copy. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(resolve(root, 'index.html'), 'utf8');
const literal = source.match(/const CASES=(\{[\s\S]*?\n  \});/);
if (!literal) throw new Error('Case-study source was not found.');
const cases = vm.runInNewContext(`(${literal[1]})`, Object.create(null), { timeout: 1000 });
const details = {
  forecast: {
    summary: 'Retail demand modeling that connects data preparation, feature engineering, and replenishment planning.',
    context: 'Academic team project in MGT 594. Deliverable: cleaned retail data, engineered features, and a forecasting model comparison for replenishment planning.',
    role: 'EDA and feature engineering in a team project',
    deliverable: 'Forecasting pipeline and model comparison',
  },
  kehe: {
    summary: 'A lane-level carrier-award recommendation balancing transportation cost, coverage, and service.',
    context: 'University industry practicum using KeHE’s 2024 inbound truckload RFP. Deliverable: a lane-level carrier-award recommendation balancing cost, coverage, and service.',
    role: 'Lane-level bid analysis and award recommendation',
    deliverable: 'Carrier-award recommendation',
  },
  automation: {
    summary: 'A repeatable workflow from supply chain data to analysis and stakeholder alerts.',
    context: 'Self-directed build. Deliverable: a Postgres-to-analysis-to-email workflow connecting Supabase, AI-assisted analysis, and stakeholder alerts.',
    role: 'Warehouse, analysis, and workflow integration',
    deliverable: 'Data-to-analysis-to-email pipeline',
  },
  segmentation: {
    summary: 'Customer clusters translated into distinct loyalty recommendations.',
    context: 'Machine-learning project. Deliverable: customer clusters, elbow-method validation, and tailored loyalty recommendations for each segment.',
    role: 'Clustering, validation, and segment profiling',
    deliverable: 'Customer segments and loyalty recommendations',
  },
  churn: {
    summary: 'An interpretable decision tree that connects churn signals with proposed retention actions.',
    context: 'Machine-learning project. Deliverable: a decision-tree classifier with tuned depth and leaf size, translated into proposed retention actions.',
    role: 'Classifier development, tuning, and interpretation',
    deliverable: 'Churn classifier and proposed retention actions',
  },
  optimization: {
    summary: 'Production planning under capacity and demand constraints, with sensitivity analysis to support decisions.',
    context: 'Decision-modeling coursework. Deliverable: constrained production models in Excel Solver, sensitivity analysis, and cost/capacity scenarios.',
    role: 'Model formulation, optimization, and scenarios',
    deliverable: 'Production plan and sensitivity analysis',
  },
};
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const paragraph = value => esc(value).replaceAll('&lt;strong&gt;', '<strong>').replaceAll('&lt;/strong&gt;', '</strong>');
const keys = Object.keys(details);
for (const [i, key] of keys.entries()) {
  const c = cases[key], d = details[key];
  if (!c) throw new Error(`Case-study copy missing: ${key}`);
  const next = keys[(i + 1) % keys.length];
  const canonical = `https://tirthalkothari.com/projects/${key}/`;
  const title = `${c.title} · Tirthal Kothari`;
  const description = `${d.summary} A case study by Tirthal Kothari.`;
  const articleLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: canonical,
    mainEntityOfPage: canonical,
    image: 'https://tirthalkothari.com/og.jpg',
    author: { '@type': 'Person', name: 'Tirthal Kothari', url: 'https://tirthalkothari.com/' },
  }).replaceAll('<', '\\u003c');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-3858WEPE8Y"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-3858WEPE8Y');
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(d.summary)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://tirthalkothari.com/og.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/assets/css/case-study.css?v=20261110">
  <script type="application/ld+json">${articleLd}</script>
</head>
<body>
  <a class="skip-link" href="#case-study">Skip to case study</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="wordmark" href="/" aria-label="Tirthal Kothari home">TK</a>
      <nav class="header-nav" aria-label="Portfolio navigation">
        <a href="/#projects">All projects</a>
        <a href="/#contact">Contact</a>
      </nav>
    </div>
  </header>
  <main class="page-shell" id="case-study" tabindex="-1">
    <a class="back-link" href="/#projects">← Back to projects</a>
    <article aria-labelledby="project-title">
      <header class="project-header">
        <h1 id="project-title">${esc(c.title)}</h1>
        <p class="project-type">${esc(c.badge)} · Tirthal Kothari</p>
        <p class="project-summary">${esc(d.summary)}</p>
      </header>
      <div class="study-layout">
        <div class="study-content">
          <section class="study-section" aria-labelledby="challenge-title">
            <h2 id="challenge-title">The challenge</h2>
            <p>${paragraph(c.situation)}</p>
          </section>
          <section class="study-section" aria-labelledby="approach-title">
            <h2 id="approach-title">What I did</h2>
            <p>${paragraph(c.action)}</p>
          </section>
          <section class="study-section" aria-labelledby="deliverable-title">
            <h2 id="deliverable-title">The deliverable</h2>
            <p>${paragraph(c.result)}</p>
          </section>
          <section class="study-section" aria-labelledby="tools-title">
            <h2 id="tools-title">Tools &amp; methods</h2>
            <ul class="tool-list">${c.tools.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
          </section>
        </div>
        <aside class="project-details" aria-labelledby="details-title">
          <h2 id="details-title">At a glance</h2>
          <dl>
            <div><dt>My contribution</dt><dd>${esc(d.role)}</dd></div>
            <div><dt>Deliverable</dt><dd>${esc(d.deliverable)}</dd></div>
          </dl>
        </aside>
      </div>
      <section class="project-context" aria-labelledby="context-title">
        <h2 id="context-title">Project context</h2>
        <p>${esc(d.context)}</p>
      </section>
      <div class="project-actions">
        <a class="button" href="mailto:tirth14503@gmail.com">Discuss this project →</a>
        <a class="button secondary" href="/Tirthal_Kothari_Resume.pdf" download="Tirthal_Kothari_Resume.pdf">Download résumé ↓</a>
      </div>
    </article>
    <a class="next-project" href="/projects/${next}/" aria-label="Next project: ${esc(cases[next].title)}">
      <div><span>Next project</span><strong>${esc(cases[next].title)}</strong></div>
      <span class="arrow" aria-hidden="true">→</span>
    </a>
  </main>
  <footer class="site-footer">
    <div class="footer-inner">
      <p>Tirthal Kothari · Supply chain &amp; analytics</p>
      <a href="https://linkedin.com/in/tirthalkothari" target="_blank" rel="noopener">LinkedIn ↗</a>
    </div>
  </footer>
</body>
</html>
`;
  const directory = resolve(root, 'projects', key);
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, 'index.html'), html, 'utf8');
}
console.log(`Built ${keys.length} standalone case studies.`);
