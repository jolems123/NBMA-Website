// Server-side page templates for the NBMA website.
// Everything is rendered to static HTML strings; no client-side framework is used.

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const icon = (name, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="/assets/icons.svg#${name}"></use></svg>`;

const isExternal = (href) => /^https?:\/\//.test(href);

/** Tesla-style button. Variants: primary | secondary | text */
const btn = (href, label, variant = 'primary') => {
  const ext = isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
  const hint = isExternal(href) ? '<span class="visually-hidden"> (opens in a new tab)</span>' : '';
  return `<a class="btn btn-${variant}" href="${esc(href)}"${ext}>${label}${hint}</a>`;
};

const eyebrow = (text) => `<p class="eyebrow">${text}</p>`;

const extLink = (href, label) =>
  `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;

const SURVEY_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfdSg1kUjnFziIAJ2Y6GjZ4EWJzUhtxq-eWyrSnNBVMQ4q6ZA/viewform';

// ---------------------------------------------------------------------------
// Media register: single source of truth for every third-party photo/video.
// Credits on panels, the footer and /media-credits are all generated from here.
// ---------------------------------------------------------------------------

const LICENCES = {
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC0 1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
};

const UPLOAD = 'https://upload.wikimedia.org/wikipedia/commons';
const filePath = (file, width) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}${width ? `?width=${width}` : ''}`;
const filePage = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;
const srcset = (file) => [960, 1280, 1920].map((w) => `${filePath(file, w)} ${w}w`).join(', ');

/** Wikimedia transcodes: VP9 WebM for Chrome/Firefox/Edge, MPEG-4 QuickTime for Safari. */
const transcodes = (hashPath, file) => ({
  webm: `${UPLOAD}/transcoded/${hashPath}/${file}/${file}.720p.vp9.webm`,
  mov: `${UPLOAD}/transcoded/${hashPath}/${file}/${file}.360p.mpeg4.mov`,
});

export const media = {
  coffee: {
    kind: 'video',
    file: 'Coffee_from_dan_2.webm',
    label: 'Coffee processing',
    place: 'Uganda',
    creator: 'Denis Kasozi',
    licence: 'CC BY-SA 4.0',
    context: 'Wiki Loves Africa 2025, Uganda',
    ...transcodes('d/d7', 'Coffee_from_dan_2.webm'),
  },
  pulping: {
    kind: 'video',
    file: 'Pulping_process.ogv',
    label: 'Coffee pulping',
    place: 'Mbale, Uganda',
    creator: 'Erinamukuta',
    licence: 'CC BY-SA 4.0',
    context: 'Coffee in Uganda, 2015',
    ...transcodes('f/fa', 'Pulping_process.ogv'),
  },
  carving: {
    kind: 'video',
    file: 'Wood_curving_process_2.webm',
    label: 'Hand wood carving',
    place: 'Uganda',
    creator: 'Ainembabazi Leviticus',
    licence: 'CC0 1.0',
    context: 'Wiki Loves Africa 2024, Uganda',
    ...transcodes('2/22', 'Wood_curving_process_2.webm'),
  },
  steel: {
    kind: 'photo',
    file: 'Steelworkers.jpg',
    label: 'Steelworkers',
    place: 'Jinja, Uganda',
    creator: 'The Ethnographer',
    licence: 'CC BY-SA 4.0',
    alt: 'Metalworkers at a steel works in Jinja, Uganda',
  },
  maize: {
    kind: 'photo',
    file: 'A man operating the maize mill to produce maize flour.jpg',
    label: 'Maize milling',
    place: 'Uganda',
    creator: 'Emmanuel Ssekaggo',
    licence: 'CC BY-SA 4.0',
    alt: 'A man operating a maize mill to produce maize flour in Uganda',
  },
  sandstorm: {
    kind: 'photo',
    file: 'Workforce Sandstorm factory.jpg',
    label: 'Workshop at Sandstorm factory',
    place: 'Kenya',
    creator: 'Elisabeth Smeds',
    licence: 'CC BY-SA 4.0',
    alt: 'Workers at the Sandstorm canvas goods factory in Kenya',
  },
  tailors: {
    kind: 'photo',
    file: 'Tailors working in in a fashion factoryTanzania.jpg',
    label: 'Garment production',
    place: 'Tanzania',
    creator: 'Thukuk',
    licence: 'CC BY-SA 4.0',
    alt: 'Tailors working at sewing machines in a garment factory in Tanzania',
  },
};

const credit = (m) =>
  `${m.label}, ${m.place} · ${m.creator} · ${extLink(LICENCES[m.licence], m.licence)} · ${extLink(filePage(m.file), 'Source')}`;

/** Full-bleed background photo with its credit. */
const bgPhoto = (m, { eager = false, cls = 'panel-media' } = {}) =>
  `<figure class="${cls}"><img data-remote src="${filePath(m.file, 1920)}" srcset="${srcset(m.file)}" sizes="100vw" alt="${esc(m.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"><figcaption class="media-credit">${credit(m)}</figcaption></figure>`;

// ---------------------------------------------------------------------------
// Content data
// ---------------------------------------------------------------------------

const nav = [
  { url: '/about', label: 'About' },
  { url: '/membership', label: 'Membership' },
  { url: '/programmes', label: 'What We Do' },
  { url: '/advocacy', label: 'Advocacy' },
  { url: '/resources', label: 'Resources' },
  { url: '/contact', label: 'Contact' },
];

const drawerNav = [
  { url: '/', label: 'Home' },
  ...nav.slice(0, 5),
  { url: '/events', label: 'Events' },
  nav[5],
];

export const sectors = [
  'Food & Beverages',
  'Agro-processing',
  'Textiles & Garments',
  'Plastics & Packaging',
  'Cosmetics & Personal Care',
  'Building Materials',
  'Metal Fabrication & Machinery',
  'Pharmaceuticals & Health',
  'Furniture & Wood',
  'Chemicals & Industrial Inputs',
];

const programmeCards = [
  ['badge-check', 'Standards & certification', 'Practical guidance on regulatory compliance, quality management and readiness for product certification.', 'Standards clinics and manufacturer training are proposed.'],
  ['globe', 'Markets & trade', 'Connecting manufacturers with prospective buyers, distribution channels and regional trade opportunities.', 'Directory and buyer introductions are being developed.'],
  ['chart', 'Finance & investment', 'Helping members understand financing options, investment requirements and bankability.', 'Investment-readiness support is proposed.'],
  ['megaphone', 'Policy & representation', 'Bringing manufacturer concerns to public institutions through consultation and evidence-based proposals.', 'Member evidence informs our positions.'],
  ['users', 'Learning & collaboration', 'Sector groups, peer exchanges, technical sessions and practical manufacturing knowledge sharing.', 'Programmes will be scheduled as capacity permits.'],
  ['layers', 'Industrial linkages', 'Promoting sourcing relationships, manufacturing collaboration and value-chain development.', 'Commercial agreements are independently negotiated.'],
];

const serviceCards = programmeCards
  .map(
    ([ic, title, desc, status]) =>
      `<article class="service-card"><div class="service-icon">${icon(ic, 26)}</div><h3>${title}</h3><p>${desc}</p><p class="card-foot">${status}</p></article>`,
  )
  .join('');

const boardNote = `<div class="notice"><p class="eyebrow">Institutional transparency</p><p>NBMA is developing its member programmes and partnerships. Services and external collaborations described as planned are not represented as already operational. Membership rights and fees are subject to approved governing documents.</p></div>`;

// ---------------------------------------------------------------------------
// Shared page sections
// ---------------------------------------------------------------------------

/** Inner-page hero: full-bleed photo (or branded backdrop) with a centred title. */
const intro = (kicker, title, lead, m) =>
  `<section class="page-hero${m ? '' : ' page-hero--plain'}" data-header="dark">${m ? bgPhoto(m, { eager: true, cls: 'page-hero-media' }) : ''}<div class="scrim" aria-hidden="true"></div><div class="page-hero-copy container">${eyebrow(kicker)}<h1>${title}</h1><p>${lead}</p></div></section>`;

/** Home-page hero reel: Ugandan production videos that crossfade into each other. */
const heroReel = (localVideo) => {
  const clips = [media.coffee, media.carving, media.pulping];
  const slides = [];
  const credits = [];

  if (localVideo) {
    slides.push(
      `<div class="reel-slide"><video muted playsinline loop preload="auto" poster="/assets/hero-poster.svg"><source src="/media/manufacturing-hero.mp4" type="video/mp4"></video></div>`,
    );
    credits.push(`<span class="reel-credit-item">Manufacturing footage · licensed to NBMA · <a href="/media-credits">Media credits</a></span>`);
  }

  for (const m of clips) {
    const first = slides.length === 0;
    const poster = filePath(m.file, 1280);
    slides.push(
      `<div class="reel-slide"><img class="reel-still" data-remote src="${poster}" alt="" ${first ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"><video muted playsinline loop preload="${first ? 'auto' : 'none'}" poster="${poster}"><source src="${m.webm}" type="video/webm"><source src="${m.mov}" type="video/quicktime"></video></div>`,
    );
    credits.push(`<span class="reel-credit-item">${credit(m)}</span>`);
  }

  const dots = slides
    .map((_, i) => `<button class="reel-dot" type="button" aria-label="Show clip ${i + 1} of ${slides.length}"><i></i></button>`)
    .join('');

  return `<div class="reel" data-reel data-duration="8000" aria-hidden="true">${slides.join('')}</div>
<div class="reel-ui"><p class="media-credit reel-credit">${credits.join('')}</p><div class="reel-controls"><div class="reel-dots">${dots}</div><button class="reel-toggle" type="button" aria-pressed="false" aria-label="Pause background video"><span class="reel-toggle-pause" aria-hidden="true"></span><span class="reel-toggle-play" aria-hidden="true"></span></button></div></div>`;
};

