const modal = document.querySelector('#modal');
const toast = document.querySelector('#toast');
const sidebar = document.querySelector('.sidebar');
let toastTimer;

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
};

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character]);

function closeFlow() {
  document.querySelector('.flow-backdrop')?.remove();
  document.body.classList.remove('locked');
}

function openFlow(content, wide = false) {
  closeFlow();
  const backdrop = document.createElement('div');
  backdrop.className = 'flow-backdrop';
  backdrop.innerHTML = `<section class="flow-card ${wide ? 'wide' : ''}" role="dialog" aria-modal="true"><button class="flow-close" aria-label="Close">×</button>${content}</section>`;
  document.body.appendChild(backdrop);
  document.body.classList.add('locked');
  backdrop.querySelector('.flow-close').addEventListener('click', closeFlow);
  backdrop.addEventListener('click', event => { if (event.target === backdrop) closeFlow(); });
  return backdrop;
}

function showWelcome() {
  const screen = document.createElement('section');
  screen.className = 'welcome-screen';
  screen.innerHTML = `
    <div class="welcome-nav"><a class="welcome-logo"><span>S</span>ShamsCare</a><button id="signIn">Sign in</button></div>
    <div class="welcome-main">
      <div class="welcome-copy"><div class="welcome-badge">BUILT FOR LEBANESE SOLAR INSTALLERS</div><h1>Install once.<br><em>Earn every month.</em></h1><p>Turn every solar installation into recurring revenue with scheduled maintenance, a rooftop-ready technician app, and reports your customers can trust.</p><div class="welcome-actions"><button class="primary" id="registerBusiness">Register your business →</button><button id="exploreDemo">Explore sample workspace</button></div><div class="welcome-proof"><span><b>86</b> active plans</span><span><b>$4,280</b> monthly recurring revenue</span><span><b>91%</b> renewal rate</span></div></div>
      <div class="phone-preview"><div class="phone-top"><span>9:41</span><span>● ● ●</span></div><small>TODAY'S VISIT</small><h3>Layla Mansour</h3><p>Hazmieh · Premium Care</p><div class="phone-system"><b>System health</b><strong>Good</strong><span>12 panels · 10kWh battery</span></div><ul><li class="checked">✓ Panel cleaning</li><li class="checked">✓ Inverter inspection</li><li>○ Battery health check</li><li>○ Upload photos</li></ul><button>Continue checklist</button></div>
    </div><p class="welcome-foot">One workspace for customers, systems, plans, visits, and reports.</p>`;
  document.body.appendChild(screen);
  screen.querySelector('#registerBusiness').addEventListener('click', () => startRegistration(screen));
  screen.querySelector('#exploreDemo').addEventListener('click', () => { screen.remove(); showToast('Welcome to the sample workspace'); });
  screen.querySelector('#signIn').addEventListener('click', () => startRegistration(screen, true));
  screen.querySelector('.phone-preview>button').addEventListener('click', () => showChecklist());
}

function startRegistration(welcomeScreen, signIn = false) {
  const flow = openFlow(`
    <div class="flow-progress"><i class="active"></i><i></i><i></i></div><span class="flow-kicker">${signIn ? 'WELCOME BACK' : 'STEP 1 OF 3'}</span>
    <h2>${signIn ? 'Sign in to your workspace' : 'Create your business workspace'}</h2><p>${signIn ? 'Use any email and password in this interactive demo.' : 'Start managing maintenance revenue in less than two minutes.'}</p>
    <form id="registerForm" class="flow-form">${signIn ? '' : '<label>Business name<input name="business" required placeholder="e.g. Beirut Solar Co."></label><label>Your name<input name="owner" required placeholder="e.g. Maya Khoury"></label>'}<label>Work email<input name="email" type="email" required placeholder="maya@company.com"></label><label>Password<input name="password" type="password" minlength="6" required placeholder="At least 6 characters"></label><button class="primary">${signIn ? 'Sign in →' : 'Create workspace →'}</button></form><small class="form-note">Demo mode — no real account or payment is created.</small>`);
  welcomeScreen.style.display = 'none';
  flow.querySelector('#registerForm').addEventListener('submit', event => {
    event.preventDefault();
    if (signIn) { closeFlow(); welcomeScreen.remove(); showToast('Signed in to sample workspace'); return; }
    const data = new FormData(event.currentTarget);
    showBusinessSetup(welcomeScreen, data.get('business'), data.get('owner'));
  });
  flow.querySelector('.flow-close').addEventListener('click', () => { welcomeScreen.style.display = ''; });
}

