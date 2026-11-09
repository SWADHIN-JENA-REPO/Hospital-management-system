/**
 * ============================================================================
 * CarePlus Hospital Management System — Admin Control Desk Logic (admin.js)
 * Subject: B.Tech CSE DBMS Project
 * Description: Handles Admin authentication (ADMIN@123), appointment approvals,
 *              reschedule/cancel request decisions, and real-time notifications.
 * ============================================================================
 */

let adminSupabaseClient = null;
const ADMIN_SESSION_KEY = "careplus_admin_authenticated";
const STORAGE_RECENT_KEY = "careplus_my_recent_appointments";
const STORAGE_PATIENTS_LIST_KEY = "careplus_enrolled_patients";
const STORAGE_ADMIN_NOTIFS_KEY = "careplus_admin_notifications";
const STORAGE_PATIENT_NOTIFS_KEY = "careplus_patient_notifications";
const STORAGE_CHANGE_REQS_KEY = "careplus_change_requests";

// In-memory cache for fast search & filtering
let allAppointments = [];
let allChangeRequests = [];
let allPatients = [];

// ----------------------------------------------------------------------------
// 1. INITIALIZATION ON DOM READY
// ----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async function () {
  initAdminSupabase();
  checkAdminAuth();
});

// ----------------------------------------------------------------------------
// 2. SUPABASE INITIALIZATION
// ----------------------------------------------------------------------------
function initAdminSupabase() {
  const dbStatusBanner = document.getElementById("dbStatusBanner");
  const dbStatusText = document.getElementById("dbStatusText");

  if (typeof window.CAREPLUS_CONFIG !== "undefined" && window.CAREPLUS_CONFIG.isConfigured()) {
    try {
      if (typeof window.supabase !== "undefined" && window.supabase.createClient) {
        const cleanUrl = window.CAREPLUS_CONFIG.getCleanUrl
          ? window.CAREPLUS_CONFIG.getCleanUrl()
          : window.CAREPLUS_CONFIG.SUPABASE_URL.replace(/\/rest\/v1\/?$/, "");

        adminSupabaseClient = window.supabase.createClient(
          cleanUrl,
          window.CAREPLUS_CONFIG.SUPABASE_ANON_KEY
        );

        if (dbStatusBanner && dbStatusText) {
          dbStatusBanner.classList.add("connected");
          dbStatusText.innerHTML = `🟢 <strong>PostgreSQL Connected:</strong> Connected to Supabase (Real-time sync enabled)`;
        }
        console.log("Admin Desk: Supabase PostgreSQL connected.");
        return;
      }
    } catch (err) {
      console.error("Admin Desk: Supabase init error:", err);
    }
  }

  if (dbStatusBanner && dbStatusText) {
    dbStatusBanner.classList.remove("connected");
    dbStatusText.innerHTML = `⚠️ <strong>DBMS Preview Mode:</strong> Running with browser LocalStorage database. Configure <code>config.js</code> to link Supabase.`;
  }
}

// ----------------------------------------------------------------------------
// 3. ADMIN AUTHENTICATION (PASSWORD: ADMIN@123)
// ----------------------------------------------------------------------------
function checkAdminAuth() {
  const isAuth = sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  const loginSection = document.getElementById("adminLoginSection");
  const dashboardSection = document.getElementById("adminDashboardSection");
  const sessionInfo = document.getElementById("adminSessionInfo");
  const logoutBtn = document.getElementById("adminLogoutBtn");

  if (isAuth) {
    if (loginSection) loginSection.style.display = "none";
    if (dashboardSection) dashboardSection.style.display = "block";
    if (sessionInfo) sessionInfo.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    loadAllAdminData();
  } else {
    if (loginSection) loginSection.style.display = "block";
    if (dashboardSection) dashboardSection.style.display = "none";
    if (sessionInfo) sessionInfo.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  const emailInput = document.getElementById("adminEmailInput").value.trim();
  const passwordInput = document.getElementById("adminPasswordInput").value;
  const errorDiv = document.getElementById("adminLoginError");

  const config = window.CAREPLUS_CONFIG ? window.CAREPLUS_CONFIG.ADMIN_USER : {
    email: "admin@careplus.com",
    username: "admin",
    password: "ADMIN@123"
  };

  const isEmailOrUserValid =
    emailInput.toLowerCase() === config.email.toLowerCase() ||
    emailInput.toLowerCase() === config.username.toLowerCase();

  // PASSWORD REQUIREMENT: ADMIN@123
  if (isEmailOrUserValid && passwordInput === config.password) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    if (errorDiv) errorDiv.style.display = "none";
    checkAdminAuth();
  } else {
    if (errorDiv) {
      errorDiv.textContent = "Invalid Admin credentials! Required password is: ADMIN@123";
      errorDiv.style.display = "block";
    }
  }
}