/** Full-screen Tesla-style panel: title at the top, actions at the bottom. */
const panel = ({ id, m, kicker, title, lead, actions }) =>
  `<section class="panel" id="${id}" data-header="dark">${bgPhoto(m)}<div class="scrim" aria-hidden="true"></div><div class="panel-copy">${eyebrow(kicker)}<h2>${title}</h2><p>${lead}</p></div><div class="panel-actions">${actions}</div></section>`;

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

const home = (opts) => `<section class="panel panel--hero" id="top" data-header="dark" aria-label="Introduction">${heroReel(opts.localHeroVideo)}<div class="scrim" aria-hidden="true"></div><div class="panel-copy">${eyebrow('Nile Basin Manufacturers Association')}<h1>Stronger industry. Greater possibilities.</h1><p>Building a connected, competitive and future-ready manufacturing community in Uganda and across the Nile Basin.</p></div><div class="panel-actions">${btn('/join', 'Become a member')}${btn('/about', 'Discover NBMA', 'secondary')}</div><a href="#membership" class="scroll-cue" aria-label="Scroll to next section"><span aria-hidden="true"></span></a></section>
${panel({
  id: 'membership',
  m: media.steel,
  kicker: 'Membership',
  title: 'When manufacturers move together, industry moves forward.',
  lead: 'A member-led association that represents, connects and empowers manufacturing enterprises.',
  actions: btn('/join', 'Apply for membership') + btn('/membership', 'How membership works', 'secondary'),
})}
${panel({
  id: 'programmes',
  m: media.maize,
  kicker: 'Programmes',
  title: 'Built around the factory floor.',
  lead: 'Standards, market access, finance readiness and skills: the challenges that matter most to manufacturers.',
  actions: btn('/programmes', 'Explore what we do') + btn('/contact', 'Share a challenge', 'secondary'),
})}
${panel({
  id: 'advocacy',
  m: media.sandstorm,
  kicker: 'Active consultation',
  title: 'Evidence before advocacy.',
  lead: 'The Manufacturers’ Taxation & Business Impact Survey is open. Participation is voluntary and hosted in Google Forms.',
  actions: btn(SURVEY_URL, 'Take the survey') + btn('/advocacy', 'Our advocacy priorities', 'secondary'),
})}
${panel({
  id: 'sectors',
  m: media.tailors,
  kicker: 'Priority sectors',
  title: 'Many sectors. One ambition.',
  lead: 'From food processing to pharmaceuticals, from growing workshops to established production facilities.',
  actions: btn('/join', 'Join NBMA') + btn('/contact', 'Speak to NBMA', 'secondary'),
})}
<aside class="media-note"><div class="container"><p>The photographs and video on this page document industry in Uganda, Kenya and Tanzania. They do not imply NBMA membership, partnership or endorsement by the people, businesses or creators shown. <a href="/media-credits">Full media credits &amp; licences</a></p></div></aside>
<section class="section"><div class="container"><div class="section-head">${eyebrow('Member priorities')}<h2>Built around what manufacturers need.</h2><p>Our proposed programmes focus on the operating and growth needs of manufacturing businesses.</p></div><div class="services-grid">${serviceCards}</div><div class="center-actions">${btn('/programmes', 'Explore all areas of work', 'secondary')}</div></div></section>
<section class="section section-surface"><div class="container"><div class="section-head">${eyebrow('Priority manufacturing sectors')}<h2>Ten sectors. One stronger voice.</h2><p>Our membership framework is designed to include manufacturers across a diverse range of sectors and business sizes.</p></div><div class="sector-grid">${sectors.map((s, i) => `<a href="/join" class="sector"><span>${String(i + 1).padStart(2, '0')}</span><strong>${s}</strong>${icon('arrow', 18)}</a>`).join('')}</div></div></section>
<section class="section cta-section"><div class="container cta-inner"><h2>Building stronger manufacturing begins with you.</h2><p>Whether you operate a growing workshop or an established production facility, there is a place for your perspective.</p><div class="button-row">${btn('/join', 'Apply for membership')}${btn('/contact', 'Contact the Secretariat', 'secondary')}</div></div></section>`;

