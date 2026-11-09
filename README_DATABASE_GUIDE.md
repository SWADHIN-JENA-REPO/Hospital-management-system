# CarePlus Hospital Management System — DBMS Project Manual

**Subject:** Database Management Systems (DBMS) Laboratory / Course Project  
**Author:** CarePlus Hospital Project Team  
**Database Technology:** PostgreSQL 15+ (Hosted on Supabase Cloud) & Browser Local Repository Fallback  
**Frontend Stack:** HTML5, Modern CSS3, JavaScript (ES6+), Supabase Client Library  

---

## 📌 1. Project Overview & Features

CarePlus Hospital is a comprehensive healthcare appointment and patient management system designed to satisfy the core concepts of relational database management systems:
1. **Patient Enrollment & Sign-In (Authentication):**
   - New patients can enroll with their Name, Age, Gender, Phone, Email, and Password.
   - Returning patients can sign in using their phone/email and password.
   - Once signed in, patient details are automatically auto-filled in the consultation booking form.
   - Patients can sign out at any time.

2. **Appointment Consultation Booking:**
   - Supports 10 specialized hospital departments and 10 expert doctors.
   - **Reason for Visit is OPTIONAL:** Patients are free to leave the reason blank or describe symptoms; the system gracefully handles it without validation errors.
   - Generates a unique tracking reference code (e.g., `CP-12345`).

3. **Hospital Administrator Portal (Admin Control Desk):**
   - Restricted access dedicated to the hospital administrator only.
   - **Admin Password:** `ADMIN@123` (Username/Email: `admin@careplus.com` or `admin`).
   - Admin can view all appointments, approve pending bookings, decline/cancel bookings, or mark them completed.
   - Admin can view all enrolled patients in the database directory.

4. **Two-Way Real-Time Notifications:**
   - **Patient &rarr; Admin Notification:** Whenever a patient books an appointment or requests a reschedule/cancellation, a real-time notification alert pops up on the Admin Desk!
   - **Admin &rarr; Patient Notification:** When the admin approves or declines an appointment or change request, the patient sees a notification banner in their portal and dashboard indicating: *"Admin has APPROVED your appointment CP-12345!"*

5. **Relational Database Design (3NF):**
   - Entities: `departments`, `doctors`, `patients`, `appointments`, `appointment_change_requests`, `admin_notifications`, `patient_notifications`.
   - Uses Primary Keys (`SERIAL`/`BIGSERIAL`), Foreign Keys (`REFERENCES`), Unique constraints, Check constraints, and Stored Procedures (`plpgsql`).

---

## 🚀 2. Step-by-Step Supabase Connection Guide

Connecting your project to a real cloud PostgreSQL database takes less than 3 minutes. Follow these simple steps:

### Step 2.1: Create a Free Supabase Account
1. Open your browser and go to [https://supabase.com](https://supabase.com).
2. Click **"Start your project"** and sign in using your GitHub or Google account.
3. Click **"New Project"**.
4. Choose an organization, enter a project name (e.g. `careplus-hospital`), enter a secure database password, and select the region nearest to you (e.g. `South Asia (Mumbai)`).
5. Click **"Create new project"** and wait about 1-2 minutes for Supabase to provision your PostgreSQL database.

---

### Step 2.2: Run the Database Schema (Tables & Procedures)
1. In your Supabase project dashboard, look at the left sidebar and click on **SQL Editor** (icon looking like `>_` or SQL terminal).
2. Click **"New Query"** (or the **"+"** button).
3. Open the file `schema.sql` from your project folder:
   - Path: `C:\Users\guddy\OneDrive\Desktop\DBMS\schema.sql`
4. Copy all the contents of `schema.sql` and paste them into the Supabase SQL Editor.
5. Click the green **"Run"** button (or press `Ctrl + Enter`).
6. You will see: **`Success. No rows returned`**.
7. Now click on **Table Editor** on the left sidebar. You will see all 7 tables created with initial seed data:
   - `departments` (10 rows)
   - `doctors` (10 rows)
   - `patients`
   - `appointments`
   - `appointment_change_requests`
   - `admin_notifications`
   - `patient_notifications`

---

### Step 2.3: Link Credentials to `config.js`
1. In your Supabase dashboard, click on **Project Settings** (gear icon ⚙️ at bottom left).
2. Click on the **API** tab under Configuration.
3. Locate two values:
   - **Project URL:** e.g., `https://abcdefghijklmnopqrst.supabase.co`
   - **Project API Keys &rarr; `anon` / `public`:** e.g., `eyJhbGciOi...`
4. Open `config.js` in your code editor:
   - Path: `C:\Users\guddy\OneDrive\Desktop\DBMS\config.js`
5. Replace the placeholder values with your real URL and anon key:
   ```javascript
   const CAREPLUS_CONFIG = {
     SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co", // Your Supabase URL
     SUPABASE_ANON_KEY: "eyJhbGciOi...",                     // Your Supabase Anon Key
     ADMIN_USER: {
       username: "admin",
       email: "admin@careplus.com",
       password: "ADMIN@123", // Admin Password
       role: "Administrator"
     }
   };
   ```
6. Save the file. That's it! Your front-end is now connected to PostgreSQL in the cloud!
   *(Note: Even before connecting Supabase, the project runs in offline local repository mode so you can test immediately without any errors.)*

---

## 💻 3. How to Run & Test the Application

### Option A: Using VS Code Live Server
1. Open the folder `C:\Users\guddy\OneDrive\Desktop\DBMS` in VS Code.
2. Right-click on `index.html` and select **"Open with Live Server"** (or press `Alt + L, Alt + O`).
3. The patient portal opens at `http://127.0.0.1:5501/index.html`.

### Option B: Opening directly in Browser
- Simply double-click `index.html` or `admin.html` to open directly in Google Chrome or Microsoft Edge.

---

## 🧪 4. Complete Testing Walkthrough

### Test Flow 1: Patient Enrollment & Optional Visit Reason
1. Open `index.html`.
2. Notice the top banner: `DBMS Status: PostgreSQL Connected` (or `DBMS Preview Mode` if testing locally).
3. Click on **"👤 Patient Sign In"** in the top navigation bar.
4. Click on the **"Patient Enrollment (Sign Up)"** tab.
5. Fill in:
   - Full Name: `Amit Kumar`
   - Age: `29`, Gender: `Male`
   - Phone: `9876501234`
   - Email: `amit@example.com`
   - Password: `patient123`
6. Click **"Complete Patient Enrollment"**.
7. Notice that:
   - The top navigation button updates to: `👤 Amit Kumar (Portal)`.
   - The appointment form fields (Name, Age, Gender, Phone, Email) are **auto-filled**!
8. Select Department: `Cardiology`. The doctor automatically populates: `Dr. Rajesh Mishra`.
9. Select Date & Time.
10. **Leave "Reason for Visit" completely BLANK!** Notice that:
    - The label clearly says `Reason for Visit (Optional)`.
    - No red error appears!
11. Click **"Submit Appointment"**.
12. Your appointment is confirmed with a reference code (e.g. `CP-45892`) and added to the dashboard table.

---

### Test Flow 2: Admin Login & Appointment Approval
1. Open `admin.html` in another browser tab (or click the **"🔒 Admin Portal"** link in the navigation).
2. Enter the Admin credentials:
   - Username/Email: `admin@careplus.com` (or `admin`)
   - Password: `ADMIN@123`
3. Click **"🔓 Sign In to Admin Desk"**.
4. Inside the Admin Dashboard:
   - Notice the **🔔 Incoming Patient Notifications** alert bar:
     *"Patient Amit Kumar (9876501234) booked Cardiology with Dr. Rajesh Mishra."*
   - In the **📋 All Appointments** table, find the appointment with status `Pending`.
   - Click the green **"✅ Approve"** button.
   - The status updates immediately to `CONFIRMED` in the database!
   - In the **👥 Registered Patients** tab, notice `Amit Kumar` is listed with his contact info and registration timestamp.

---

### Test Flow 3: Patient Sees Admin Approval Notification
1. Switch back to the patient page tab (`index.html`).
2. Refresh or scroll to the **Appointment Dashboard**:
3. Notice the **green notification banner**:
   > 🔔 **Hospital Administration Update:** Admin has APPROVED your appointment `CP-45892`!
4. Notice the status badge in the Recent Bookings table now displays **`CONFIRMED`** in medical blue!

---

### Test Flow 4: Patient Reschedule / Cancellation Request
1. On `index.html`, in the **Track Your Appointment** card:
   - Enter Reference: `CP-45892`
   - Enter Phone: `9876501234`
   - Click **"Track Status"**.
2. Click **"📅 Request Reschedule / Change"**.
3. Choose:
   - Action: `Reschedule to a new Date / Time`
   - Requested New Date & Time slot.
   - Reason: `Work meeting clash, kindly move to morning slot.`
4. Click **"Submit Request"**.
5. Switch to `admin.html`:
   - An alert appears in the Admin Notifications bar!
   - Click the **"📝 Change & Cancel Requests"** tab.
   - Click **"✅ Approve"**.
   - Switch back to `index.html`: the patient receives the updated schedule notification immediately!

---

## 🎓 5. DBMS Viva & University Presentation Points

When demonstrating this project to your professor or examiner, explain these database concepts:

| Concept | Implementation in this Project |
| :--- | :--- |
| **Relational Schema (3NF)** | Entities separated into `departments`, `doctors`, `patients`, `appointments`, and `appointment_change_requests` to eliminate data redundancy and insertion/deletion anomalies. |
| **Primary Keys (PK)** | `department_id`, `doctor_id`, `patient_id`, `appointment_id`, and `request_id` uniquely identify each row. |
| **Foreign Keys (FK)** | `doctors.department_id` references `departments(department_id)` (`ON DELETE RESTRICT`). `appointments.doctor_id` references `doctors(doctor_id)`. |
| **Candidate / Unique Keys** | `appointment_ref` (`CP-XXXXX`), `patients.phone`, and `patients.email` enforce strict uniqueness. |
| **Domain & Check Constraints** | `age CHECK (age > 0 AND age <= 120)`, `gender CHECK (gender IN ('Male', 'Female', 'Other'))`, and `status CHECK (...)`. |
| **Stored Procedures (PL/pgSQL)** | `lookup_patient_appointment` and `submit_patient_change_request` run server-side SQL logic safely with parameterized queries. |
| **Authentication & Access Control** | Distinct roles: Enrolled Patients vs. Sole Hospital Administrator (`ADMIN@123`). Only authenticated admins can mutate status records. |

---

## 📁 6. Project Files Summary

- **`index.html`**: Hospital front-end, departments, doctors, booking form (optional visit reason), tracking portal, and patient auth modal.
- **`script.js`**: Client-side logic for patient sign-in/enrollment, appointment validation, real-time status synchronization, and notification listening.
- **`admin.html`**: Hospital administration control desk for appointment approvals, change decisions, and patient directory.
- **`admin.js`**: Admin authentication (`ADMIN@123`), database updates, and notification dispatching.
- **`config.js`**: Supabase PostgreSQL URL, API anon key, and admin credentials.
- **`schema.sql`**: PostgreSQL schema script containing tables, constraints, foreign keys, stored procedures, and seed data.
- **`style.css`**: Responsive design, medical theme styling, modals, badges, and notification alerts.