function showBusinessSetup(welcomeScreen, business, owner) {
  const flow = openFlow(`
    <div class="flow-progress"><i class="done"></i><i class="active"></i><i></i></div><span class="flow-kicker">STEP 2 OF 3</span><h2>Set your maintenance offer</h2><p>This creates the plan your team can sell after every installation.</p>
    <form id="setupForm" class="flow-form"><label>Default plan name<input name="plan" required value="Annual Care"></label><div class="form-grid"><label>Visit frequency<select name="frequency"><option value="6">Every 6 months</option><option value="3">Every 3 months</option></select></label><label>Monthly price<input name="price" type="number" min="1" value="40" required></label></div><label>Service area<select><option>Greater Beirut</option><option>Mount Lebanon</option><option>All Lebanon</option></select></label><button class="primary">Save maintenance plan →</button></form>`);
  flow.querySelector('#setupForm').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    showRegistrationSuccess(welcomeScreen, business, owner, data.get('plan'), data.get('frequency'), data.get('price'));
  });
}

function showRegistrationSuccess(welcomeScreen, business, owner, plan, frequency, price) {
  const flow = openFlow(`
    <div class="flow-progress"><i class="done"></i><i class="done"></i><i class="done"></i></div><div class="success-mark">✓</div><span class="flow-kicker">WORKSPACE READY</span><h2>Welcome to ShamsCare, ${escapeHtml(owner)}.</h2><p><b>${escapeHtml(business)}</b> can now sell the <b>${escapeHtml(plan)}</b> plan at <b>$${escapeHtml(price)}/month</b>, with visits created every ${escapeHtml(frequency)} months.</p><div class="next-flow"><span>1</span><div><b>Next: register a customer’s system</b><small>Then sell this plan and see the first visit appear automatically.</small></div></div><button class="primary full" id="enterWorkspace">Enter workspace →</button>`);
  flow.querySelector('#enterWorkspace').addEventListener('click', () => {
    document.querySelector('.profile b').textContent = owner;
    document.querySelector('.profile small').textContent = business;
    closeFlow(); welcomeScreen.remove(); showToast(`${business} workspace created`);
    setTimeout(openCustomerModal, 500);
  });
}

function openCustomerModal() {
  modal.hidden = false;
  document.body.classList.add('locked');
  setTimeout(() => modal.querySelector('input').focus());
}

function closeCustomerModal() {
  modal.hidden = true;
  document.body.classList.remove('locked');
}

function showPlanSale(customer, location, panels, battery) {
  const flow = openFlow(`
    <span class="flow-kicker">CORE FLOW · STEP 2</span><h2>Sell a plan to ${escapeHtml(customer)}</h2><p>${escapeHtml(location)} · ${escapeHtml(panels)} panels · ${escapeHtml(battery)} battery</p>
    <form id="planForm" class="flow-form"><div class="plan-choice selected"><div><b>Annual Care</b><span>Cleaning, inverter and battery check</span></div><strong>$40<small>/mo</small></strong></div><label>First visit date<input name="date" type="date" required value="2026-11-10"></label><label>Assigned technician<select name="technician"><option>Rami K.</option><option>Jad A.</option></select></label><button class="primary">Sell plan & schedule visits →</button></form><button class="skip-link" id="skipPlan">Save customer without a plan</button>`);
  flow.querySelector('#planForm').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    showScheduled(customer, data.get('date'), data.get('technician'));
  });
  flow.querySelector('#skipPlan').addEventListener('click', () => { closeFlow(); showToast(`${customer} saved without a plan`); });
}

function showScheduled(customer, date, technician) {
  const prettyDate = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const flow = openFlow(`<div class="success-mark">✓</div><span class="flow-kicker">PLAN SOLD</span><h2>$40 in new monthly revenue</h2><p>${escapeHtml(customer)}’s first maintenance visit is booked for <b>${prettyDate}</b> with <b>${escapeHtml(technician)}</b>. The next visit will be created automatically in 6 months.</p><div class="result-stats"><div><b>$480</b><span>annual value</span></div><div><b>2</b><span>visits / year</span></div></div><button class="primary full" id="viewVisit">Open technician visit →</button>`);
  flow.querySelector('#viewVisit').addEventListener('click', () => showChecklist(customer));
}

function showChecklist(customer = 'Layla Mansour') {
  const flow = openFlow(`
    <span class="flow-kicker">TECHNICIAN MODE · VISIT #1048</span><h2>${escapeHtml(customer)}</h2><p>Premium Care · Hazmieh · 12 panels · 10kWh battery</p>
    <form id="checklist" class="checklist"><label><input type="checkbox" required><span>Clean panels and inspect mounting</span></label><label><input type="checkbox" required><span>Check inverter output and error log</span></label><label><input type="checkbox" required><span>Test battery voltage and capacity</span></label><label><input type="checkbox" required><span>Inspect cables, breakers, and earthing</span></label><label class="battery-field">Battery condition<select name="battery"><option value="good">Good — no action needed</option><option value="weak">Weak — alert customer</option></select></label><label class="upload">＋ Add visit photos<input type="file" accept="image/*" multiple><small>No photo selected</small></label><textarea name="notes" placeholder="Technician notes…"></textarea><button class="primary">Complete visit & generate report →</button></form>`, true);
  const upload = flow.querySelector('.upload input');
  upload.addEventListener('change', () => { flow.querySelector('.upload small').textContent = `${upload.files.length} photo${upload.files.length === 1 ? '' : 's'} attached`; });
  flow.querySelector('#checklist').addEventListener('submit', event => {
    event.preventDefault();
    const weak = new FormData(event.currentTarget).get('battery') === 'weak';
    showReport(customer, weak);
  });
}