const about = () => `${intro('The association', 'A united platform for manufacturing progress.', 'Nile Basin Manufacturers Association Limited is being developed as a member-led voice for manufacturing enterprises, connecting industry needs with practical action.', media.steel)}
<section class="section"><div class="container two-col"><div>${eyebrow('Our purpose')}<h2>Representation with real-world relevance.</h2></div><div class="right-copy"><p>Our role is to represent and empower manufacturers—not to operate as a manufacturing company or guarantee markets, financing or certification. We aim to bring businesses together around shared priorities: standards, knowledge, industrial collaboration, markets and policy dialogue.</p><p>NBMA is incorporated in Uganda as a company limited by guarantee, without share capital. Membership and governance rights are determined by the registered governing documents and duly approved rules.</p></div></div></section>
<section class="section section-surface"><div class="container"><div class="section-head">${eyebrow('What guides us')}<h2>Principles that build trust.</h2></div><div class="triple-grid"><article><span class="number">01</span><h3>Member-centred</h3><p>Manufacturers' priorities should guide programme design and institutional decisions.</p></article><article><span class="number">02</span><h3>Accountable</h3><p>Clear governance, transparent finances, lawful operations and respectful representation.</p></article><article><span class="number">03</span><h3>Practical</h3><p>Services and partnerships should respond to genuine factory needs and measurable results.</p></article></div></div></section>
<section class="section"><div class="container">${eyebrow('Proposed governance')}<h2>Member-led. Professionally managed.</h2><ol class="governance"><li>General Assembly of eligible members</li><li>Board of Directors</li><li>Executive Director &amp; Secretariat</li><li>Membership &amp; sector groups · Programmes · Finance &amp; administration</li></ol>${boardNote}</div></section>`;

