let currentUser = null;

async function api(path, opts = {}) {
  const res = await fetch('/api' + path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const NAV = [
  { hash: 'dash', label: 'Dashboard', ic: '📊', fn: 'renderDashboard' },
  { hash: 'patients', label: 'Patients', ic: '🧑‍🤝‍🧑', fn: 'renderPatients' },
  { hash: 'appts', label: 'Appointments', ic: '📅', fn: 'renderAppointments' },
  { hash: 'doctors', label: 'Doctors', ic: '🩺', fn: 'renderDoctors' },
  { hash: 'pharm', label: 'Pharmacy', ic: '💊', fn: 'renderPharmacy' },
  { hash: 'billing', label: 'Billing', ic: '💵', fn: 'renderBilling' },
];

function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="login-mark brand-logo" style="margin-bottom:16px;">
  <svg width="52" height="52" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="19" stroke="#7fd9c4" stroke-width="1.5" opacity="0.4"/>
    <path d="M20 8 C13 8 8 13 8 20 C8 27 13 32 20 32" stroke="#7fd9c4" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="17" y="13" width="6" height="18" rx="2" fill="#7fd9c4"/>
    <rect x="11" y="19" width="18" height="6" rx="2" fill="#7fd9c4"/>
  </svg>
  <div class="brand-text" style="color:white;">Suwasetha<small style="color:#a9cfc6;">HOSPITAL SYSTEM</small></div>
</div>
      <div class="login-form-wrap">
        <div class="login-box">
          <h1>Sign in</h1>
          <p class="sub">Use your staff credentials to continue.</p>
          <div id="errBox"></div>
          <form id="loginForm">
            <div class="field"><label>Username</label><input name="username" required></div>
            <div class="field"><label>Password</label><input name="password" type="password" required></div>
            <button class="btn" type="submit">Sign in</button>
          </form>
        </div>
      </div>
    </div>
  `;
  document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const { user } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }) });
      currentUser = user;
      renderDashboard();
    } catch (err) {
      document.getElementById('errBox').innerHTML = `<div class="error">${err.message}</div>`;
    }
  };
}

function shell(activeHash, title, bodyHtml) {
  const navHtml = NAV.map(n => `<a href="#" data-nav="${n.fn}" class="${n.hash === activeHash ? 'active' : ''}">${n.ic} ${n.label}</a>`).join('');
  document.getElementById('app').innerHTML = `
    <div class="app-shell">
      <div class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-logo">
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="#7fd9c4" stroke-width="1.5" opacity="0.4"/>
              <path d="M20 8 C13 8 8 13 8 20 C8 27 13 32 20 32" stroke="#7fd9c4" stroke-width="2" fill="none" stroke-linecap="round"/>
              <rect x="17" y="13" width="6" height="18" rx="2" fill="#7fd9c4"/>
              <rect x="11" y="19" width="18" height="6" rx="2" fill="#7fd9c4"/>
            </svg>
            <div class="brand-text">Suwasetha<small>HOSPITAL SYSTEM</small></div>
          </div>
        </div>
        <nav>${navHtml}</nav>
        <div class="sidebar-foot">
          <div style="font-size:12px; margin-bottom:8px; color:#a9cfc6;">${currentUser.username} · ${currentUser.role}</div>
          <button id="logoutBtn">Log out</button>
        </div>
      </div>
      <div class="main">
        <div class="topbar"><h2>${title}</h2></div>
        <div class="content" id="pageContent">${bodyHtml}</div>
      </div>
    </div>
  `;
  document.getElementById('logoutBtn').onclick = async () => { await api('/auth/logout', { method: 'POST' }); renderLogin(); };
  document.querySelectorAll('[data-nav]').forEach(a => {
    a.onclick = (e) => { e.preventDefault(); window[a.dataset.nav](); };
  });
}

/* ---------- Dashboard ---------- */
async function renderDashboard() {
  shell('dash', 'Dashboard', `
    <div class="stat-grid" id="statsWrap">Loading...</div>
    <div class="dash-grid">
      <div class="panel">
        <h3>Recent activity</h3>
        <div id="activityWrap">Loading...</div>
      </div>
      <div class="panel">
        <h3>Quick actions</h3>
        <div class="quick-actions">
          <button data-nav="renderPatients">🧑‍🤝‍🧑 Register a new patient</button>
          <button data-nav="renderAppointments">📅 Book an appointment</button>
          <button data-nav="renderBilling">💵 Generate a bill</button>
          <button data-nav="renderPharmacy">💊 Check pharmacy stock</button>
        </div>
      </div>
    </div>
  `);
  document.querySelectorAll('[data-nav]').forEach(b => { b.onclick = () => window[b.dataset.nav](); });

  const d = await api('/reports/dashboard');
  document.getElementById('statsWrap').innerHTML = `
    <div class="stat-card"><div class="stat-icon">🧑‍🤝‍🧑</div><div><div class="label">Total patients</div><div class="value">${d.totalPatients}</div></div></div>
    <div class="stat-card"><div class="stat-icon">📅</div><div><div class="label">Today's appointments</div><div class="value">${d.todayAppointments}</div></div></div>
    <div class="stat-card"><div class="stat-icon">💵</div><div><div class="label">Total revenue</div><div class="value">Rs. ${d.revenueTotal}</div></div></div>
    <div class="stat-card ${d.pendingLabRequests > 0 ? 'warn' : ''}"><div class="stat-icon">🧪</div><div><div class="label">Pending lab requests</div><div class="value">${d.pendingLabRequests}</div></div></div>
    <div class="stat-card ${d.pharmacyLowStockAlerts > 0 ? 'danger' : ''}"><div class="stat-icon">💊</div><div><div class="label">Low stock alerts</div><div class="value">${d.pharmacyLowStockAlerts}</div></div></div>
  `;

  const patients = await api('/patients');
  const recent = patients.slice(0, 5);
  document.getElementById('activityWrap').innerHTML = recent.length ? recent.map(p => `
    <div class="activity-item">
      <span><span class="who">${p.full_name}</span> registered</span>
      <span class="when">${p.created_at.slice(0,10)}</span>
    </div>
  `).join('') : '<p style="color:#999;font-size:13px;">No activity yet.</p>';
}

/* ---------- Patients ---------- */
async function renderPatients() {
  shell('patients', 'Patients', `
    <div class="toolbar">
      <input id="searchBox" placeholder="Search by name or phone...">
      <button class="btn btn-small" id="addBtn">+ Register patient</button>
    </div>
    <div id="tableWrap">Loading...</div>
  `);
  async function loadList(q = '') {
    const rows = await api('/patients' + (q ? `?q=${encodeURIComponent(q)}` : ''));
    document.getElementById('tableWrap').innerHTML = rows.length ? `
      <table><thead><tr><th>Name</th><th>Phone</th><th>Registered</th></tr></thead>
      <tbody>${rows.map(p => `<tr><td>${p.full_name}</td><td>${p.phone || '-'}</td><td>${p.created_at.slice(0,10)}</td></tr>`).join('')}</tbody></table>
    ` : '<p>No patients found.</p>';
  }
  loadList();
  document.getElementById('searchBox').oninput = (e) => loadList(e.target.value);
  document.getElementById('addBtn').onclick = () => {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal-box"><h3>Register patient</h3>
      <div class="field"><label>Full name</label><input id="m_name"></div>
      <div class="field"><label>Phone</label><input id="m_phone"></div>
      <div class="modal-actions"><button class="btn-ghost" id="m_cancel">Cancel</button><button class="btn btn-small" id="m_save">Save</button></div>
    </div>`;
    document.body.appendChild(bg);
    document.getElementById('m_cancel').onclick = () => bg.remove();
    document.getElementById('m_save').onclick = async () => {
      const full_name = document.getElementById('m_name').value.trim();
      if (!full_name) return alert('Name required');
      await api('/patients', { method: 'POST', body: JSON.stringify({ full_name, phone: document.getElementById('m_phone').value }) });
      bg.remove(); loadList();
    };
  };
}