function showReport(customer = 'Layla Mansour', weak = false) {
  const flow = openFlow(`<span class="flow-kicker">CUSTOMER REPORT · READY TO SHARE</span><div class="report-header"><div><h2>${escapeHtml(customer)}</h2><p>Maintenance visit · 27 October 2026</p></div><span class="health ${weak ? 'weak' : ''}">${weak ? 'Needs attention' : 'System healthy'}</span></div><div class="report-score"><strong>${weak ? '72' : '96'}<small>/100</small></strong><span>System performance score</span></div><div class="report-items"><p>✓ Panels cleaned and inspected</p><p>✓ Inverter operating normally</p><p>${weak ? '! Battery capacity is below recommended level' : '✓ Battery health is good'}</p><p>✓ Electrical connections checked</p></div>${weak ? '<div class="battery-alert"><b>Weak battery detected</b><span>Send the customer a recommendation and replacement quote.</span></div>' : ''}<div class="report-actions"><button class="secondary" id="copyReport">⌁ Copy report link</button><button class="primary" id="sendReport">${weak ? 'Send report & alert' : 'Send report to customer'}</button></div>`, true);
  flow.querySelector('#copyReport').addEventListener('click', () => showToast('Customer report link copied'));
  flow.querySelector('#sendReport').addEventListener('click', () => { closeFlow(); showToast(weak ? 'Report and battery alert sent' : 'Visit report sent to customer'); });
}

document.querySelectorAll('.open-customer').forEach(button => button.addEventListener('click', openCustomerModal));
document.querySelector('#close').addEventListener('click', closeCustomerModal);
modal.addEventListener('click', event => { if (event.target === modal) closeCustomerModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeCustomerModal(); closeFlow(); } });

document.querySelector('#customer-form').addEventListener('submit', event => {
  event.preventDefault();
  const inputs = [...event.currentTarget.querySelectorAll('input')];
  const [customer, location, panels, battery] = inputs.map(input => input.value);
  event.currentTarget.reset(); closeCustomerModal(); showPlanSale(customer, location, panels, battery);
});

document.querySelector('#schedule').addEventListener('click', () => showChecklist('New scheduled customer'));
document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => showToast(button.dataset.toast)));
document.querySelector('#menu').addEventListener('click', () => sidebar.classList.toggle('open'));
document.querySelectorAll('.sidebar nav a').forEach(link => link.addEventListener('click', event => {
  document.querySelectorAll('.sidebar nav a').forEach(item => item.classList.remove('active'));
  link.classList.add('active'); sidebar.classList.remove('open');
  if (link.getAttribute('href') === '#reports') { event.preventDefault(); showReport('George Tabet'); return; }
  if (!link.getAttribute('href')?.startsWith('#') || !document.querySelector(link.getAttribute('href'))) { event.preventDefault(); showToast(`${link.textContent.trim()} view is included in the full product`); }
}));
document.querySelectorAll('.visit').forEach(visit => visit.addEventListener('click', event => { if (!event.target.closest('button')) showChecklist(visit.querySelector('b').textContent); }));
document.querySelectorAll('.visit>button').forEach(button => button.addEventListener('click', event => showToast(`Visit actions opened for ${event.currentTarget.closest('.visit').querySelector('b').textContent}`)));
document.querySelectorAll('.renewals tbody tr').forEach(row => row.addEventListener('click', () => showToast(`Renewal opened for ${row.querySelector('b').textContent}`)));
document.querySelector('.activities article:last-of-type').addEventListener('click', () => showReport('George Tabet'));
document.querySelector('.view-all').addEventListener('click', () => showToast('Showing all recent workspace activity'));
document.querySelector('.activities .panel-head>button').addEventListener('click', () => showToast('Activity filters opened'));
document.querySelector('#visits .panel-head>button').addEventListener('click', () => showToast('Calendar view opened'));
document.querySelector('#plans .panel-head>button').addEventListener('click', () => document.querySelector('#plans').scrollIntoView({ behavior: 'smooth' }));
document.querySelector('.bell').addEventListener('click', () => showToast('2 battery alerts and 1 renewal reminder'));
document.querySelector('.profile>button').addEventListener('click', () => showToast('Workspace account menu opened'));
document.querySelector('.settings').addEventListener('click', event => { event.preventDefault(); showToast('Workspace settings opened'); });
document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', event => { if (!document.querySelector(link.getAttribute('href'))) { event.preventDefault(); showToast(`${link.textContent.trim()} view is included in the full product`); } }));
document.querySelector('#search').addEventListener('keydown', event => { if (event.key === 'Enter' && event.target.value.trim()) showToast(`Found results for “${event.target.value.trim()}”`); });
document.querySelector('.upgrade button').addEventListener('click', () => document.querySelector('#plans').scrollIntoView({ behavior: 'smooth' }));

showWelcome();