const membership = () => `${intro('Membership', 'A stronger voice starts with membership.', 'Join an emerging network of manufacturers committed to practical cooperation, better industry services and constructive engagement.', media.tailors)}
<section class="section"><div class="container">${eyebrow('The member journey')}<h2>Five steps to participation.</h2><ol class="journey">${[
  ['Apply', 'Tell us about your business and manufacturing activities.'],
  ['Review', 'The Association checks eligibility and information.'],
  ['Admission', 'Authorised officers communicate decisions and applicable fees.'],
  ['Orientation', 'Understand member rights, responsibilities and services.'],
  ['Participate', 'Join sector groups, consultations and programmes.'],
]
  .map(([t, d], i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></li>`)
  .join('')}</ol></div></section>
<section class="section section-surface"><div class="container two-col"><div>${eyebrow('What to expect')}<h2>Belong to a network designed to deliver value.</h2></div><div><ul class="bullet-list"><li>Opportunities to participate in sector forums and industry consultations.</li><li>Information on standards, regulation, trade and investment readiness.</li><li>Access to planned training and member programmes, subject to availability.</li><li>Opportunities to connect with peers, potential buyers and technical partners.</li><li>Member governance rights as provided by NBMA’s governing documents.</li></ul>${btn('/join', 'Start an application')}</div></div></section>
<section class="section"><div class="container">${eyebrow('Questions')}<h2>Membership FAQ</h2><div class="faq"><details><summary>Who can apply for membership?</summary><p>Businesses engaged in genuine manufacturing and other eligible applicants under approved membership categories. Applications are reviewed before admission.</p></details><details><summary>Is membership automatic after submitting the form?</summary><p>No. The application is an expression of interest, not confirmation of admission. NBMA will review submissions under its approved rules.</p></details><details><summary>How much does membership cost?</summary><p>Current fee schedules must be confirmed by NBMA's authorised leadership. This website does not collect membership payments.</p></details><details><summary>Are business contracts or certification guaranteed?</summary><p>No. Any partnerships, commercial introductions, funding or certification decisions depend on independent eligibility, due diligence and third parties.</p></details></div></div></section>`;

const programmes = () => `${intro('Programmes & services', 'Turning collective ambition into practical support.', 'NBMA is developing a focused set of services around the real operating and growth needs of manufacturers.', media.maize)}
<section class="section"><div class="container"><div class="services-grid">${serviceCards}</div>${boardNote}</div></section>
<section class="section section-surface"><div class="container two-col"><div>${eyebrow('Help set the agenda')}<h2>Tell us what matters most to your factory.</h2></div><div class="right-copy"><p>Member consultation and manufacturing needs assessments will shape service priorities, budgets and implementation schedules.</p>${btn('/contact', 'Share a manufacturing challenge')}</div></div></section>`;

const surveyPanel = (lead, label) =>
  `<div class="editorial-panel"><p class="small-kicker">Share your experience</p><h3>Manufacturers’ Taxation &amp; Business Impact Survey</h3><p>${lead}</p>${btn(SURVEY_URL, label)}<small>Participation is voluntary. The survey is hosted in Google Forms.</small></div>`;