function handleAdminLogout() {
  if (confirm("Are you sure you want to sign out from the Admin Control Desk?")) {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    checkAdminAuth();
  }
}

// ----------------------------------------------------------------------------
// 4. LOAD ALL DATA FROM SUPABASE / LOCALSTORAGE
// ----------------------------------------------------------------------------
async function loadAllAdminData() {
  await Promise.all([
    fetchAppointments(),
    fetchChangeRequests(),
    fetchRegisteredPatients(),
    fetchAdminNotifications()
  ]);
  updateDashboardStats();
}

// ----------------------------------------------------------------------------
// 5. APPOINTMENTS MANAGEMENT
// ----------------------------------------------------------------------------
async function fetchAppointments() {
  allAppointments = [];

  // 1. Try Supabase
  if (adminSupabaseClient) {
    try {
      const { data, error } = await adminSupabaseClient
        .from("appointments")
        .select("*, departments(name), doctors(name)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        allAppointments = data.map(item => ({
          ref: item.appointment_ref,
          patientName: item.patient_name,
          age: item.age,
          gender: item.gender,
          phone: item.phone,
          email: item.email,
          department: item.departments ? item.departments.name : "Department " + item.department_id,
          doctor: item.doctors ? item.doctors.name : "Doctor " + item.doctor_id,
          date: item.appointment_date,
          time: item.appointment_time,
          reason: item.reason || "General Consultation",
          status: item.status || "Pending",
          source: "supabase"
        }));
      }
    } catch (e) {
      console.warn("Could not query Supabase appointments:", e);
    }
  }

  // 2. Merge local storage appointments if not duplicate
  const localList = getLocalAppointments();
  localList.forEach(localItem => {
    if (!allAppointments.some(a => a.ref === localItem.ref)) {
      allAppointments.push({
        ref: localItem.ref,
        patientName: localItem.patientName,
        age: localItem.age || "-",
        gender: localItem.gender || "-",
        phone: localItem.phone,
        email: localItem.email || "-",
        department: localItem.department,
        doctor: localItem.doctor,
        date: localItem.date,
        time: localItem.time,
        reason: localItem.reason || "General Consultation",
        status: localItem.status || "Pending",
        source: "local"
      });
    }
  });

  renderAppointmentsTable(allAppointments);
}

