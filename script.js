/**
 * ============================================================================
 * CarePlus Hospital Management System — Frontend Logic (script.js)
 * Subject: B.Tech CSE DBMS Project
 * Description: Connects patient frontend to PostgreSQL (Supabase), handles
 *              form validation, secure status tracking, and change requests.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. SUPABASE CLIENT & STORAGE STATE KEYS
// ----------------------------------------------------------------------------
let supabaseClient = null;
const STORAGE_RECENT_KEY = "careplus_my_recent_appointments";
const STORAGE_PATIENT_KEY = "careplus_current_patient";
const STORAGE_PATIENTS_LIST_KEY = "careplus_enrolled_patients";
const STORAGE_ADMIN_NOTIFS_KEY = "careplus_admin_notifications";
const STORAGE_PATIENT_NOTIFS_KEY = "careplus_patient_notifications";
const STORAGE_CHANGE_REQS_KEY = "careplus_change_requests";

// Mapping of Departments to assigned Doctor names and IDs
const departmentData = {
  "General Medicine": { id: 1, doctor: "Dr. Ananya Das", docId: 1 },
  "Cardiology": { id: 2, doctor: "Dr. Rajesh Mishra", docId: 2 },
  "Neurology": { id: 3, doctor: "Dr. Suman Patnaik", docId: 3 },
  "Orthopedics": { id: 4, doctor: "Dr. Abhishek Mohanty", docId: 4 },
  "Dermatology": { id: 5, doctor: "Dr. Priya Rout", docId: 5 },
  "Pediatrics": { id: 6, doctor: "Dr. Rakesh Behera", docId: 6 },
  "Gynecology": { id: 7, doctor: "Dr. Sneha Nayak", docId: 7 },
  "ENT": { id: 8, doctor: "Dr. Amit Pradhan", docId: 8 },
  "Ophthalmology": { id: 9, doctor: "Dr. Pooja Sahu", docId: 9 },
  "Diabetes & Endocrinology": { id: 10, doctor: "Dr. Debasish Jena", docId: 10 }
};

// ----------------------------------------------------------------------------
// 2. DOM ELEMENT REFERENCES
// ----------------------------------------------------------------------------
const appointmentForm = document.getElementById("appointmentForm");
const departmentSelect = document.getElementById("departmentSelect");
const doctorSelect = document.getElementById("doctorSelect");
const appointmentDate = document.getElementById("appointmentDate");
const appointmentTime = document.getElementById("appointmentTime");
const successMessage = document.getElementById("successMessage");
const successDetails = document.getElementById("successDetails");
const appointmentTableBody = document.getElementById("appointmentTableBody");
const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");
const dbStatusBanner = document.getElementById("dbStatusBanner");
const dbStatusText = document.getElementById("dbStatusText");
const appointmentCountBadge = document.getElementById("appointmentCountBadge");
const changeRequestModal = document.getElementById("changeRequestModal");
const trackResultContainer = document.getElementById("trackResultContainer");
const patientAuthModal = document.getElementById("patientAuthModal");
const navAuthBtn = document.getElementById("navAuthBtn");
const patientNotificationAlert = document.getElementById("patientNotificationAlert");

// ----------------------------------------------------------------------------
// 3. INITIALIZATION ON DOM READY
// ----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async function () {
  // Prevent selection of past dates
  setMinAppointmentDate();

  // Setup mobile navigation toggle
  setupMobileNavigation();

  // Initialize Supabase Client
  initSupabase();

  // Check if a patient is logged in and auto-populate form
  checkPatientSession();

  // Check for admin notifications (approvals/declines) sent to this patient
  await checkPatientNotifications();

  // Listen for Department select changes
  if (departmentSelect) {
    departmentSelect.addEventListener("change", function () {
      updateDoctors(this.value);
    });
  }

  // Listen for Appointment form submission
  if (appointmentForm) {
    appointmentForm.addEventListener("submit", handleAppointmentSubmit);
  }

  // Render recent patient appointments in table
  await loadRecentAppointments();
});

// ----------------------------------------------------------------------------
// 4. SUPABASE CLIENT CONNECTION HANDLER
// ----------------------------------------------------------------------------
function initSupabase() {
  if (typeof window.CAREPLUS_CONFIG !== "undefined" && window.CAREPLUS_CONFIG.isConfigured()) {
    try {
      if (typeof window.supabase !== "undefined" && window.supabase.createClient) {
        const cleanUrl = window.CAREPLUS_CONFIG.getCleanUrl
          ? window.CAREPLUS_CONFIG.getCleanUrl()
          : window.CAREPLUS_CONFIG.SUPABASE_URL.replace(/\/rest\/v1\/?$/, "");

        supabaseClient = window.supabase.createClient(
          cleanUrl,
          window.CAREPLUS_CONFIG.SUPABASE_ANON_KEY
        );

        if (dbStatusBanner && dbStatusText) {
          dbStatusBanner.classList.add("connected");
          dbStatusText.innerHTML = `🟢 <strong>PostgreSQL Connected:</strong> Connected to Supabase (Real-time database active)`;
        }
        console.log("CarePlus: Supabase PostgreSQL client connected successfully.");
        return;
      }
    } catch (err) {
      console.error("CarePlus: Error initializing Supabase client:", err);
    }
  }

  // Fallback to Setup Notice
  if (dbStatusBanner && dbStatusText) {
    dbStatusBanner.classList.remove("connected");
    dbStatusText.innerHTML = `⚠️ <strong>Database Setup Required:</strong> Add your Supabase credentials in <code>config.js</code>. Running in offline preview mode.`;
  }
}

// ----------------------------------------------------------------------------
// 5. DATE PICKER RESTRICTION (PREVENT PAST DATES)
// ----------------------------------------------------------------------------
function setMinAppointmentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedToday = `${year}-${month}-${day}`;

  if (appointmentDate) {
    appointmentDate.setAttribute("min", formattedToday);
  }

  const modalDate = document.getElementById("modalNewDate");
  if (modalDate) {
    modalDate.setAttribute("min", formattedToday);
  }
}

// ----------------------------------------------------------------------------
// 6. DYNAMIC DEPARTMENT & DOCTOR LINKING
// ----------------------------------------------------------------------------
function updateDoctors(selectedDept, preferredDoctor = "") {
  if (!doctorSelect) return;

  doctorSelect.innerHTML = "";

  if (!selectedDept || !departmentData[selectedDept]) {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Select Department First --";
    doctorSelect.appendChild(defaultOption);
    return;
  }

  const assignedDoctor = departmentData[selectedDept].doctor;

  const defaultChoose = document.createElement("option");
  defaultChoose.value = "";
  defaultChoose.textContent = "-- Choose Doctor --";
  doctorSelect.appendChild(defaultChoose);

  const docOption = document.createElement("option");
  docOption.value = assignedDoctor;
  docOption.textContent = assignedDoctor;
  doctorSelect.appendChild(docOption);

  doctorSelect.value = assignedDoctor;
}

// Quick booking shortcuts from cards
function bookDepartment(deptName) {
  if (departmentSelect) {
    departmentSelect.value = deptName;
    updateDoctors(deptName);
    scrollToAppointmentForm();
  }
}

function bookDoctor(deptName, doctorName) {
  if (departmentSelect) {
    departmentSelect.value = deptName;
    updateDoctors(deptName, doctorName);
    scrollToAppointmentForm();
  }
}

function scrollToAppointmentForm() {
  const section = document.getElementById("appointment");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      const nameInput = document.getElementById("patientName");
      if (nameInput) nameInput.focus();
    }, 400);
  }
}

// ----------------------------------------------------------------------------
// 7. APPOINTMENT FORM VALIDATION & SUBMISSION (POSTGRESQL INSERT)
// ----------------------------------------------------------------------------
async function handleAppointmentSubmit(event) {
  event.preventDefault();
  clearErrors();

  const patientName = document.getElementById("patientName").value.trim();
  const patientAge = document.getElementById("patientAge").value.trim();
  const patientGender = document.getElementById("patientGender").value;
  const patientPhone = document.getElementById("patientPhone").value.trim();
  const patientEmail = document.getElementById("patientEmail").value.trim();
  const department = departmentSelect ? departmentSelect.value : "";
  const doctor = doctorSelect ? doctorSelect.value : "";
  const date = appointmentDate ? appointmentDate.value : "";
  const time = appointmentTime ? appointmentTime.value : "";
  const reason = document.getElementById("visitReason").value.trim();

  let isValid = true;

  // Validation 1: Patient Name
  if (patientName.length < 2) {
    showError("patientNameError", "patientName", "Please enter a valid patient name (min 2 characters).");
    isValid = false;
  }

  // Validation 2: Age
  const ageNum = parseInt(patientAge, 10);
  if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
    showError("patientAgeError", "patientAge", "Please enter a realistic age between 1 and 120.");
    isValid = false;
  }

  // Validation 3: Gender
  if (!patientGender) {
    showError("patientGenderError", "patientGender", "Please select a gender.");
    isValid = false;
  }

  // Validation 4: Phone (10 digits)
  const phonePattern = /^[0-9]{10}$/;
  if (!phonePattern.test(patientPhone)) {
    showError("patientPhoneError", "patientPhone", "Please enter a valid 10-digit mobile number.");
    isValid = false;
  }

  // Validation 5: Email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(patientEmail)) {
    showError("patientEmailError", "patientEmail", "Please enter a valid email address.");
    isValid = false;
  }

  // Validation 6: Department
  if (!department) {
    showError("departmentError", "departmentSelect", "Please select a department.");
    isValid = false;
  }

  // Validation 7: Doctor
  if (!doctor) {
    showError("doctorError", "doctorSelect", "Please select a doctor.");
    isValid = false;
  }

  // Validation 8: Date (disallow past dates)
  if (!date) {
    showError("appointmentDateError", "appointmentDate", "Please select an appointment date.");
    isValid = false;
  } else {
    const selectedDate = new Date(date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showError("appointmentDateError", "appointmentDate", "Appointment date cannot be in the past.");
      isValid = false;
    }
  }

  // Validation 9: Time Slot
  if (!time) {
    showError("appointmentTimeError", "appointmentTime", "Please select a time slot.");
    isValid = false;
  }

  // Validation 10: Reason is OPTIONAL (as requested: if not filled, default is provided)
  const cleanReason = reason.length > 0 ? reason : "General Consultation / Health Checkup";

  if (!isValid) return;

  const submitButton = document.getElementById("submitBtn");
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Registering with Database...";
  }

  const deptInfo = departmentData[department] || { id: 1, docId: 1 };
  let assignedRef = "CP-" + Math.floor(10000 + Math.random() * 90000);

  const loggedPatient = getLoggedPatient();

  const newRecord = {
    appointment_ref: assignedRef,
    patient_name: patientName,
    age: ageNum,
    gender: patientGender,
    phone: patientPhone,
    email: patientEmail,
    department_id: deptInfo.id,
    doctor_id: deptInfo.docId,
    appointment_date: date,
    appointment_time: time,
    reason: cleanReason,
    status: "Pending"
  };

  try {
    // If Supabase is connected, insert directly into PostgreSQL
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("appointments")
        .insert([newRecord])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0 && data[0].appointment_ref) {
        assignedRef = data[0].appointment_ref;
      }

      // 📢 Send real-time notification to Hospital Admin in PostgreSQL
      try {
        await supabaseClient.from("admin_notifications").insert([
          {
            notification_type: "new_booking",
            title: "New Appointment Booked",
            message: `Patient ${patientName} (${patientPhone}) booked ${department} with ${doctor} for ${date} at ${time}.`,
            appointment_ref: assignedRef,
            is_read: false
          }
        ]);
      } catch (notifErr) {
        console.warn("Could not insert admin notification into Supabase:", notifErr);
      }
    }

    // 📢 Store admin notification locally so Admin sees it immediately even offline
    addLocalAdminNotification({
      id: "notif_" + Date.now(),
      type: "new_booking",
      title: "New Appointment Booked",
      message: `Patient ${patientName} (${patientPhone}) booked ${department} with ${doctor} for ${date} at ${time}.`,
      ref: assignedRef,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: date,
      is_read: false
    });

    // Also ensure patient profile is recorded in local registered patients list
    recordPatientDirectoryEntry({
      full_name: patientName,
      phone: patientPhone,
      email: patientEmail,
      age: ageNum,
      gender: patientGender,
      registered_at: new Date().toISOString()
    });

    // Cache appointment reference locally on user's device for fast status lookup
    saveRecentAppointment({
      ref: assignedRef,
      patientName: patientName,
      phone: patientPhone,
      department: department,
      doctor: doctor,
      date: date,
      time: time,
      status: "Pending",
      reason: cleanReason
    });

    // Show Confirmation Alert
    showSuccessNotification(assignedRef, patientName, doctor, department, date, time);

    // Reset Form
    appointmentForm.reset();
    updateDoctors("");

    // If patient is logged in, restore their personal info for convenience
    if (loggedPatient) {
      fillPatientFormFields(loggedPatient);
    }

    // Refresh Recent Table
    await loadRecentAppointments();

    if (successMessage) {
      successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch (err) {
    console.error("CarePlus: Database insert error:", err);
    alert("Database Error: " + (err.message || "Failed to save appointment. Please check console."));
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Appointment";
    }
  }
}

// ----------------------------------------------------------------------------
// 8. ERROR & SUCCESS NOTIFICATIONS
// ----------------------------------------------------------------------------
function showError(errorElementId, inputElementId, message) {
  const errorEl = document.getElementById(errorElementId);
  const inputEl = document.getElementById(inputElementId);
  if (errorEl) errorEl.textContent = message;
  if (inputEl) inputEl.classList.add("is-invalid");
}

function clearErrors() {
  document.querySelectorAll(".error-text").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
}

function showSuccessNotification(refCode, patientName, doctor, department, date, time) {
  if (successMessage && successDetails) {
    successDetails.innerHTML = `
      <div style="font-size: 1.05rem; margin-bottom: 8px;">
        Appointment registered successfully for <strong>${escapeHtml(patientName)}</strong>!
      </div>
      <div style="background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #bbf7d0; margin: 8px 0;">
        <span style="font-size: 0.9rem; color: #166534;">Your Reference Code:</span>
        <div style="font-size: 1.35rem; font-weight: 800; color: #0369a1; letter-spacing: 0.05em; font-family: monospace;">
          ${escapeHtml(refCode)}
        </div>
        <small style="color: #64748b;">(Save this reference code to track consultation status or request changes)</small>
      </div>
      <div>
        Specialist: <strong>${escapeHtml(doctor)}</strong> (${escapeHtml(department)}) &bull; 
        Date: <strong>${formatDate(date)}</strong> at <strong>${escapeHtml(time)}</strong> &bull; 
        Status: <span class="badge-status badge-pending">PENDING</span>
      </div>
    `;
    successMessage.style.display = "flex";
  }
}

// ----------------------------------------------------------------------------
// 9. SECURE PATIENT STATUS LOOKUP (BY REF & PHONE)
// ----------------------------------------------------------------------------
async function handleTrackAppointment(event) {
  event.preventDefault();
  const refCode = document.getElementById("trackRefInput").value.trim().toUpperCase();
  const phone = document.getElementById("trackPhoneInput").value.trim();

  if (!refCode || !phone) {
    alert("Please enter both your Appointment Reference Code and Registered Phone Number.");
    return;
  }

  const trackBtn = document.getElementById("trackSubmitBtn");
  if (trackBtn) {
    trackBtn.disabled = true;
    trackBtn.textContent = "Querying SQL...";
  }

  try {
    let appointment = null;

    if (supabaseClient) {
      // Secure RPC procedure call
      const { data, error } = await supabaseClient.rpc("lookup_patient_appointment", {
        p_ref: refCode,
        p_phone: phone
      });

      if (error) {
        console.warn("RPC query error, falling back to direct SELECT with RLS:", error);
        const direct = await supabaseClient
          .from("appointments")
          .select("*, departments(name), doctors(name)")
          .eq("appointment_ref", refCode)
          .eq("phone", phone)
          .maybeSingle();

        if (direct.data) {
          appointment = {
            appointment_ref: direct.data.appointment_ref,
            patient_name: direct.data.patient_name,
            age: direct.data.age,
            gender: direct.data.gender,
            phone: direct.data.phone,
            email: direct.data.email,
            department_name: direct.data.departments ? direct.data.departments.name : "Hospital Department",
            doctor_name: direct.data.doctors ? direct.data.doctors.name : "Assigned Specialist",
            appointment_date: direct.data.appointment_date,
            appointment_time: direct.data.appointment_time,
            reason: direct.data.reason,
            status: direct.data.status
          };
        }
      } else if (data && data.length > 0) {
        appointment = data[0];
      }
    } else {
      // Local fallback lookup
      const recents = getRecentAppointments();
      const match = recents.find(r => r.ref === refCode && r.phone === phone);
      if (match) {
        appointment = {
          appointment_ref: match.ref,
          patient_name: match.patientName,
          phone: match.phone,
          department_name: match.department,
          doctor_name: match.doctor,
          appointment_date: match.date,
          appointment_time: match.time,
          status: match.status || "Pending",
          reason: "Consultation"
        };
      }
    }

    if (!appointment) {
      renderTrackResult(null, "No appointment found matching reference " + refCode + " and phone " + phone + ". Please check and try again.");
    } else {
      renderTrackResult(appointment);
    }
  } catch (err) {
    console.error("CarePlus: Error tracking appointment:", err);
    renderTrackResult(null, "Error querying database: " + err.message);
  } finally {
    if (trackBtn) {
      trackBtn.disabled = false;
      trackBtn.textContent = "Track Status";
    }
  }
}

function renderTrackResult(appointment, errorMessage = "") {
  if (!trackResultContainer) return;

  if (!appointment) {
    trackResultContainer.style.display = "block";
    trackResultContainer.innerHTML = `
      <div class="alert alert-danger" style="background-color: #fee2e2; border: 1px solid #fecaca; color: #b91c1c; padding: 14px; border-radius: 8px;">
        ⚠️ <strong>Verification Notice:</strong> ${escapeHtml(errorMessage)}
      </div>
    `;
    return;
  }

  const statusClass = "badge-" + (appointment.status || "pending").toLowerCase();

  trackResultContainer.style.display = "block";
  trackResultContainer.innerHTML = `
    <div style="background: #f8fafc; border: 2px solid #0284c7; border-radius: 10px; padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
        <div>
          <span style="font-size: 0.85rem; color: #64748b;">Appointment Reference:</span>
          <span class="ref-pill" style="font-size: 1.15rem; margin-left: 6px;">${escapeHtml(appointment.appointment_ref)}</span>
        </div>
        <div>
          <span style="font-size: 0.85rem; color: #64748b; margin-right: 6px;">Live Status:</span>
          <span class="badge-status ${statusClass}">${escapeHtml(appointment.status)}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 16px;">
        <div>
          <strong style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Patient Name</strong>
          <div style="font-size: 1.05rem; font-weight: 700; color: #1e293b;">${escapeHtml(appointment.patient_name)}</div>
          <small style="color: #64748b;">${appointment.age ? appointment.age + " yrs &bull; " + appointment.gender : ""}</small>
        </div>
        <div>
          <strong style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Specialist & Dept</strong>
          <div style="font-size: 1.05rem; font-weight: 700; color: #0284c7;">${escapeHtml(appointment.doctor_name || appointment.doctor)}</div>
          <small style="color: #64748b;">${escapeHtml(appointment.department_name || appointment.department)}</small>
        </div>
        <div>
          <strong style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Date & Time Slot</strong>
          <div style="font-size: 1.05rem; font-weight: 700; color: #1e293b;">${formatDate(appointment.appointment_date)}</div>
          <small style="color: #0f766e; font-weight: 600;">${escapeHtml(appointment.appointment_time)}</small>
        </div>
      </div>

      ${appointment.reason ? `<div style="background: #ffffff; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 16px; font-size: 0.9rem;">
        <strong>Reason for Consultation:</strong> ${escapeHtml(appointment.reason)}
      </div>` : ""}

      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button 
          type="button" 
          class="btn btn-primary" 
          style="padding: 8px 18px; font-size: 0.85rem;" 
          onclick="openChangeModal('${escapeHtml(appointment.appointment_ref)}', '${escapeHtml(appointment.phone)}', 'Reschedule')"
        >
          📅 Request Reschedule / Change
        </button>
        <button 
          type="button" 
          class="btn btn-outline" 
          style="padding: 8px 18px; font-size: 0.85rem; color: #b91c1c; border-color: #fecaca;" 
          onclick="openChangeModal('${escapeHtml(appointment.appointment_ref)}', '${escapeHtml(appointment.phone)}', 'Cancel')"
        >
          ❌ Request Cancellation
        </button>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// 10. CHANGE REQUEST MODAL HANDLERS
// ----------------------------------------------------------------------------
function openChangeModal(appRef, phone, actionType = "Reschedule") {
  if (!changeRequestModal) return;

  document.getElementById("modalAppointmentRef").value = appRef;
  document.getElementById("modalPatientPhone").value = phone;
  document.getElementById("modalAppRefDisplay").textContent = appRef;

  const typeSelect = document.getElementById("changeRequestType");
  if (typeSelect) {
    typeSelect.value = actionType;
    toggleChangeTypeFields(actionType);
  }

  changeRequestModal.classList.add("active");
}

function closeChangeModal() {
  if (changeRequestModal) {
    changeRequestModal.classList.remove("active");
  }
}

function toggleChangeTypeFields(actionType) {
  const fields = document.getElementById("rescheduleFields");
  const modalDate = document.getElementById("modalNewDate");
  const modalTime = document.getElementById("modalNewTime");

  if (!fields) return;

  if (actionType === "Cancel") {
    fields.style.display = "none";
    if (modalDate) modalDate.required = false;
    if (modalTime) modalTime.required = false;
  } else {
    fields.style.display = "block";
    if (modalDate) modalDate.required = true;
    if (modalTime) modalTime.required = true;
  }
}

async function handleSubmittingChangeRequest(event) {
  event.preventDefault();

  const refCode = document.getElementById("modalAppointmentRef").value;
  const phone = document.getElementById("modalPatientPhone").value;
  const requestType = document.getElementById("changeRequestType").value;
  const newDate = document.getElementById("modalNewDate").value;
  const newTime = document.getElementById("modalNewTime").value;
  const reason = document.getElementById("modalChangeReason").value.trim();

  if (requestType === "Reschedule" && (!newDate || !newTime)) {
    alert("Please choose both a requested date and time slot.");
    return;
  }

  if (reason.length < 3) {
    alert("Please describe the reason for your change request.");
    return;
  }

  const submitBtn = document.getElementById("modalSubmitChangeBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting to Database...";
  }

  try {
    if (supabaseClient) {
      // 1. Submit to Supabase procedure
      const { data, error } = await supabaseClient.rpc("submit_patient_change_request", {
        p_ref: refCode,
        p_phone: phone,
        p_request_type: requestType,
        p_req_date: newDate || null,
        p_req_time: newTime || null,
        p_reason: reason
      });

      if (error) {
        console.warn("RPC error, attempting direct table insert:", error);
        await supabaseClient.from("appointment_change_requests").insert([{
          appointment_ref: refCode,
          patient_phone: phone,
          request_type: requestType,
          requested_date: newDate || null,
          requested_time: newTime || null,
          reason: reason,
          status: "Pending"
        }]);
      } else if (data && data.success === false) {
        alert("Verification Notice: " + data.message);
        return;
      }

      // 📢 Send alert notification to Admin in Supabase
      try {
        await supabaseClient.from("admin_notifications").insert([{
          notification_type: "change_request",
          title: `Appointment ${requestType} Request`,
          message: `Patient with Phone ${phone} submitted a ${requestType} request for Appointment ${refCode}. Reason: ${reason}`,
          appointment_ref: refCode,
          is_read: false
        }]);
      } catch (notifErr) {
        console.warn("Could not push admin change notification to Supabase:", notifErr);
      }
    }

    // 📢 Save change request and admin notification locally for immediate admin portal visibility
    saveLocalChangeRequest({
      id: "req_" + Date.now(),
      ref: refCode,
      phone: phone,
      type: requestType,
      newDate: newDate || null,
      newTime: newTime || null,
      reason: reason,
      status: "Pending",
      created_at: new Date().toISOString()
    });

    addLocalAdminNotification({
      id: "notif_" + Date.now(),
      type: "change_request",
      title: `Appointment ${requestType} Request`,
      message: `Patient ${phone} submitted a ${requestType} request for Appointment ${refCode}. Reason: ${reason}`,
      ref: refCode,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_read: false
    });

    closeChangeModal();
    alert(`Success! Your ${requestType} request for Appointment ${refCode} has been recorded in the database.\nOur hospital administration will review and confirm.`);

    // Clear form
    document.getElementById("changeRequestForm").reset();

    // Re-query status
    const trackEvent = new Event("submit");
    document.getElementById("trackRefInput").value = refCode;
    document.getElementById("trackPhoneInput").value = phone;
    handleTrackAppointment(trackEvent);
  } catch (err) {
    console.error("CarePlus: Error submitting change request:", err);
    alert("Error saving request to database: " + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Request";
    }
  }
}

// ----------------------------------------------------------------------------
// 11. RECENT APPOINTMENTS STORAGE & TABLE RENDERING
// ----------------------------------------------------------------------------
function getRecentAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveRecentAppointment(item) {
  const list = getRecentAppointments();
  // Keep only the most recent 10 bookings
  const filtered = list.filter(a => a.ref !== item.ref);
  filtered.unshift(item);
  try {
    localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(filtered.slice(0, 10)));
  } catch (e) {
    console.warn("Could not save recent appointment to localStorage:", e);
  }
}

async function loadRecentAppointments() {
  if (!appointmentTableBody) return;

  const recents = getRecentAppointments();
  appointmentTableBody.innerHTML = "";

  if (appointmentCountBadge) {
    appointmentCountBadge.textContent = `${recents.length} Recent Booking${recents.length === 1 ? "" : "s"}`;
  }

  if (recents.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="8" class="no-data-cell" style="text-align: center; padding: 2rem; color: #64748b;">
        No appointments booked from this browser yet. Fill out the booking form above to schedule a consultation!
      </td>
    `;
    appointmentTableBody.appendChild(emptyRow);
    return;
  }

  // If Supabase is connected, refresh real-time status from PostgreSQL
  if (supabaseClient && recents.length > 0) {
    try {
      const refs = recents.map(r => r.ref);
      const { data } = await supabaseClient
        .from("appointments")
        .select("appointment_ref, status, appointment_date, appointment_time")
        .in("appointment_ref", refs);

      if (data) {
        data.forEach(dbItem => {
          const match = recents.find(r => r.ref === dbItem.appointment_ref);
          if (match) {
            match.status = dbItem.status;
            match.date = dbItem.appointment_date;
            match.time = dbItem.appointment_time;
          }
        });
      }
    } catch (e) {
      console.warn("Could not sync recent bookings with Supabase:", e);
    }
  }

  recents.forEach((item) => {
    const statusClass = "badge-" + (item.status || "pending").toLowerCase();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="ref-pill">${escapeHtml(item.ref)}</span></td>
      <td><strong>${escapeHtml(item.patientName)}</strong></td>
      <td><span class="table-badge">${escapeHtml(item.department)}</span></td>
      <td>${escapeHtml(item.doctor)}</td>
      <td>${formatDate(item.date)}</td>
      <td><strong>${escapeHtml(item.time)}</strong></td>
      <td><span class="badge-status ${statusClass}">${escapeHtml(item.status || "Pending")}</span></td>
      <td class="action-cell">
        <button 
          type="button" 
          class="btn-table-action btn-edit" 
          onclick="openChangeModal('${escapeHtml(item.ref)}', '${escapeHtml(item.phone)}', 'Reschedule')"
          title="Request Reschedule"
        >
          ✏️ Change
        </button>
        <button 
          type="button" 
          class="btn-table-action btn-delete" 
          onclick="openChangeModal('${escapeHtml(item.ref)}', '${escapeHtml(item.phone)}', 'Cancel')"
          title="Request Cancellation"
        >
          ❌ Cancel
        </button>
      </td>
    `;
    appointmentTableBody.appendChild(row);
  });
}

// ----------------------------------------------------------------------------
// 12. HELPER UTILITIES
// ----------------------------------------------------------------------------
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

function setupMobileNavigation() {
  if (!menuToggle || !navbar) return;
  menuToggle.addEventListener("click", function () {
    navbar.classList.toggle("open");
  });
  document.querySelectorAll(".nav-links a, .nav-actions a").forEach((link) => {
    link.addEventListener("click", function () {
      navbar.classList.remove("open");
    });
  });
}

// ----------------------------------------------------------------------------
// 13. PATIENT AUTHENTICATION & ENROLLMENT (SIGN IN / SIGN UP / SIGN OUT)
// ----------------------------------------------------------------------------
function getLoggedPatient() {
  try {
    const raw = localStorage.getItem(STORAGE_PATIENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setLoggedPatient(patient) {
  try {
    if (patient) {
      localStorage.setItem(STORAGE_PATIENT_KEY, JSON.stringify(patient));
    } else {
      localStorage.removeItem(STORAGE_PATIENT_KEY);
    }
  } catch (e) {
    console.warn("Could not save patient session to localStorage:", e);
  }
}

function checkPatientSession() {
  const patient = getLoggedPatient();
  if (!navAuthBtn) return;

  if (patient && patient.full_name) {
    navAuthBtn.innerHTML = `👤 ${escapeHtml(patient.full_name)} <span style="font-size: 0.75rem; opacity: 0.85;">(Portal)</span>`;
    navAuthBtn.title = "View Patient Profile / Sign Out";
    navAuthBtn.onclick = openAuthModal;
    // Auto-fill booking form
    fillPatientFormFields(patient);
  } else {
    navAuthBtn.innerHTML = `👤 Patient Sign In`;
    navAuthBtn.title = "Sign In or Register as Patient";
    navAuthBtn.onclick = openAuthModal;
  }
}

function fillPatientFormFields(patient) {
  if (!patient) return;
  const nameInput = document.getElementById("patientName");
  const ageInput = document.getElementById("patientAge");
  const genderInput = document.getElementById("patientGender");
  const phoneInput = document.getElementById("patientPhone");
  const emailInput = document.getElementById("patientEmail");

  if (nameInput && !nameInput.value) nameInput.value = patient.full_name || "";
  if (ageInput && !ageInput.value && patient.age) ageInput.value = patient.age;
  if (genderInput && !genderInput.value && patient.gender) genderInput.value = patient.gender;
  if (phoneInput && !phoneInput.value) phoneInput.value = patient.phone || "";
  if (emailInput && !emailInput.value) emailInput.value = patient.email || "";
}

function openAuthModal() {
  if (!patientAuthModal) return;
  const patient = getLoggedPatient();

  const titleEl = document.getElementById("authModalTitle");
  const tabsContainer = document.getElementById("authTabsContainer");
  const signInForm = document.getElementById("patientSignInForm");
  const signUpForm = document.getElementById("patientSignUpForm");
  const profileView = document.getElementById("patientProfileView");

  if (patient) {
    // Show logged-in profile details
    if (titleEl) titleEl.textContent = "👤 Patient Account";
    if (tabsContainer) tabsContainer.style.display = "none";
    if (signInForm) signInForm.style.display = "none";
    if (signUpForm) signUpForm.style.display = "none";
    if (profileView) {
      profileView.style.display = "block";
      document.getElementById("profilePatientName").textContent = patient.full_name || "Patient";
      document.getElementById("profilePatientPhone").textContent = patient.phone || "-";
      document.getElementById("profilePatientEmail").textContent = patient.email || "-";
      document.getElementById("profilePatientAgeGender").textContent = `${patient.age || "-"} Years &bull; ${patient.gender || "-"}`;
    }
  } else {
    // Show Sign In or Sign Up tabs
    if (titleEl) titleEl.textContent = "👤 Patient Portal";
    if (tabsContainer) tabsContainer.style.display = "flex";
    if (profileView) profileView.style.display = "none";
    switchAuthTab("signin");
  }

  patientAuthModal.classList.add("active");
}

function closeAuthModal() {
  if (patientAuthModal) {
    patientAuthModal.classList.remove("active");
  }
}

function switchAuthTab(tab) {
  const tabSignIn = document.getElementById("tabSignInBtn");
  const tabSignUp = document.getElementById("tabSignUpBtn");
  const signInForm = document.getElementById("patientSignInForm");
  const signUpForm = document.getElementById("patientSignUpForm");
  const signInError = document.getElementById("signInErrorAlert");
  const signUpError = document.getElementById("signUpErrorAlert");

  if (signInError) signInError.style.display = "none";
  if (signUpError) signUpError.style.display = "none";

  if (tab === "signin") {
    if (tabSignIn) tabSignIn.classList.add("active");
    if (tabSignUp) tabSignUp.classList.remove("active");
    if (signInForm) signInForm.style.display = "block";
    if (signUpForm) signUpForm.style.display = "none";
  } else {
    if (tabSignUp) tabSignUp.classList.add("active");
    if (tabSignIn) tabSignIn.classList.remove("active");
    if (signUpForm) signUpForm.style.display = "block";
    if (signInForm) signInForm.style.display = "none";
  }
}

async function handlePatientSignIn(event) {
  event.preventDefault();
  const idVal = document.getElementById("authLoginIdentifier").value.trim();
  const pwdVal = document.getElementById("authLoginPassword").value;
  const errorAlert = document.getElementById("signInErrorAlert");
  const submitBtn = document.getElementById("btnSignInSubmit");

  if (!idVal || !pwdVal) {
    if (errorAlert) {
      errorAlert.textContent = "Please enter your mobile phone/email and password.";
      errorAlert.style.display = "block";
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Verifying Credentials...";
  }

  try {
    let matchedPatient = null;

    // 1. Try Supabase PostgreSQL patients table
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from("patients")
          .select("*")
          .or(`phone.eq.${idVal},email.eq.${idVal}`)
          .eq("password_hash", pwdVal)
          .maybeSingle();

        if (!error && data) {
          matchedPatient = data;
        }
      } catch (err) {
        console.warn("Supabase auth query error:", err);
      }
    }

    // 2. Check local registered patients directory
    if (!matchedPatient) {
      const localList = getEnrolledPatients();
      matchedPatient = localList.find(p => (p.phone === idVal || p.email.toLowerCase() === idVal.toLowerCase()) && (p.password_hash === pwdVal || !p.password_hash));
    }

    if (!matchedPatient) {
      if (errorAlert) {
        errorAlert.textContent = "Invalid mobile number/email or password. If you are new, please enroll using the Sign Up tab.";
        errorAlert.style.display = "block";
      }
      return;
    }

    // Success! Save session
    setLoggedPatient(matchedPatient);
    checkPatientSession();
    closeAuthModal();

    alert(`Welcome back, ${matchedPatient.full_name}! Your details have been auto-filled in the booking form.`);
    scrollToAppointmentForm();
  } catch (err) {
    console.error("CarePlus: Error in sign-in:", err);
    if (errorAlert) {
      errorAlert.textContent = "Sign-in error: " + err.message;
      errorAlert.style.display = "block";
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In as Patient";
    }
  }
}

async function handlePatientSignUp(event) {
  event.preventDefault();
  const fullName = document.getElementById("regFullName").value.trim();
  const age = parseInt(document.getElementById("regAge").value, 10);
  const gender = document.getElementById("regGender").value;
  const phone = document.getElementById("regPhone").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const errorAlert = document.getElementById("signUpErrorAlert");
  const submitBtn = document.getElementById("btnSignUpSubmit");

  const phonePattern = /^[0-9]{10}$/;
  if (!phonePattern.test(phone)) {
    if (errorAlert) {
      errorAlert.textContent = "Please enter a valid 10-digit mobile number.";
      errorAlert.style.display = "block";
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Enrolling in Database...";
  }

  const patientRecord = {
    full_name: fullName,
    age: age,
    gender: gender,
    phone: phone,
    email: email,
    password_hash: password,
    created_at: new Date().toISOString()
  };

  try {
    // 1. Save to Supabase PostgreSQL patients table
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("patients")
        .insert([patientRecord])
        .select();

      if (error) {
        console.warn("Could not insert to Supabase patients table:", error);
      }

      // Notify Admin
      try {
        await supabaseClient.from("admin_notifications").insert([{
          notification_type: "patient_enrolled",
          title: "New Patient Registered",
          message: `New patient enrolled: ${fullName} (${phone}, ${email}).`,
          appointment_ref: null,
          is_read: false
        }]);
      } catch (e) {}
    }

    // 2. Save locally
    recordPatientDirectoryEntry(patientRecord);
    addLocalAdminNotification({
      id: "notif_" + Date.now(),
      type: "patient_enrolled",
      title: "New Patient Enrolled",
      message: `Patient ${fullName} (${phone}) enrolled in CarePlus Hospital.`,
      ref: "PATIENT",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_read: false
    });

    // Save session & update UI
    setLoggedPatient(patientRecord);
    checkPatientSession();
    closeAuthModal();

    alert(`Congratulations, ${fullName}! Your patient account has been created and saved to the database. Your booking form is now auto-filled.`);
    scrollToAppointmentForm();
  } catch (err) {
    console.error("CarePlus: Error in sign-up:", err);
    if (errorAlert) {
      errorAlert.textContent = "Enrollment error: " + err.message;
      errorAlert.style.display = "block";
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Complete Patient Enrollment";
    }
  }
}

function handlePatientSignOut() {
  if (confirm("Are you sure you want to sign out from your patient account?")) {
    setLoggedPatient(null);
    checkPatientSession();
    closeAuthModal();
    if (appointmentForm) {
      appointmentForm.reset();
      updateDoctors("");
    }
    alert("You have signed out successfully.");
  }
}

// ----------------------------------------------------------------------------
// 14. REAL-TIME PATIENT NOTIFICATIONS (FROM ADMIN APPROVALS / DECLINES)
// ----------------------------------------------------------------------------
async function checkPatientNotifications() {
  if (!patientNotificationAlert) return;

  const currentPatient = getLoggedPatient();
  const recents = getRecentAppointments();
  let notifications = getLocalPatientNotifications();

  // If Supabase is connected, check for real-time notifications in PostgreSQL
  if (supabaseClient) {
    try {
      const userPhone = currentPatient ? currentPatient.phone : null;
      const recentRefs = recents.map(r => r.ref);

      let query = supabaseClient.from("patient_notifications").select("*").eq("is_read", false);
      if (userPhone) {
        query = query.eq("patient_phone", userPhone);
      } else if (recentRefs.length > 0) {
        query = query.in("appointment_ref", recentRefs);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        data.forEach(remoteNotif => {
          if (!notifications.some(n => n.id === remoteNotif.id)) {
            notifications.unshift({
              id: remoteNotif.id,
              ref: remoteNotif.appointment_ref,
              message: remoteNotif.message,
              status: remoteNotif.status || "Confirmed",
              time: new Date(remoteNotif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              is_read: false
            });
          }
        });
      }
    } catch (e) {
      console.warn("Could not fetch remote patient notifications:", e);
    }
  }

  // Filter unread notifications
  const unread = notifications.filter(n => !n.is_read);

  if (unread.length > 0) {
    const latest = unread[0];
    const isDeclined = latest.status === "Cancelled" || latest.status === "Declined" || latest.status === "Rejected";

    patientNotificationAlert.className = `patient-alert-container ${isDeclined ? "alert-declined" : ""}`;
    patientNotificationAlert.innerHTML = `
      <div class="patient-alert-header">
        <div class="patient-alert-title">
          <span>${isDeclined ? "❌" : "🔔"}</span>
          <span>Hospital Administration Update: Appointment <code>${escapeHtml(latest.ref || "")}</code></span>
        </div>
        <button type="button" class="patient-alert-dismiss" onclick="dismissPatientNotification('${latest.id}')" title="Dismiss notification">&times;</button>
      </div>
      <p class="patient-alert-text">${escapeHtml(latest.message)}</p>
    `;
    patientNotificationAlert.style.display = "block";
  } else {
    patientNotificationAlert.style.display = "none";
  }
}

function dismissPatientNotification(notifId) {
  let list = getLocalPatientNotifications();
  list = list.map(n => (n.id == notifId ? { ...n, is_read: true } : n));
  try {
    localStorage.setItem(STORAGE_PATIENT_NOTIFS_KEY, JSON.stringify(list));
  } catch (e) {}

  if (patientNotificationAlert) {
    patientNotificationAlert.style.display = "none";
  }
}

// ----------------------------------------------------------------------------
// 15. LOCAL STORAGE REPOSITORY & SYNCHRONIZATION HELPERS
// ----------------------------------------------------------------------------
function getEnrolledPatients() {
  try {
    const raw = localStorage.getItem(STORAGE_PATIENTS_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function recordPatientDirectoryEntry(patient) {
  const list = getEnrolledPatients();
  const existingIdx = list.findIndex(p => p.phone === patient.phone || p.email === patient.email);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...patient };
  } else {
    list.unshift(patient);
  }
  try {
    localStorage.setItem(STORAGE_PATIENTS_LIST_KEY, JSON.stringify(list));
  } catch (e) {}
}

function addLocalAdminNotification(notif) {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_NOTIFS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(notif);
    localStorage.setItem(STORAGE_ADMIN_NOTIFS_KEY, JSON.stringify(list.slice(0, 30)));
  } catch (e) {}
}

function getLocalPatientNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_PATIENT_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalChangeRequest(req) {
  try {
    const raw = localStorage.getItem(STORAGE_CHANGE_REQS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(req);
    localStorage.setItem(STORAGE_CHANGE_REQS_KEY, JSON.stringify(list));
  } catch (e) {}
}