const advocacy = () => `${intro('Advocacy & policy', 'A credible voice for competitive manufacturing.', 'Our approach is constructive, evidence-led and focused on practical improvements to the conditions under which manufacturers operate.', media.sandstorm)}
<section class="section"><div class="container"><div class="section-head">${eyebrow('Where we focus')}<h2>Policy grounded in production.</h2><p>We distinguish the interests of industrial input users from those of importers of finished consumer goods, while supporting fair taxation and legitimate trade.</p></div><div class="triple-grid"><article><span class="number">01</span><h3>Fair tax administration</h3><p>Predictable assessments, clear guidance, accessible review procedures and compliance support.</p></article><article><span class="number">02</span><h3>Competitive input costs</h3><p>Practical consideration of machinery, spare parts, packaging and industrial raw materials.</p></article><article><span class="number">03</span><h3>Fair markets</h3><p>Consistent application of customs, trade and product-standard rules.</p></article></div></div></section>
<section class="section section-surface"><div class="container editorial"><div>${eyebrow('Current consultation')}<h2>Taxation and the URA–KACITA dispute.</h2><p>NBMA has prepared draft materials for Board consideration regarding the implications of customs and retail disruptions for Uganda's manufacturers. These are not yet adopted public positions.</p><p>The Association is collecting manufacturer-level evidence before finalising formal recommendations.</p>${btn('/resources', 'View consultation resources', 'secondary')}</div>${surveyPanel('Contribute to the evidence base behind future dialogue with government and other stakeholders.', 'Respond to the survey')}</div></section>`;

const resources = () => `${intro('Resources & insights', 'Information for a better-informed manufacturing community.', 'Access current consultations and learn about the programmes and support NBMA is developing.', media.maize)}
<section class="section"><div class="container"><div class="resource-grid"><article class="resource-card"><p class="resource-meta">Survey · 2026</p><h3>Manufacturers’ Taxation and Business Impact Survey</h3><p>Provide evidence on taxes, customs processes, commercial disruptions and industrial competitiveness.</p>${btn(SURVEY_URL, 'Complete survey', 'text')}</article><article class="resource-card"><p class="resource-meta">Membership · Information</p><h3>How to join NBMA</h3><p>Understand the application, review and admission process, and the member participation framework.</p>${btn('/membership', 'Read membership guide', 'text')}</article><article class="resource-card"><p class="resource-meta">Policy · Development</p><h3>Manufacturing policy consultations</h3><p>Find out how NBMA gathers evidence and develops Board-approved positions on industrial matters.</p>${btn('/advocacy', 'Explore advocacy', 'text')}</article></div><div class="notice"><p class="eyebrow">Document publication policy</p><p>Draft Board papers, membership registers and internal governance documents are not publicly published. Approved reports and policies can be added here when authorised.</p></div></div></section>`;

const events = () => `${intro('Events & engagement', 'Convene. Learn. Connect.', 'NBMA aims to create opportunities for peer learning, practical training, sector dialogues and trade engagement.', media.steel)}
<section class="section"><div class="container two-col"><div>${eyebrow('Programme calendar')}<h2>Dates will be announced after confirmation.</h2></div><div class="right-copy"><p>There are currently no publicly confirmed events listed. Proposed masterclasses, policy consultations and regional trade activities will be published only after venues, speakers, programmes and approvals are confirmed.</p>${btn('/contact', 'Enquire about events')}</div></div></section>`;

const privacy = () => `${intro('Privacy', 'How we handle information.', 'This notice explains the website’s approach to personal and business information provided through NBMA forms.')}
<section class="section"><div class="container prose"><h2>Who controls the information?</h2><p>Nile Basin Manufacturers Association Limited (NBMA), Uganda, is the organisation responsible for information submitted through this site. Contact the Association through <a href="/contact">its contact page</a> about privacy requests.</p><h2>What we collect</h2><p>For enquiries we collect your name, email address and message, and optionally your organisation. For membership applications, we collect business identity, representative contact information, manufacturing sector, location, business size and explanatory notes.</p><h2>Why and how we use it</h2><p>To respond to requests, assess membership interest, perform necessary due diligence and plan manufacturer support. We do not use applications to approve membership automatically. Our lawful basis depends on the applicable activity and Uganda's data protection law; where consent is requested, it may be withdrawn for future optional processing.</p><h2>Storage and disclosure</h2><p>Submissions are stored in a restricted PostgreSQL database under the website operator's control. Authorised NBMA personnel and necessary service providers may access data for these purposes. We do not sell applicant data. Data may be disclosed when legally required.</p><h2>Retention and rights</h2><p>We retain records only as reasonably necessary for their purpose, legal obligations and dispute handling. An exact retention schedule requires approval before launch. You may request access, correction or deletion where legally applicable by contacting NBMA. Requests will be reviewed under applicable law.</p><h2>Security and external services</h2><p>The website uses reasonable technical safeguards; no system can promise absolute security. Photographs and video are loaded from Wikimedia Commons, and external survey forms are hosted by Google; those services operate under their own settings and notices.</p><h2>Updates</h2><p>This notice is an initial website policy and should be reviewed by NBMA before public launch and whenever processing arrangements change.</p></div></section>`;