function renderAppointmentsTable(list) {
  const tbody = document.getElementById("adminAppointmentsTableBody");
  const countBadge = document.getElementById("visibleAppCount");
  const tabBadge = document.getElementById("tabCountAppointments");

  if (!tbody) return;
  tbody.innerHTML = "";

  if (countBadge) countBadge.textContent = list.length;
  if (tabBadge) tabBadge.textContent = allAppointments.length;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem; color: #64748b;">
          No appointment records found matching the filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(app => {
    const statusClass = "badge-" + (app.status || "pending").toLowerCase();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><span class="ref-pill">${escapeHtml(app.ref)}</span></td>
      <td>
        <strong>${escapeHtml(app.patientName)}</strong><br>
        <small style="color: #64748b;">${app.age ? app.age + " yrs &bull; " + app.gender : ""}</small>
      </td>
      <td>
        <div>📞 ${escapeHtml(app.phone)}</div>
        <small style="color: #64748b;">✉️ ${escapeHtml(app.email || "-")}</small>
      </td>
      <td>
        <strong>${escapeHtml(app.doctor)}</strong><br>
        <span class="table-badge">${escapeHtml(app.department)}</span>
      </td>
      <td>
        <div>📅 ${formatDate(app.date)}</div>
        <strong style="color: #0f766e; font-size: 0.85rem;">⏰ ${escapeHtml(app.time)}</strong>
      </td>
      <td>
        <span title="${escapeHtml(app.reason)}" style="font-size: 0.85rem; max-width: 150px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${escapeHtml(app.reason)}
        </span>
      </td>
      <td>
        <span class="badge-status ${statusClass}">${escapeHtml(app.status)}</span>
      </td>
      <td class="action-cell">
        ${app.status === "Pending" ? `
          <button type="button" class="btn-table-action" style="background: #dcfce7; color: #166534;" onclick="adminApproveAppointment('${escapeHtml(app.ref)}', '${escapeHtml(app.phone)}')">
            ✅ Approve
          </button>
          <button type="button" class="btn-table-action btn-delete" onclick="adminDeclineAppointment('${escapeHtml(app.ref)}', '${escapeHtml(app.phone)}')">
            ❌ Decline
          </button>
        ` : `
          <button type="button" class="btn-table-action" style="background: #e0f2fe; color: #0369a1;" onclick="adminUpdateStatus('${escapeHtml(app.ref)}', '${escapeHtml(app.phone)}')">
            ✏️ Change
          </button>
        `}
        <button type="button" class="btn-table-action" style="background: #f1f5f9; color: #475569;" onclick="adminDeleteAppointment('${escapeHtml(app.ref)}')">
          🗑️
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterAppointmentsTable() {
  const query = (document.getElementById("appointmentSearchInput")?.value || "").toLowerCase().trim();
  const statusFilter = document.getElementById("appointmentStatusFilter")?.value || "ALL";

  const filtered = allAppointments.filter(app => {
    const matchesSearch =
      !query ||
      (app.patientName && app.patientName.toLowerCase().includes(query)) ||
      (app.ref && app.ref.toLowerCase().includes(query)) ||
      (app.phone && app.phone.includes(query)) ||
      (app.doctor && app.doctor.toLowerCase().includes(query)) ||
      (app.department && app.department.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "ALL" ||
      (app.status && app.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  renderAppointmentsTable(filtered);
}

// ----------------------------------------------------------------------------
// 6. ADMIN DECISION ACTIONS (APPROVE / DECLINE / UPDATE)
// ----------------------------------------------------------------------------
async function adminApproveAppointment(ref, phone) {
  if (!confirm(`Are you sure you want to APPROVE appointment ${ref}?`)) return;

  const newStatus = "Confirmed";
  await applyAppointmentStatusChange(ref, phone, newStatus, `Your appointment ${ref} has been APPROVED by the hospital administration.`);
  alert(`Appointment ${ref} has been Approved and Confirmed!`);
}

async function adminDeclineAppointment(ref, phone) {
  const reason = prompt(`Enter reason for declining appointment ${ref}:`, "Specialist doctor unavailable for this slot");
  if (reason === null) return;

  const newStatus = "Cancelled";
  await applyAppointmentStatusChange(ref, phone, newStatus, `Your appointment ${ref} was DECLINED by the hospital. Reason: ${reason}`);
  alert(`Appointment ${ref} has been Declined/Cancelled.`);
}

async function adminUpdateStatus(ref, phone) {
  const choices = ["Confirmed", "Pending", "Completed", "Cancelled"];
  const choice = prompt(`Update status for ${ref}. Enter one of: ${choices.join(", ")}`, "Completed");
  if (!choice || !choices.includes(choice)) return;

  await applyAppointmentStatusChange(ref, phone, choice, `Your appointment ${ref} status has been updated to ${choice.toUpperCase()} by hospital administration.`);
  alert(`Appointment ${ref} status changed to ${choice}.`);
}

async function applyAppointmentStatusChange(ref, phone, newStatus, notifyMessage) {
  // 1. Update in memory
  const match = allAppointments.find(a => a.ref === ref);
  if (match) match.status = newStatus;

  // 2. Update Supabase if available
  if (adminSupabaseClient) {
    try {
      await adminSupabaseClient
        .from("appointments")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("appointment_ref", ref);

      // Send real-time notification to patient in PostgreSQL
      await adminSupabaseClient.from("patient_notifications").insert([{
        patient_phone: phone,
        appointment_ref: ref,
        message: notifyMessage,
        status: newStatus,
        is_read: false
      }]);
    } catch (e) {
      console.warn("Could not update status in Supabase:", e);
    }
  }

  // 3. Update localStorage recent appointments
  const localList = getLocalAppointments();
  const localMatch = localList.find(a => a.ref === ref);
  if (localMatch) {
    localMatch.status = newStatus;
    saveLocalAppointments(localList);
  }

  // 4. Save notification to localStorage for patient portal banner
  saveLocalPatientNotification({
    id: "notif_" + Date.now(),
    ref: ref,
    phone: phone,
    message: notifyMessage,
    status: newStatus,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    is_read: false
  });

  renderAppointmentsTable(allAppointments);
  updateDashboardStats();
}

async function adminDeleteAppointment(ref) {
  if (!confirm(`Are you sure you want to permanently DELETE appointment ${ref} from the database?`)) return;

  if (adminSupabaseClient) {
    try {
      await adminSupabaseClient.from("appointments").delete().eq("appointment_ref", ref);
    } catch (e) {
      console.warn("Error deleting from Supabase:", e);
    }
  }

  allAppointments = allAppointments.filter(a => a.ref !== ref);
  const localList = getLocalAppointments().filter(a => a.ref !== ref);
  saveLocalAppointments(localList);

  renderAppointmentsTable(allAppointments);
  updateDashboardStats();
  alert(`Appointment ${ref} deleted.`);
}

// ----------------------------------------------------------------------------
// 7. PATIENT CHANGE & CANCELLATION REQUESTS
// ----------------------------------------------------------------------------
async function fetchChangeRequests() {
  allChangeRequests = [];

  if (adminSupabaseClient) {
    try {
      const { data, error } = await adminSupabaseClient
        .from("appointment_change_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        allChangeRequests = data.map(r => ({
          id: r.request_id || r.id,
          ref: r.appointment_ref,
          phone: r.patient_phone,
          type: r.request_type,
          newDate: r.requested_date,
          newTime: r.requested_time,
          reason: r.reason,
          status: r.status || "Pending",
          source: "supabase"
        }));
      }
    } catch (e) {
      console.warn("Error fetching Supabase change requests:", e);
    }
  }

  const localReqs = getLocalChangeRequests();
  localReqs.forEach(lr => {
    if (!allChangeRequests.some(r => r.ref === lr.ref && r.type === lr.type)) {
      allChangeRequests.push(lr);
    }
  });

  renderChangeRequestsTable(allChangeRequests);
}

function renderChangeRequestsTable(list) {
  const tbody = document.getElementById("adminChangeRequestsTableBody");
  const tabBadge = document.getElementById("tabCountChanges");

  if (!tbody) return;
  tbody.innerHTML = "";

  const pendingCount = list.filter(r => r.status === "Pending").length;
  if (tabBadge) tabBadge.textContent = pendingCount;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: #64748b;">
          No patient change or cancellation requests found.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(req => {
    const isPending = req.status === "Pending";
    const statusClass = "badge-" + req.status.toLowerCase();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="ref-pill">${escapeHtml(req.ref)}</span></td>
      <td>📞 ${escapeHtml(req.phone)}</td>
      <td>
        <span class="table-badge" style="${req.type === 'Cancel' ? 'background: #fee2e2; color: #b91c1c;' : 'background: #e0f2fe; color: #0369a1;'}">
          ${req.type === 'Cancel' ? '❌ Cancellation' : '📅 Reschedule'}
        </span>
      </td>
      <td>
        ${req.type === 'Reschedule' ? `
          <div>📅 ${formatDate(req.newDate)}</div>
          <strong style="color: #0f766e;">⏰ ${escapeHtml(req.newTime || "-")}</strong>
        ` : `<em style="color: #64748b;">(Cancel Appointment)</em>`}
      </td>
      <td><small>${escapeHtml(req.reason)}</small></td>
      <td><span class="badge-status ${statusClass}">${escapeHtml(req.status)}</span></td>
      <td class="action-cell">
        ${isPending ? `
          <button type="button" class="btn-table-action" style="background: #dcfce7; color: #166534;" onclick="adminApproveChangeRequest('${escapeHtml(req.id)}', '${escapeHtml(req.ref)}', '${escapeHtml(req.phone)}', '${escapeHtml(req.type)}', '${escapeHtml(req.newDate)}', '${escapeHtml(req.newTime)}')">
            ✅ Approve
          </button>
          <button type="button" class="btn-table-action btn-delete" onclick="adminRejectChangeRequest('${escapeHtml(req.id)}', '${escapeHtml(req.ref)}', '${escapeHtml(req.phone)}')">
            ❌ Reject
          </button>
        ` : `<span style="font-size: 0.85rem; color: #64748b;">Resolved</span>`}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function adminApproveChangeRequest(reqId, ref, phone, type, newDate, newTime) {
  if (!confirm(`Are you sure you want to APPROVE this ${type} request for Appointment ${ref}?`)) return;

  // 1. Update appointment record
  if (type === "Cancel") {
    await applyAppointmentStatusChange(ref, phone, "Cancelled", `Admin has APPROVED your cancellation request for appointment ${ref}.`);
  } else {
    // Reschedule
    const match = allAppointments.find(a => a.ref === ref);
    if (match) {
      match.date = newDate;
      match.time = newTime;
      match.status = "Confirmed";
    }

    if (adminSupabaseClient) {
      try {
        await adminSupabaseClient
          .from("appointments")
          .update({
            appointment_date: newDate,
            appointment_time: newTime,
            status: "Confirmed",
            updated_at: new Date().toISOString()
          })
          .eq("appointment_ref", ref);
      } catch (e) {}
    }

    const localList = getLocalAppointments();
    const localMatch = localList.find(a => a.ref === ref);
    if (localMatch) {
      localMatch.date = newDate;
      localMatch.time = newTime;
      localMatch.status = "Confirmed";
      saveLocalAppointments(localList);
    }

    saveLocalPatientNotification({
      id: "notif_" + Date.now(),
      ref: ref,
      phone: phone,
      message: `Admin has APPROVED your reschedule request for appointment ${ref}! New schedule: ${formatDate(newDate)} at ${newTime}.`,
      status: "Confirmed",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_read: false
    });
  }

  // 2. Mark request approved
  const reqMatch = allChangeRequests.find(r => r.id == reqId || r.ref === ref);
  if (reqMatch) reqMatch.status = "Approved";

  if (adminSupabaseClient) {
    try {
      await adminSupabaseClient
        .from("appointment_change_requests")
        .update({ status: "Approved", resolved_at: new Date().toISOString() })
        .eq("appointment_ref", ref);
    } catch (e) {}
  }

  const localReqs = getLocalChangeRequests();
  const lrMatch = localReqs.find(r => r.id == reqId || r.ref === ref);
  if (lrMatch) {
    lrMatch.status = "Approved";
    localStorage.setItem(STORAGE_CHANGE_REQS_KEY, JSON.stringify(localReqs));
  }

  renderChangeRequestsTable(allChangeRequests);
  renderAppointmentsTable(allAppointments);
  updateDashboardStats();
  alert(`The ${type} request for ${ref} has been approved and patient notified!`);
}

async function adminRejectChangeRequest(reqId, ref, phone) {
  const reason = prompt("Enter reason for rejecting change request:", "Requested slot is already booked");
  if (reason === null) return;

  const reqMatch = allChangeRequests.find(r => r.id == reqId || r.ref === ref);
  if (reqMatch) reqMatch.status = "Rejected";

  if (adminSupabaseClient) {
    try {
      await adminSupabaseClient
        .from("appointment_change_requests")
        .update({ status: "Rejected", admin_notes: reason, resolved_at: new Date().toISOString() })
        .eq("appointment_ref", ref);

      await adminSupabaseClient.from("patient_notifications").insert([{
        patient_phone: phone,
        appointment_ref: ref,
        message: `Your appointment change request for ${ref} was DECLINED by hospital admin. Reason: ${reason}`,
        status: "Declined",
        is_read: false
      }]);
    } catch (e) {}
  }

  saveLocalPatientNotification({
    id: "notif_" + Date.now(),
    ref: ref,
    phone: phone,
    message: `Your appointment change request for ${ref} was DECLINED by administration. Reason: ${reason}`,
    status: "Declined",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    is_read: false
  });

  const localReqs = getLocalChangeRequests();
  const lrMatch = localReqs.find(r => r.id == reqId || r.ref === ref);
  if (lrMatch) {
    lrMatch.status = "Rejected";
    localStorage.setItem(STORAGE_CHANGE_REQS_KEY, JSON.stringify(localReqs));
  }

  renderChangeRequestsTable(allChangeRequests);
  alert(`Change request for ${ref} has been rejected.`);
}

// ----------------------------------------------------------------------------
// 8. REGISTERED PATIENTS DIRECTORY
// ----------------------------------------------------------------------------
async function fetchRegisteredPatients() {
  allPatients = [];

  if (adminSupabaseClient) {
    try {
      const { data, error } = await adminSupabaseClient
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        allPatients = data;
      }
    } catch (e) {
      console.warn("Error fetching Supabase patients:", e);
    }
  }

  const localPatients = getLocalPatients();
  localPatients.forEach(lp => {
    if (!allPatients.some(p => p.phone === lp.phone || p.email === lp.email)) {
      allPatients.push(lp);
    }
  });

  renderPatientsTable(allPatients);
}

function renderPatientsTable(list) {
  const tbody = document.getElementById("adminPatientsTableBody");
  const tabBadge = document.getElementById("tabCountPatients");

  if (!tbody) return;
  tbody.innerHTML = "";

  if (tabBadge) tabBadge.textContent = list.length;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
          No enrolled patients found in database yet.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach((p, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${escapeHtml(p.full_name || p.name || "Patient")}</strong></td>
      <td>📞 ${escapeHtml(p.phone)}</td>
      <td>✉️ ${escapeHtml(p.email || "-")}</td>
      <td>${p.age ? p.age + " yrs &bull; " + p.gender : "-"}</td>
      <td>${formatDate(p.created_at || p.registered_at || new Date().toISOString().split("T")[0])}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ----------------------------------------------------------------------------
// 9. ADMIN NOTIFICATIONS
// ----------------------------------------------------------------------------
async function fetchAdminNotifications() {
  let notifs = getLocalAdminNotifications();

  if (adminSupabaseClient) {
    try {
      const { data, error } = await adminSupabaseClient
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        data.forEach(rn => {
          if (!notifs.some(n => n.id === rn.id)) {
            notifs.unshift({
              id: rn.id,
              type: rn.notification_type,
              title: rn.title,
              message: rn.message,
              ref: rn.appointment_ref,
              time: new Date(rn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              is_read: rn.is_read
            });
          }
        });
      }
    } catch (e) {}
  }

  renderAdminNotifications(notifs);
}

function renderAdminNotifications(notifs) {
  const container = document.getElementById("adminNotifsList");
  const badge = document.getElementById("unreadNotifCount");

  if (!container) return;
  container.innerHTML = "";

  const unreadCount = notifs.filter(n => !n.is_read).length;
  if (badge) badge.textContent = `${unreadCount} New`;

  if (notifs.length === 0) {
    container.innerHTML = `<div style="color: #64748b; font-size: 0.88rem; font-style: italic;">No new notifications from patients.</div>`;
    return;
  }

  notifs.slice(0, 10).forEach(n => {
    let typeClass = "booking";
    if (n.type === "change_request") typeClass = "change";
    if (n.type === "patient_enrolled") typeClass = "patient";

    const div = document.createElement("div");
    div.className = `notif-card ${typeClass}`;
    div.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 0.9rem; color: #1e293b; margin-bottom: 2px;">
          ${n.type === 'change_request' ? '⚠️' : n.type === 'patient_enrolled' ? '👤' : '🏥'} ${escapeHtml(n.title)}
          ${n.ref ? `<code style="font-size: 0.8rem; background: #e2e8f0; padding: 2px 5px; border-radius: 4px; margin-left: 6px;">${escapeHtml(n.ref)}</code>` : ""}
        </div>
        <p style="margin: 0; font-size: 0.85rem; color: #475569;">${escapeHtml(n.message)}</p>
      </div>
      <div style="font-size: 0.78rem; color: #94a3b8; white-space: nowrap; margin-left: 12px;">
        ${escapeHtml(n.time || "")}
      </div>
    `;
    container.appendChild(div);
  });
}

function clearAdminNotifications() {
  localStorage.removeItem(STORAGE_ADMIN_NOTIFS_KEY);
  renderAdminNotifications([]);
}

// ----------------------------------------------------------------------------
// 10. DASHBOARD STAT COUNTERS & TABS
// ----------------------------------------------------------------------------
function updateDashboardStats() {
  const total = allAppointments.length;
  const pending = allAppointments.filter(a => a.status === "Pending").length;
  const confirmed = allAppointments.filter(a => a.status === "Confirmed").length;
  const totalPatients = allPatients.length;

  const totalEl = document.getElementById("statTotalAppointments");
  const pendingEl = document.getElementById("statPendingAppointments");
  const confirmedEl = document.getElementById("statConfirmedAppointments");
  const patientsEl = document.getElementById("statTotalPatients");

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (confirmedEl) confirmedEl.textContent = confirmed;
  if (patientsEl) patientsEl.textContent = totalPatients;
}

function switchAdminTab(tabName) {
  const tabs = ["appointments", "changes", "patients", "dbms"];
  tabs.forEach(t => {
    const btn = document.getElementById("tabBtn" + capitalize(t));
    const content = document.getElementById("tabContent" + capitalize(t));
    if (btn) btn.classList.toggle("active", t === tabName);
    if (content) content.style.display = t === tabName ? "block" : "none";
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ----------------------------------------------------------------------------
// 11. LOCAL REPOSITORY UTILITIES
// ----------------------------------------------------------------------------
function getLocalAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalAppointments(list) {
  try {
    localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(list));
  } catch (e) {}
}

function getLocalPatients() {
  try {
    const raw = localStorage.getItem(STORAGE_PATIENTS_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function getLocalChangeRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_CHANGE_REQS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function getLocalAdminNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalPatientNotification(notif) {
  try {
    const raw = localStorage.getItem(STORAGE_PATIENT_NOTIFS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(notif);
    localStorage.setItem(STORAGE_PATIENT_NOTIFS_KEY, JSON.stringify(list.slice(0, 30)));
  } catch (e) {}
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