/* ---------- Appointments ---------- */
async function renderAppointments() {
  shell('appts', 'Appointments', `
    <div class="toolbar"><button class="btn btn-small" id="bookBtn">+ Book appointment</button></div>
    <div id="tableWrap">Loading...</div>
  `);
  async function loadList() {
    const rows = await api('/appointments');
    document.getElementById('tableWrap').innerHTML = rows.length ? `
      <table><thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
      <tbody>${rows.map(a => `<tr><td>${a.patient_name}</td><td>${a.doctor_name}</td><td>${a.appt_date}</td><td>${a.appt_time}</td><td><span class="pill">${a.status}</span></td></tr>`).join('')}</tbody></table>
    ` : '<p>No appointments found.</p>';
  }
  loadList();
  document.getElementById('bookBtn').onclick = async () => {
    const patients = await api('/patients');
    const doctors = await api('/doctors');
    if (!patients.length) return alert('Register a patient first.');
    if (!doctors.length) return alert('No doctors in the system yet.');
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal-box"><h3>Book appointment</h3>
      <div class="field"><label>Patient</label><select id="m_pat">${patients.map(p => `<option value="${p.id}">${p.full_name}</option>`).join('')}</select></div>
      <div class="field"><label>Doctor</label><select id="m_doc">${doctors.map(d => `<option value="${d.id}">${d.full_name}</option>`).join('')}</select></div>
      <div class="field"><label>Date</label><input type="date" id="m_date"></div>
      <div class="field"><label>Time</label><input type="time" id="m_time"></div>
      <div class="field"><label>Reason</label><input id="m_reason"></div>
      <div class="modal-actions"><button class="btn-ghost" id="m_cancel">Cancel</button><button class="btn btn-small" id="m_save">Book</button></div>
    </div>`;
    document.body.appendChild(bg);
    document.getElementById('m_cancel').onclick = () => bg.remove();
    document.getElementById('m_save').onclick = async () => {
      const date = document.getElementById('m_date').value, time = document.getElementById('m_time').value;
      if (!date || !time) return alert('Date and time required');
      try {
        await api('/appointments', { method: 'POST', body: JSON.stringify({ patient_id: Number(document.getElementById('m_pat').value), doctor_id: Number(document.getElementById('m_doc').value), appt_date: date, appt_time: time, reason: document.getElementById('m_reason').value }) });
        bg.remove(); loadList();
      } catch (err) { alert(err.message); }
    };
  };
}

/* ---------- Doctors ---------- */
async function renderDoctors() {
  shell('doctors', 'Doctors', `
    <div class="toolbar"><button class="btn btn-small" id="addBtn">+ Add doctor</button></div>
    <div id="tableWrap">Loading...</div>
  `);
  async function loadList() {
    const rows = await api('/doctors');
    document.getElementById('tableWrap').innerHTML = rows.length ? `
      <table><thead><tr><th>Name</th><th>Specialization</th></tr></thead>
      <tbody>${rows.map(d => `<tr><td>${d.full_name}</td><td>${d.specialization || '-'}</td></tr>`).join('')}</tbody></table>
    ` : '<p>No doctors found.</p>';
  }
  loadList();
  document.getElementById('addBtn').onclick = () => {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal-box"><h3>Add doctor</h3>
      <div class="field"><label>Full name</label><input id="m_name"></div>
      <div class="field"><label>Specialization</label><input id="m_spec"></div>
      <div class="modal-actions"><button class="btn-ghost" id="m_cancel">Cancel</button><button class="btn btn-small" id="m_save">Save</button></div>
    </div>`;
    document.body.appendChild(bg);
    document.getElementById('m_cancel').onclick = () => bg.remove();
    document.getElementById('m_save').onclick = async () => {
      const full_name = document.getElementById('m_name').value.trim();
      if (!full_name) return alert('Name required');
      await api('/doctors', { method: 'POST', body: JSON.stringify({ full_name, specialization: document.getElementById('m_spec').value }) });
      bg.remove(); loadList();
    };
  };
}