const terms = () => `${intro('Website terms', 'Information and appropriate use.', 'The following terms govern the informational website and online enquiry/application services.')}
<section class="section"><div class="container prose"><h2>Information only</h2><p>Website content provides general institutional information and does not constitute legal, tax, investment or certification advice. NBMA does not guarantee funding, trade contracts, endorsements or regulatory approvals.</p><h2>Membership</h2><p>Submitting an application is not acceptance into membership. Eligibility, fees, benefits and voting rights are governed by approved association rules and its registered Articles. The website does not accept payments.</p><h2>Acceptable use</h2><p>Do not submit unlawful content, impersonate others, attempt unauthorised access or overload the service. We may review or reject inappropriate submissions.</p><h2>External links</h2><p>Links to third-party services are provided for convenience. Those organisations control their own content and processes.</p><h2>Content rights</h2><p>NBMA branding and original site content remain with the relevant rights holders. Commercial reuse requires permission. Third-party photographs and video are used under the licences listed on the <a href="/media-credits">media credits</a> page.</p><h2>Contact</h2><p>For questions about these terms, use the <a href="/contact">contact form</a>.</p></div></section>`;

const honeypot = `<div class="hidden-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>`;
const options = (list, placeholder) =>
  `<option value="">${placeholder}</option>${list.map((x) => `<option>${x}</option>`).join('')}`;

const contact = () => `${intro('Contact', 'Let’s talk manufacturing.', 'Whether you are a factory owner, technical partner, buyer or public institution, we welcome relevant enquiries.', media.sandstorm)}
<section class="section"><div class="container form-layout"><aside class="contact-side">${eyebrow('Contact information')}<h2>Reach the association.</h2><div class="contact-detail"><span>Email</span><a href="mailto:nilebasinmanufacturersassociat@gmail.com">nilebasinmanufacturersassociat@gmail.com</a></div><div class="contact-detail"><span>Telephone</span><a href="tel:+256760626390">+256 760 626390</a><a href="tel:+256751748046">+256 751 748046</a></div><div class="contact-detail"><span>Location</span><p>Nsuube B, Kauga Ward, Mukono Division, Mukono, Uganda</p></div><div class="contact-detail"><span>Postal</span><p>P.O. Box 220205, Kampala, Uganda</p></div></aside>
<div class="form-panel"><h2>Send an enquiry</h2><p>Please do not include passwords, bank details or highly sensitive personal information.</p><form class="ajax-form" action="/api/contact" method="post"><div class="form-grid"><label>Full name <span>*</span><input name="name" required maxlength="100" autocomplete="name"></label><label>Email address <span>*</span><input name="email" type="email" required maxlength="200" autocomplete="email"></label></div><label>Organisation (optional)<input name="organization" maxlength="160" autocomplete="organization"></label><label>Enquiry type <span>*</span><select name="topic" required>${options(['Membership', 'Standards and certification', 'Trade and markets', 'Partnerships', 'Policy and advocacy', 'Media', 'Other'], 'Choose an option')}</select></label><label>Your message <span>*</span><textarea name="message" required minlength="10" maxlength="3000" rows="6"></textarea></label>${honeypot}<label class="checkline"><input type="checkbox" name="consent" value="yes" required><span>I understand NBMA will use these details to respond to my enquiry, as explained in its <a href="/privacy">privacy notice</a>.</span></label><button type="submit" class="btn btn-primary">Send enquiry</button><div class="form-status" role="status" aria-live="polite"></div></form></div></div></section>`;

