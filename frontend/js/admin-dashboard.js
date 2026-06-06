/**
 * Admin Dashboard JavaScript
 */

function requireAdminAuth() {
  if (!API.isLoggedIn() || !API.isAdmin()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function renderAdminSidebar(activePage) {
  const sidebar = document.getElementById('sidebar-container');
  if (!sidebar) return;

  const pages = [
    { href: 'dashboard.html', icon: 'bi-speedometer2', label: 'Dashboard' },
    { href: 'appointments.html', icon: 'bi-calendar-check', label: 'Appointments' },
    { href: 'services.html', icon: 'bi-scissors', label: 'Services' },
    { href: 'users.html', icon: 'bi-people', label: 'Users' },
    { href: 'gallery.html', icon: 'bi-images', label: 'Gallery' },
    { href: 'content.html', icon: 'bi-file-earmark-text', label: 'Content' },
  ];

  sidebar.innerHTML = `
    <div class="sidebar-brand"><span class="brand-glow">Glow</span> & <span class="brand-grace">Grace</span>
      <small class="d-block text-muted" style="font-size:0.7rem;">Admin Panel</small>
    </div>
    <ul class="sidebar-nav">
      ${pages.map(p => `
        <li><a href="${p.href}" class="${activePage === p.label ? 'active' : ''}">
          <i class="bi ${p.icon}"></i> ${p.label}
        </a></li>
      `).join('')}
    </ul>
    <div class="sidebar-footer">
      <a href="../index.html" class="text-muted d-block mb-2"><i class="bi bi-house"></i> View Website</a>
      <a href="#" onclick="API.logout(); return false;" class="text-danger">
        <i class="bi bi-box-arrow-left"></i> Logout
      </a>
    </div>`;
}

async function loadDashboardStats() {
  try {
    const res = await API.getDashboardStats();
    const d = res.data;
    document.getElementById('stat-users').textContent = d.totalUsers;
    document.getElementById('stat-appointments').textContent = d.totalAppointments;
    document.getElementById('stat-today').textContent = d.todayAppointments;
    document.getElementById('stat-revenue').textContent = formatPrice(d.revenue);

    const activity = document.getElementById('recent-activity');
    if (activity && d.recentActivity) {
      activity.innerHTML = d.recentActivity.map(a => `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
          <div>
            <strong>${a.user?.name || 'Unknown'}</strong> booked
            <span class="text-muted">${a.service?.name || 'N/A'}</span>
          </div>
          <div>${statusBadge(a.status)}</div>
        </div>
      `).join('') || '<p class="text-muted">No recent activity</p>';
    }
  } catch (e) {
    console.error(e);
  }
}

async function loadAdminAppointments() {
  const container = document.getElementById('appointments-table');
  if (!container) return;

  const status = document.getElementById('filter-status')?.value || '';
  const search = document.getElementById('filter-search')?.value || '';
  const date = document.getElementById('filter-date')?.value || '';

  let params = [];
  if (status) params.push(`status=${status}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (date) params.push(`date=${date}`);

  try {
    const res = await API.getAllAppointments(params.join('&'));

    if (!res.data.length) {
      container.innerHTML = '<p class="text-muted text-center py-4">No appointments found.</p>';
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Client</th>
              <th>Service</th>
              <th>Staff</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${res.data.map(a => `
              <tr>
                <td>
                  <strong>${a.user?.name || 'N/A'}</strong><br>
                  <small class="text-muted">${a.user?.email || ''}</small>
                </td>
                <td>${a.service?.name || 'N/A'}</td>
                <td>${a.staff}</td>
                <td>${formatDate(a.date)}</td>
                <td>${a.rescheduleTimeSlot || a.timeSlot}</td>
                <td>${formatPrice(a.price)}</td>
                <td>${statusBadge(a.status)}</td>
                <td>
                  ${a.status === 'pending' ? `
                    <button class="btn-action btn-approve" onclick="updateStatus('${a._id}','approved')">Approve</button>
                    <button class="btn-action btn-reject" onclick="updateStatus('${a._id}','rejected')">Reject</button>
                  ` : ''}
                  ${['approved','rescheduled','pending'].includes(a.status) ? `
                    <button class="btn-action btn-reschedule" onclick="openReschedule('${a._id}')">Reschedule</button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    container.innerHTML = `<p class="text-danger">${e.message}</p>`;
  }
}

async function updateStatus(id, status) {
  if (status === 'rejected' && !confirm('Reject this appointment?')) return;
  try {
    await API.updateAppointmentStatus(id, { status });
    showToast(`Appointment ${status}`, 'success');
    loadAdminAppointments();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

function openReschedule(id) {
  document.getElementById('reschedule-id').value = id;
  new bootstrap.Modal(document.getElementById('rescheduleModal')).show();
}

async function submitReschedule() {
  const id = document.getElementById('reschedule-id').value;
  const date = document.getElementById('reschedule-date').value;
  const time = document.getElementById('reschedule-time').value;

  if (!date || !time) {
    showToast('Please select date and time', 'error');
    return;
  }

  try {
    await API.rescheduleAppointment(id, { rescheduleDate: date, rescheduleTimeSlot: time });
    showToast('Appointment rescheduled', 'success');
    bootstrap.Modal.getInstance(document.getElementById('rescheduleModal')).hide();
    loadAdminAppointments();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function downloadReport() {
  const status = document.getElementById('filter-status')?.value || '';
  const params = status ? `?status=${status}` : '';
  const url = `${CONFIG.API_BASE_URL}/appointments/report/download${params}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API.getToken()}` },
    });
    if (!response.ok) throw new Error('Failed to download report');

    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'appointments-report.pdf';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Report downloaded', 'success');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

function initSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}
