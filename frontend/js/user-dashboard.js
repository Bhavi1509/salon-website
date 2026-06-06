/**
 * User Dashboard JavaScript
 */

function requireUserAuth() {
  if (!API.isLoggedIn() || API.isAdmin()) {
    window.location.href = '../login.html';
    return false;
  }
  return true;
}

function renderUserSidebar(activePage) {
  const user = API.getUser();
  const sidebar = document.getElementById('sidebar-container');
  if (!sidebar) return;

  const pages = [
    { href: 'dashboard.html', icon: 'bi-speedometer2', label: 'Dashboard' },
    { href: 'booking.html', icon: 'bi-calendar-plus', label: 'Book Appointment' },
    { href: 'dashboard.html#appointments', icon: 'bi-calendar-check', label: 'My Appointments' },
    { href: 'dashboard.html#profile', icon: 'bi-person', label: 'Profile' },
    { href: 'dashboard.html#notifications', icon: 'bi-bell', label: 'Notifications' },
  ];

  sidebar.innerHTML = `
    <div class="sidebar-brand"><span class="brand-glow">Glow</span> & <span class="brand-grace">Grace</span></div>
    <ul class="sidebar-nav">
      ${pages.map(p => `
        <li><a href="${p.href}" class="${activePage === p.label ? 'active' : ''}">
          <i class="bi ${p.icon}"></i> ${p.label}
        </a></li>
      `).join('')}
    </ul>
    <div class="sidebar-footer">
      <a href="#" onclick="API.logout(); return false;" class="text-danger">
        <i class="bi bi-box-arrow-left"></i> Logout
      </a>
    </div>`;
}

async function loadUserAppointments() {
  const container = document.getElementById('appointments-list');
  if (!container) return;

  const statusFilter = document.getElementById('apt-status-filter')?.value || '';
  const search = document.getElementById('apt-search')?.value || '';

  try {
    let params = '';
    if (statusFilter) params += `status=${statusFilter}`;
    if (search) params += `${params ? '&' : ''}search=${encodeURIComponent(search)}`;

    const res = await API.getMyAppointments(params);

    if (!res.data.length) {
      container.innerHTML = '<p class="text-muted text-center py-4">No appointments found.</p>';
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Service</th>
              <th>Staff</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${res.data.map(apt => `
              <tr>
                <td>${apt.service?.name || 'N/A'}</td>
                <td>${apt.staff}</td>
                <td>${formatDate(apt.date)}</td>
                <td>${apt.rescheduleTimeSlot || apt.timeSlot}</td>
                <td>${formatPrice(apt.price)}</td>
                <td>${statusBadge(apt.status)}</td>
                <td>
                  ${['pending', 'approved', 'rescheduled'].includes(apt.status)
                    ? `<button class="btn-action btn-reject" onclick="cancelAppointment('${apt._id}')">Cancel</button>`
                    : '-'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    container.innerHTML = `<p class="text-danger text-center">${e.message}</p>`;
  }
}

async function cancelAppointment(id) {
  if (!confirm('Are you sure you want to cancel this appointment?')) return;
  try {
    await API.cancelAppointment(id);
    showToast('Appointment cancelled', 'success');
    loadUserAppointments();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function loadNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  try {
    const res = await API.getNotifications();
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = res.unreadCount;
      badge.style.display = res.unreadCount > 0 ? 'flex' : 'none';
    }

    if (!res.data.length) {
      container.innerHTML = '<p class="text-muted text-center py-4">No notifications.</p>';
      return;
    }

    container.innerHTML = res.data.map(n => `
      <div class="notification-item ${n.isRead ? '' : 'unread'}" onclick="markRead('${n._id}')">
        <h6>${n.title}</h6>
        <p>${n.message}</p>
        <small>${new Date(n.createdAt).toLocaleString()}</small>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = `<p class="text-muted text-center">${e.message}</p>`;
  }
}

async function markRead(id) {
  try {
    await API.markNotificationRead(id);
    loadNotifications();
  } catch (e) { /* silent */ }
}

async function loadProfile() {
  const user = API.getUser();
  if (!user) return;

  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const phoneEl = document.getElementById('profile-phone');

  if (nameEl) nameEl.value = user.name || '';
  if (emailEl) emailEl.value = user.email || '';
  if (phoneEl) phoneEl.value = user.phone || '';
}

function initSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}