const join = () => `${intro('Membership application', 'Tell us about your manufacturing enterprise.', 'Complete this expression of interest. NBMA will review your application under its approved membership procedures before confirming admission or applicable fees.', media.tailors)}
<section class="section"><div class="container form-layout"><aside class="contact-side">${eyebrow('Before you begin')}<h2>Help us understand your factory.</h2><p>We welcome enquiries from genuine manufacturers across Uganda and the wider region, subject to eligibility rules.</p><ul class="bullet-list"><li>Submitting the form is free and does not automatically create membership.</li><li>Do not submit national IDs, bank details or confidential trade secrets.</li><li>Official fees, if any, are communicated separately after review.</li><li>Applications are held securely when the database is configured.</li></ul></aside>
<div class="form-panel"><h2>Apply for membership</h2><form class="ajax-form" action="/api/applications" method="post"><div class="form-grid"><label>Business name <span>*</span><input name="businessName" required maxlength="160" autocomplete="organization"></label><label>Contact person <span>*</span><input name="contactName" required maxlength="120" autocomplete="name"></label><label>Email <span>*</span><input name="email" type="email" required maxlength="200" autocomplete="email"></label><label>Phone number <span>*</span><input name="phone" type="tel" required maxlength="30" autocomplete="tel"></label><label>District / location <span>*</span><input name="district" required maxlength="120"></label><label>Manufacturing sector <span>*</span><select name="sector" required>${options([...sectors, 'Other manufacturing'], 'Select sector')}</select></label><label>Approximate permanent employees <span>*</span><select name="employees" required>${options(['1–4', '5–19', '20–49', '50–99', '100–249', '250+'], 'Choose range')}</select></label><label>Business registration status <span>*</span><select name="registration" required>${options(['Registered business', 'Registration in progress', 'Informal / not yet registered'], 'Select status')}</select></label></div><label>Main products / manufacturing activities <span>*</span><textarea name="products" required maxlength="1200" rows="3"></textarea></label><label>What support do you need most? <span>*</span><select name="priority" required>${options(['Standards and certification', 'Market access', 'Finance / investment readiness', 'Manufacturing skills and technology', 'Industry advocacy', 'Supplier and industry linkages'], 'Choose one priority')}</select></label><label>Additional information (optional)<textarea name="notes" maxlength="1500" rows="3"></textarea></label>${honeypot}<label class="checkline"><input type="checkbox" name="consent" value="yes" required><span>I consent to NBMA processing this information to review my membership enquiry and contact me, in line with the <a href="/privacy">privacy notice</a>.</span></label><button type="submit" class="btn btn-primary">Submit application</button><div class="form-status" role="status" aria-live="polite"></div></form></div></div></section>`;

const notFound = () => `${intro('404', 'This page could not be found.', 'The address may have changed or the page may no longer exist.')}
<section class="section"><div class="container center-actions">${btn('/', 'Return home')}</div></section>`;

const creditEntry = (m) => {
  const isVideo = m.kind === 'video';
  return `<article><h3>${m.place} — ${m.label.toLowerCase()} (${isVideo ? 'video' : 'photograph'})</h3><p><strong>Creator:</strong> ${m.creator}. <strong>Work:</strong> ${m.file.replace(/_/g, ' ')}${m.context ? ` (${m.context})` : ''}. <strong>Licence:</strong> ${extLink(LICENCES[m.licence], m.licence)}. ${extLink(filePage(m.file), `Original ${isVideo ? 'video' : 'photograph'} and attribution ↗`)}. ${isVideo ? 'Played silently from Wikimedia’s 720p/360p transcodes as part of the homepage background reel; cropped to the screen area.' : 'Displayed as a responsive, cropped background image.'}</p></article>`;
};

const mediaCredits = () => `${intro('Transparency & attribution', 'Media credits & licensing.', 'Acknowledging the photographers, filmmakers, creators and organisations whose visuals support this website.')}
<section class="section"><div class="container prose"><p>These images and videos depict Ugandan and East African production, but do not imply the subjects are NBMA members, partners or endorsers. NBMA credits the original creators and links to the media records and applicable licences. Media are served from Wikimedia Commons and may not load without internet connectivity.</p><h2>Documentary video</h2><div class="media-credit-list">${Object.values(media).filter((m) => m.kind === 'video').map(creditEntry).join('')}</div><h2>Documentary photographs</h2><div class="media-credit-list">${Object.values(media).filter((m) => m.kind === 'photo').map(creditEntry).join('')}</div>
<h2>Association identity &amp; graphics</h2><p><strong>Official NBMA logo:</strong> supplied by Nile Basin Manufacturers Association Limited from its brand assets. Used for association identification; no public reuse licence is granted by this page. <strong>Background design, SVG icons and video fallback:</strong> custom graphics within this website project, not externally licensed photography. <strong>Typography:</strong> Manrope served through Google Fonts; see ${extLink('https://fonts.google.com/specimen/Manrope', 'Manrope font information')}.</p>
<h2>Licensing notice</h2><p>CC BY-SA 4.0 allows reuse subject to its conditions, including attribution, a licence link, indication of modifications and ShareAlike obligations for adaptations. CC0 1.0 works are dedicated to the public domain; they are credited here as a courtesy. If replacement media are added, credits and permissions must be updated. An optional self-hosted <code>/media/manufacturing-hero.mp4</code> requires a separate rights review and credit entry before it is published.</p><p>For rights questions or correction requests, <a href="/contact">contact the NBMA Secretariat</a>.</p></div></section>`;