/* ---------- Pharmacy ---------- */
async function renderPharmacy() {
  shell('pharm', 'Pharmacy', `
    <div class="toolbar"><button class="btn btn-small" id="addBtn">+ Add medicine</button></div>
    <div id="tableWrap">Loading...</div>
  `);
  async function loadList() {
    const rows = await api('/pharmacy');
    document.getElementById('tableWrap').innerHTML = rows.length ? `
      <table><thead><tr><th>Medicine</th><th>Stock</th><th>Unit price</th><th></th></tr></thead>
      <tbody>${rows.map(i => `<tr><td>${i.name}</td><td>${i.stock_qty <= i.reorder_level ? `<b style="color:#c4483a;">${i.stock_qty}</b>` : i.stock_qty}</td><td>Rs. ${i.unit_price}</td><td><button class="btn-ghost btn-small" data-dispense="${i.id}">Dispense</button></td></tr>`).join('')}</tbody></table>
    ` : '<p>No items found.</p>';
    document.querySelectorAll('[data-dispense]').forEach(btn => {
      btn.onclick = async () => {
        const qty = Number(prompt('Quantity to dispense:'));
        if (!qty || qty < 1) return;
        try { await api(`/pharmacy/${btn.dataset.dispense}/dispense`, { method: 'PUT', body: JSON.stringify({ qty }) }); loadList(); }
        catch (err) { alert(err.message); }
      };
    });
  }
  loadList();
  document.getElementById('addBtn').onclick = () => {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal-box"><h3>Add medicine</h3>
      <div class="field"><label>Name</label><input id="m_name"></div>
      <div class="field"><label>Stock quantity</label><input type="number" id="m_stock" value="0"></div>
      <div class="field"><label>Unit price (Rs.)</label><input type="number" step="0.01" id="m_price" value="0"></div>
      <div class="modal-actions"><button class="btn-ghost" id="m_cancel">Cancel</button><button class="btn btn-small" id="m_save">Save</button></div>
    </div>`;
    document.body.appendChild(bg);
    document.getElementById('m_cancel').onclick = () => bg.remove();
    document.getElementById('m_save').onclick = async () => {
      const name = document.getElementById('m_name').value.trim();
      if (!name) return alert('Name required');
      await api('/pharmacy', { method: 'POST', body: JSON.stringify({ name, stock_qty: Number(document.getElementById('m_stock').value), unit_price: Number(document.getElementById('m_price').value) }) });
      bg.remove(); loadList();
    };
  };
}

/* ---------- Billing ---------- */
async function renderBilling() {
  shell('billing', 'Billing', `
    <div class="toolbar"><button class="btn btn-small" id="genBtn">+ Generate bill</button></div>
    <div id="tableWrap">Loading...</div>
  `);
  async function loadList() {
    const rows = await api('/billing');
    document.getElementById('tableWrap').innerHTML = rows.length ? `
      <table><thead><tr><th>Patient</th><th>Total</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows.map(b => `<tr><td>${b.patient_name}</td><td>Rs. ${b.total}</td><td><span class="pill">${b.status}</span></td><td>${b.status !== 'Paid' ? `<button class="btn-ghost btn-small" data-pay="${b.id}">Record payment</button>` : ''}</td></tr>`).join('')}</tbody></table>
    ` : '<p>No bills found.</p>';
    document.querySelectorAll('[data-pay]').forEach(btn => {
      btn.onclick = async () => {
        const amount = Number(prompt('Payment amount (Rs.):'));
        if (!amount || amount <= 0) return;
        await api(`/billing/${btn.dataset.pay}/payments`, { method: 'POST', body: JSON.stringify({ amount, method: 'Cash' }) });
        loadList();
      };
    });
  }
  loadList();
  document.getElementById('genBtn').onclick = async () => {
    const patients = await api('/patients');
    if (!patients.length) return alert('Register a patient first.');
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal-box"><h3>Generate bill</h3>
      <div class="field"><label>Patient</label><select id="m_pat">${patients.map(p => `<option value="${p.id}">${p.full_name}</option>`).join('')}</select></div>
      <div class="field"><label>Consultation charge (Rs.)</label><input type="number" id="m_c" value="0"></div>
      <div class="field"><label>Lab charge (Rs.)</label><input type="number" id="m_l" value="0"></div>
      <div class="modal-actions"><button class="btn-ghost" id="m_cancel">Cancel</button><button class="btn btn-small" id="m_save">Generate</button></div>
    </div>`;
    document.body.appendChild(bg);
    document.getElementById('m_cancel').onclick = () => bg.remove();
    document.getElementById('m_save').onclick = async () => {
      await api('/billing', { method: 'POST', body: JSON.stringify({ patient_id: Number(document.getElementById('m_pat').value), consultation_charge: Number(document.getElementById('m_c').value), lab_charge: Number(document.getElementById('m_l').value) }) });
      bg.remove(); loadList();
    };
  };
}

/* ---------- Boot ---------- */
api('/auth/me').then(({ user }) => { currentUser = user; renderDashboard(); }).catch(renderLogin);