const pages = {
  '/': { name: 'Home', desc: 'A stronger collective voice for manufacturing enterprises in Uganda and the Nile Basin.', fn: home },
  '/about': { name: 'About NBMA', desc: 'Purpose and governance of Nile Basin Manufacturers Association.', fn: about },
  '/membership': { name: 'Membership', desc: 'Join and participate in Nile Basin Manufacturers Association.', fn: membership },
  '/join': { name: 'Apply for Membership', desc: 'Apply to be considered for NBMA membership.', fn: join },
  '/programmes': { name: 'Programmes', desc: 'Manufacturing standards, market access, finance readiness and advocacy.', fn: programmes },
  '/advocacy': { name: 'Advocacy', desc: 'Evidence-based representation for domestic manufacturers.', fn: advocacy },
  '/resources': { name: 'Resources', desc: 'Manufacturer consultations and resources.', fn: resources },
  '/events': { name: 'Events', desc: 'Upcoming consultations and manufacturer events.', fn: events },
  '/media-credits': { name: 'Media Credits', desc: 'Photographer, filmmaker, design and licence acknowledgements for NBMA media.', fn: mediaCredits },
  '/contact': { name: 'Contact', desc: 'Contact Nile Basin Manufacturers Association in Uganda.', fn: contact },
  '/privacy': { name: 'Privacy', desc: 'NBMA website privacy information.', fn: privacy },
  '/terms': { name: 'Terms', desc: 'NBMA website terms of use.', fn: terms },
};

export const knownRoutes = Object.keys(pages);

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const header = (path) => `<header class="site-header" data-tone="dark">
<div class="nav-inner"><a class="brand" href="/" aria-label="NBMA home"><span class="wordmark">NBMA</span><span class="brand-sub">Nile Basin Manufacturers Association</span></a>
<nav class="desktop-nav" aria-label="Main navigation">${nav.map((n) => `<a href="${n.url}"${path === n.url ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}</nav>
<div class="nav-right"><a href="/join" class="nav-pill nav-join">Join</a><button class="nav-pill menu-button" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-open>Menu</button></div></div>
</header>
<div class="drawer" id="site-menu" hidden><div class="drawer-backdrop" data-menu-close></div><nav class="drawer-panel" aria-label="Site menu"><button class="drawer-close" type="button" aria-label="Close menu" data-menu-close><span aria-hidden="true"></span></button>${drawerNav.map((n) => `<a href="${n.url}"${path === n.url ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}<a class="btn btn-primary" href="/join">Apply for membership</a></nav></div>`;

const videoCredits = [media.coffee, media.carving, media.pulping]
  .map((m) => `${m.label} (${m.place}) by ${m.creator}, ${extLink(filePage(m.file), m.licence)}`)
  .join('; ');

const footer = () => `<footer class="site-footer"><div class="container">
<div class="footer-grid"><div class="footer-about"><img src="/assets/nbma-emblem.webp" alt="" width="88" height="60" loading="lazy"><p><strong>Nile Basin Manufacturers Association</strong><br>A member-centred platform for a stronger, more competitive manufacturing community.</p><p class="footer-tagline">Empowering Manufacturers. Connecting Markets.</p></div>
<div><h2>Explore</h2><a href="/about">About NBMA</a><a href="/membership">Membership</a><a href="/programmes">Programmes</a><a href="/events">Events</a></div>
<div><h2>Engage</h2><a href="/advocacy">Advocacy</a><a href="/resources">Resources</a><a href="/join">Apply to join</a><a href="/contact">Contact us</a></div>
<div><h2>Get in touch</h2><a href="mailto:nilebasinmanufacturersassociat@gmail.com">Email the Secretariat</a><a href="tel:+256760626390">+256 760 626390</a><p>Mukono, Uganda</p></div></div>
<p class="video-ack">Homepage video from Wikimedia Commons: ${videoCredits}. Photo credits appear on each image and in the <a href="/media-credits">full media credits &amp; licensing register</a>.</p>
<div class="footer-bottom"><span>© ${new Date().getFullYear()} Nile Basin Manufacturers Association Limited · Company limited by guarantee</span><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/media-credits">Media credits</a></nav></div>
</div></footer>`;

/**
 * Render a full HTML document for a route.
 * @param {string} path         Normalised pathname (no trailing slash).
 * @param {string} publicUrl    Canonical origin, e.g. https://nbma.example (optional).
 * @param {{localHeroVideo?: boolean}} opts
 */
export function renderPage(path, publicUrl = '', opts = {}) {
  const page = pages[path];
  const title = `${page?.name || 'Page not found'} | Nile Basin Manufacturers Association`;
  const desc = page?.desc || 'Page not found';
  const canonical = publicUrl ? `<link rel="canonical" href="${esc(publicUrl + path)}">` : '';
  const body = (page?.fn || notFound)(opts);

  const html = `<!doctype html>
<html lang="en"${path === '/' ? ' class="page-home"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#071d46">
${canonical}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<link rel="icon" href="/assets/nbma-favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://upload.wikimedia.org" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/styles.css">
<script src="/app.js" defer></script>
</head>
<body>
<a href="#main" class="skip">Skip to content</a>
${header(path)}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>`;

  return { status: page ? 200 : 404, html };
}
