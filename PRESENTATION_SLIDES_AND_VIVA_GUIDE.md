# CarePlus Hospital Management System — 12-Slide DBMS Presentation & Viva Guide

**Course:** B.Tech Computer Science & Engineering — Database Management Systems (DBMS) Lab / Project  
**Team Size:** 3 Members (4 Slides Each)  
**Database:** PostgreSQL 15+ (Hosted on Supabase Cloud)  
**Live GitHub Repo:** `https://github.com/SWADHIN-JENA-REPO/Hospital-management-system`  

---

## 👥 Presentation Distribution (4 Slides Per Member)

- **Member 1 (Slides 1 – 4):** Project Introduction, Motivation, Problem Statement & Objectives.
- **Member 2 (Slides 5 – 8):** System Architecture, Frontend Features, Booking Flow & Admin Control Desk.
- **Member 3 (Slides 9 – 12):** Relational Schema, Entity-Relationship (ER) Diagram, SQL Queries & Stored Procedures, Viva Defense & Conclusion.

---

# 📑 Slide-by-Slide Detailed Blueprint

---

### SLIDE 1: Title & Project Overview
- **Header / Slide Title:** CarePlus Hospital Management System
- **Subtitle:** A Web-Based Healthcare Consultation & Relational Database Management System (PostgreSQL on Supabase)
- **Presented By (Team Members):**
  1. *[Member 1 Name]* — Reg. No. / Roll No. (Intro & Scope)
  2. *[Member 2 Name]* — Reg. No. / Roll No. (System Flow & UI)
  3. *[Member 3 Name - You]* — Reg. No. / Roll No. (DBMS Architecture & ER Modeling)
- **Guided By:** *[Professor / Guide Name]*, Department of Computer Science & Engineering, *[College / University Name]*
- **Academic Session:** 2026 – 2027
- **🖼️ Image / Visual Suggestion:**
  - Place hospital logo or a composite screenshot of the website homepage in the right half of the slide.
- **🗣️ Speaker Notes (Member 1):**
  > "Respected Professor and dear classmates, a very pleasant morning/afternoon. Today, our team is presenting our DBMS laboratory project titled 'CarePlus Hospital Management System'. Healthcare accessibility requires modern digital record-keeping and strong relational integrity. In this project, we built a full-stack responsive web application powered by a live PostgreSQL relational database hosted on Supabase cloud. I will be introducing our project motivation and objectives, followed by my teammate who will explain the system features, and our third member will detail our database schema, ER diagrams, constraints, and live queries."

---

### SLIDE 2: Table of Contents / Presentation Agenda
- **Header / Slide Title:** Presentation Agenda
- **Content Points:**
  1. Introduction & Background
  2. Problem Statement & Proposed System
  3. System Architecture & Tech Stack
  4. Patient Portal & Consultation Booking Workflow
  5. Hospital Administrator Desk & Live Operations
  6. Database Architecture & Relational Schema (3NF)
  7. Entity-Relationship (ER) Diagram & Cardinality
  8. Relational Keys, Constraints & Normalization
  9. SQL Implementation: DDL, DML & Stored Procedures
  10. Real-Time Two-Way Notifications & Security
  11. Project Highlights, Testing & Demonstration
  12. Conclusion & References
- **🖼️ Image / Visual Suggestion:**
  - A clean 3-column roadmap icon graphic representing (1) Needs, (2) Solution, (3) DBMS Engine.
- **🗣️ Speaker Notes (Member 1):**
  > "Our 12 slides cover our journey from identifying real-world clinical consultation bottlenecks to designing a third-normal-form relational database. We will emphasize the ER modeling, foreign key cascades, and real-time stored procedures that make this a robust database project."

---

### SLIDE 3: Problem Statement & Motivation
- **Header / Slide Title:** Problem Statement & Motivation
- **The Challenge in Traditional Clinics:**
  - **Manual Paper & Excel Records:** Leads to duplicate patient entries, data inconsistency, and lost consultation histories.
  - **Unorganized Doctor Schedules:** Overbooking, scheduling clashes, and lack of real-time visibility.
  - **Lack of Patient Tracking:** Patients have no transparent mechanism to check consultation status or request reschedules.
- **Our Motivation:**
  - To eliminate insertion and deletion anomalies using an ACID-compliant Relational Database Management System (RDBMS).
  - To provide role-based access separating patient registration from privileged hospital administrative actions.
- **🖼️ Image / Visual Suggestion:**
  - A comparison split graphic: Left side shows "Manual/Paper Records (Disorganized)", Right side shows "Relational PostgreSQL Cloud Database (Structured & Secure)".
- **🗣️ Speaker Notes (Member 1):**
  > "In many outpatient healthcare centers, appointments are tracked on paper logs or unlinked spreadsheets. This creates serious DBMS anomalies: update anomalies when doctor details change, deletion anomalies when patient visits are cancelled, and a complete absence of data integrity. Our motivation was to design a clean relational database where doctors, departments, patients, appointments, and change requests are governed by strict primary-foreign key relationships."

---

### SLIDE 4: Project Objectives & Scope
- **Header / Slide Title:** Project Objectives & Scope
- **Core Objectives:**
  - **Relational Integrity:** Implement a 3NF normalized schema across 7 dedicated entities in PostgreSQL.
  - **Flexible Booking Flow:** Provide 10 clinical specialties with dynamic doctor assignment; consultation reason is made **optional** to avoid rigid input friction.
  - **Role-Based Authentication:** Distinct credentials for patient enrollment vs. a single secured Hospital Administrator portal (`ADMIN@123`).
  - **Two-Way Notification Synchronization:** Real-time event communication between patient requests and administrative decisions.
  - **High Availability & Fallback:** Cloud-hosted PostgreSQL on Supabase with browser LocalStorage caching for zero-downtime offline presentation.
- **🖼️ Image / Visual Suggestion:**
  - Bullet-point cards with healthcare icons (🏥 Heart, 🔒 Key, 🗄️ Database, ⚡ Real-Time Lightning).
- **🗣️ Speaker Notes (Member 1):**
  > "Our core objective was not just a static webpage, but an interactive, database-driven hospital system. The system enforces domain integrity with check constraints, entity integrity with unique reference codes like CP-12345, and referential integrity using foreign keys. Now, I hand over the presentation to Member 2 to walk you through the system architecture and frontend workflows."

---

### SLIDE 5: System Architecture & Technology Stack
- **Header / Slide Title:** System Architecture & Tech Stack
- **Three-Tier Architecture:**
  - **Presentation Layer (Client):** Responsive HTML5, CSS3 (Medical Blue Theme), Vanilla JavaScript (ES6+).
  - **API & Client Communication:** Supabase JS SDK v2 communicating via PostgREST and WebSockets over secure HTTPS/WSS.
  - **Database Layer (Storage & Engine):** PostgreSQL 15+ hosted on Supabase Cloud, executing SQL DDL, DML, Check Constraints, and PL/pgSQL Stored Procedures.
  - **Deployment Layer:** Continuous deployment via GitHub repository connected to Netlify CDN.
- **🖼️ Image / Visual Suggestion:**
  - A 3-tier architecture flowchart:
    `[Browser Client UI] <---> [Supabase Client / PostgREST API] <---> [PostgreSQL Cloud Database]`
- **🗣️ Speaker Notes (Member 2):**
  > "Thank you, Member 1. As we look at the system architecture, our application follows the classic 3-tier model. On the frontend, pure lightweight HTML5, CSS3, and JavaScript interact directly with the Supabase client. The middle layer translates database actions into REST and RPC calls, and the backend PostgreSQL database ensures ACID compliance. The entire repository is version-controlled on GitHub and deployed on Netlify."

---

### SLIDE 6: Patient Portal & Dynamic Consultation Booking
- **Header / Slide Title:** Patient Portal & Dynamic Booking Flow
- **Key Modules:**
  - **Patient Sign-In & Enrollment:** Patients register with Name, Age, Gender, Phone, Email, and Password. Upon login, personal details auto-fill in booking forms.
  - **Dynamic Department-Doctor Binding:** Selecting 1 of 10 departments (e.g., Cardiology) automatically filters and binds the assigned specialist (e.g., Dr. Rajesh Mishra).
  - **Past-Date Blocking:** Date pickers dynamically disable past dates using `min="YYYY-MM-DD"`.
  - **Optional Reason for Visit:** Symptoms field is optional; empty fields default safely to `'General Consultation'` without validation errors.
  - **Unique Transaction Reference:** Each booking receives an alphanumeric code (`CP-XXXXX`) for tracking.
- **🖼️ Image / Visual Suggestion:**
  - Screenshot of the **Book an Appointment** form showing auto-filled fields and dynamic doctor selection.
- **🗣️ Speaker Notes (Member 2):**
  > "On Slide 6, you see our patient consultation form. Notice the dynamic department-doctor binding: when a patient chooses Cardiology, our JavaScript queries the mapped department ID and binds Dr. Rajesh Mishra. A key feature requested by our users was making the 'Reason for Visit' optional, preventing unnecessary friction. Every successful submission generates a unique reference code, like CP-45892, and saves it into both the PostgreSQL database and the browser's local cache."

---

### SLIDE 7: Real-Time Appointment Tracking & Change Requests
- **Header / Slide Title:** Patient Status Tracking & Change Requests
- **Secure Status Lookup:**
  - Patients enter their **Reference Code** (`CP-XXXXX`) and **Phone Number** to query status.
  - Queries execute via a secure stored procedure `lookup_patient_appointment(p_ref, p_phone)`.
- **Change & Cancellation Request Workflow:**
  - Patients can submit requests to:
    1. **Reschedule:** Choose a new preferred date and time slot.
    2. **Cancel:** Submit an official cancellation reason.
  - Requests are inserted into `appointment_change_requests` with status `Pending`.
- **🖼️ Image / Visual Suggestion:**
  - Screenshot of the **Track Your Appointment Status** result card and the **Request Appointment Change** modal.
- **🗣️ Speaker Notes (Member 2):**
  > "Data privacy is essential in healthcare. In Slide 7, patients cannot randomly view another person's medical appointment. To track status, the patient must provide both their Reference Code and their registered Phone Number. Furthermore, if a patient needs to reschedule or cancel, they submit a formal change request through our modal, which writes directly to our change requests database table for admin review."

---

### SLIDE 8: Hospital Administrator Control Desk
- **Header / Slide Title:** Hospital Administrator Control Desk (`admin.html`)
- **Restricted Administrative Access:**
  - Single authorized administrator with credentials: `admin@careplus.com` | Password: `ADMIN@123`.
- **Administrative Capabilities:**
  - **Metric Counters:** Total Bookings, Pending Approvals, Confirmed Appointments, Enrolled Patients.
  - **Appointment Management:** Review, Approve (turns to `Confirmed`), Decline (turns to `Cancelled`), or Delete records.
  - **Change Requests Resolution:** Approve or Reject patient reschedule and cancellation requests.
  - **Registered Patients Directory:** Real-time directory of all registered patients.
- **🖼️ Image / Visual Suggestion:**
  - Screenshot of the **Admin Portal (`admin.html`)** showing the statistics cards, notifications banner, and appointments table with action buttons.
- **🗣️ Speaker Notes (Member 2):**
  > "Slide 8 showcases our Administrator Control Desk. Protected by dedicated admin credentials (password: ADMIN@123), hospital staff can oversee all operations. Notice the incoming patient notifications bar: whenever a patient books or requests a reschedule, the admin is alerted instantly. When the admin clicks 'Approve', it updates the status in PostgreSQL and triggers a notification back to the patient. Now, I hand over the presentation to Member 3 to explain our database design, ER diagram, keys, and SQL queries."

---

### SLIDE 9: Relational Schema & 3NF Normalization
- **Header / Slide Title:** Relational Database Schema & Normalization (3NF)
- **7 Normalized Tables:**
  1. `departments` — Master list of medical departments.
  2. `doctors` — Specialist details linked to departments.
  3. `patients` — Enrolled user accounts with credentials.
  4. `appointments` — Central consultation records.
  5. `appointment_change_requests` — Reschedule/Cancel requests.
  6. `admin_notifications` — Alerts pushed to hospital administration.
  7. `patient_notifications` — Status updates delivered to patients.
- **Normalization Principles Applied:**
  - **1NF:** All attributes contain atomic values (no repeating groups).
  - **2NF:** No partial dependencies; all non-key attributes fully depend on the primary key.
  - **3NF:** No transitive dependencies (e.g., doctor qualifications depend on `doctor_id`, not on `appointment_id`).
- **🖼️ Image / Visual Suggestion:**
  - A clean relational schema table diagram showing the 7 tables with their column names and data types.
- **🗣️ Speaker Notes (Member 3):**
  > "Thank you, Member 2. Respected Professor, this is the core DBMS layer of our project. To ensure high efficiency and avoid data redundancy, we designed our schema in Third Normal Form (3NF). We separated doctors from departments, and patients from appointments. For instance, storing a doctor's name or department name inside the appointments table would violate 3NF and cause transitive dependencies. Therefore, the appointments table only holds foreign keys referencing department_id and doctor_id."

---

### SLIDE 10: Entity-Relationship (ER) Diagram & Cardinality
- **Header / Slide Title:** Entity-Relationship (ER) Diagram
- **Entities & Attributes:**
  - **DEPARTMENT:** `(department_id [PK], name, description, lead_specialist)`
  - **DOCTOR:** `(doctor_id [PK], name, qualification, experience_years, department_id [FK])`
  - **PATIENT:** `(patient_id [PK], full_name, phone [UK], email [UK], age, gender, password_hash)`
  - **APPOINTMENT:** `(appointment_id [PK], appointment_ref [UK], department_id [FK], doctor_id [FK], appointment_date, appointment_time, reason, status)`
  - **CHANGE_REQUEST:** `(request_id [PK], appointment_ref [FK], request_type, requested_date, requested_time, status)`
- **Relationship Cardinalities:**
  - **DEPARTMENT $\leftrightarrow$ DOCTOR:** `1 : N` (One department has many doctors; each doctor belongs to one department).
  - **DOCTOR $\leftrightarrow$ APPOINTMENT:** `1 : N` (One doctor handles multiple appointments).
  - **DEPARTMENT $\leftrightarrow$ APPOINTMENT:** `1 : N` (One department schedules multiple consultations).
  - **APPOINTMENT $\leftrightarrow$ CHANGE_REQUEST:** `1 : N` (One appointment can have multiple change requests).
- **🖼️ Image / Visual Suggestion:**
  - A clear Mermaid / Crow's Foot ER Diagram (see diagram below in Viva Guide).
- **🗣️ Speaker Notes (Member 3):**
  > "Here is our Entity-Relationship diagram. Our design features five primary business entities and two messaging entities. The relationship between DEPARTMENT and DOCTOR is One-to-Many (1:N), enforced by a foreign key with ON DELETE RESTRICT to avoid orphaned records. The APPOINTMENT entity sits at the center of the schema, maintaining 1:N relations with DOCTORS and DEPARTMENTS. Each appointment can also have 1:N CHANGE_REQUESTS linked by the unique candidate key appointment_ref."

---

### SLIDE 11: Relational Keys, Constraints & SQL Implementation
- **Header / Slide Title:** Keys, Constraints & SQL Queries
- **Keys Implemented:**
  - **Primary Keys (PK):** `department_id`, `doctor_id`, `patient_id`, `appointment_id`, `request_id`.
  - **Foreign Keys (FK):** `doctors.department_id`, `appointments.doctor_id`, `change_requests.appointment_ref`.
  - **Candidate / Unique Keys (UK):** `appointment_ref` (`CP-XXXXX`), `patients.phone`, `patients.email`.
- **Integrity Constraints:**
  - `CHECK (age > 0 AND age <= 120)`
  - `CHECK (gender IN ('Male', 'Female', 'Other'))`
  - `CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed'))`
- **Key SQL Operations & Stored Procedures:**
  - **Join Query:** Inner joins connecting appointments with doctors and departments.
  - **PL/pgSQL Function:** `lookup_patient_appointment(p_ref, p_phone)` — parameterized server-side query preventing SQL injection.
- **🖼️ Image / Visual Suggestion:**
  - Screenshot of **Supabase SQL Editor / Table Editor** showing the active tables and live data.
- **🗣️ Speaker Notes (Member 3):**
  > "On Slide 11, we highlight the database constraints that enforce data integrity. We use domain check constraints for age, gender, and status enum values. To prevent SQL injection and encapsulate business logic, we wrote PL/pgSQL stored procedures like 'lookup_patient_appointment', which securely verifies matching credentials on the server before returning consultation records."

---

### SLIDE 12: Project Highlights, Conclusion & Thank You
- **Header / Slide Title:** Summary, Future Enhancements & Conclusion
- **Key Highlights Achieved:**
  - Fully normalized 3NF database connected to a live web frontend.
  - Real-time two-way status updates and notification banners.
  - Secured role-based authentication (Patients vs. Hospital Admin: `ADMIN@123`).
  - Optional consultation reason field eliminating user submission friction.
  - Deployed on **GitHub** and hosted live on **Netlify**.
- **Future Enhancements:**
  - Integration of an online payment gateway (UPI / Cards) for consultation fee receipts.
  - Automated SMS/WhatsApp notifications via Twilio API.
  - Digital prescription generation and pharmacy inventory linking.
- **Footer Text:** *Thank You! Questions and Feedback are Welcome.*
- **🖼️ Image / Visual Suggestion:**
  - Netlify live deployment badge, GitHub repository QR code, and "Thank You" banner.
- **🗣️ Speaker Notes (Member 3):**
  > "To conclude, our CarePlus Hospital Management System bridges the gap between academic relational database theory and real-world web deployment. We successfully created 7 normalized tables, enforced primary and foreign key constraints, written stored procedures, and integrated real-time cloud database communication via Supabase. We thank our professor for their guidance throughout this project. We are now happy to answer any questions or show a live demonstration."

---

# 📊 Visual ER Diagram (For Slide 10)

```
+--------------------+            +-------------------+
|    DEPARTMENTS     | 1        N |      DOCTORS      |
+--------------------+------------+-------------------+
| PK department_id   |            | PK doctor_id      |
|    name            |            | FK department_id  |
|    description     |            |    name           |
|    lead_specialist |            |    qualification  |
+--------------------+            |    experience_yrs |
         | 1                      +-------------------+
         |                                  | 1
         |                                  |
         |         N                        | N
+-----------------------------------------------------+
|                     APPOINTMENTS                    |
+-----------------------------------------------------+
| PK appointment_id                                   |
| UK appointment_ref (e.g. CP-12345)                  |
| FK department_id                                    |
| FK doctor_id                                        |
|    patient_name                                     |
|    age, gender, phone, email                        |
|    appointment_date, appointment_time               |
|    reason (OPTIONAL)                                |
|    status (Pending, Confirmed, Cancelled, Completed)|
+-----------------------------------------------------+
         | 1                                | 1
         |                                  |
         | N                                | N
+-------------------------+      +-------------------------+
| APPOINTMENT_CHANGE_REQS |      |  PATIENT_NOTIFICATIONS  |
+-------------------------+      +-------------------------+
| PK request_id           |      | PK notification_id      |
| FK appointment_ref      |      | FK appointment_ref      |
|    patient_phone        |      |    patient_phone        |
|    request_type         |      |    message              |
|    requested_date/time  |      |    status               |
|    reason, status       |      |    is_read              |
+-------------------------+      +-------------------------+
```

---

# 🎓 Top 10 Teacher & Viva Questions (With Exact Model Answers)

### Q1: "What database did you use and how does the frontend connect to it?"
**Answer:**  
"We used **PostgreSQL 15+** hosted on the cloud using **Supabase**. The frontend connects using the official `@supabase/supabase-js` client library over secure HTTPS/WSS. When an appointment is submitted in JavaScript, it calls `supabaseClient.from('appointments').insert([newRecord])`, which translates into a PostgREST query on PostgreSQL. If offline, the application seamlessly falls back to browser `localStorage`."

---

### Q2: "What are the Primary Keys and Foreign Keys in your project?"
**Answer:**  
- **Primary Keys:** `departments.department_id`, `doctors.doctor_id`, `patients.patient_id`, `appointments.appointment_id`, and `appointment_change_requests.request_id`.
- **Foreign Keys:**
  - `doctors.department_id` references `departments(department_id)` (`ON DELETE RESTRICT`).
  - `appointments.department_id` references `departments(department_id)`.
  - `appointments.doctor_id` references `doctors(doctor_id)`.
  - `appointment_change_requests.appointment_ref` references `appointments(appointment_ref)` (`ON DELETE CASCADE`).

---

### Q3: "Why is your database in 3rd Normal Form (3NF)?"
**Answer:**  
- **1NF:** Every column has atomic values (e.g., date and time are atomic, no multi-valued arrays).
- **2NF:** It has no partial dependencies because all single-attribute surrogate keys (`BIGSERIAL`) determine all non-key columns.
- **3NF:** It has no transitive dependencies. For example, doctor qualification is stored in `doctors`, not duplicated in `appointments`. If we stored doctor details in `appointments`, changing a doctor's qualification would cause an update anomaly. By storing only `doctor_id`, it is in 3NF.

---

### Q4: "What candidate keys or unique constraints exist?"
**Answer:**  
- In `appointments`: `appointment_ref` (e.g. `CP-12345`) is a unique candidate key.
- In `patients`: `phone` and `email` are unique keys to prevent duplicate patient registration.
- In `departments`: `name` is unique so two departments cannot have identical names.

---

### Q5: "What check constraints did you implement?"
**Answer:**  
- `age CHECK (age > 0 AND age <= 120)`: Rejects impossible ages.
- `gender CHECK (gender IN ('Male', 'Female', 'Other'))`: Restricts input domains.
- `status CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed'))`: Ensures appointments follow valid lifecycle states.

---

### Q6: "How did you handle the 'Reason for Visit' field?"
**Answer:**  
"In our database DDL, the `reason` column in the `appointments` table is defined as `TEXT NULL` without a `NOT NULL` constraint. On the frontend, we removed the required attribute so patients are free to leave it blank. If omitted, the frontend automatically passes `'General Consultation'` as default, ensuring patient flexibility without breaking schema integrity."

---

### Q7: "How is the Admin authenticated?"
**Answer:**  
"We separated patient access from hospital administration. The administrator uses dedicated credentials with password `ADMIN@123`. Only upon successful authentication does the system grant session privileges in `admin.html` to approve or cancel appointments and resolve patient change requests."

---

### Q8: "How do two-way notifications work between Patient and Admin?"
**Answer:**  
"We created two notification tables: `admin_notifications` and `patient_notifications`. When a patient books or requests a change, a trigger/insert adds an alert into `admin_notifications`, visible on the Admin Desk. When the admin accepts or declines, a row is inserted into `patient_notifications` with the patient's phone and appointment reference. When the patient loads the portal, it fetches unread notifications and renders an alert banner."

---

### Q9: "Can you show me a Join Query used in the project?"
**Answer:**  
```sql
SELECT 
    a.appointment_ref, 
    a.patient_name, 
    d.name AS department_name, 
    doc.name AS doctor_name, 
    a.appointment_date, 
    a.appointment_time, 
    a.status
FROM appointments a
JOIN departments d ON a.department_id = d.department_id
JOIN doctors doc ON a.doctor_id = doc.doctor_id
ORDER BY a.created_at DESC;
```

---

### Q10: "What is a Stored Procedure you wrote?"
**Answer:**  
"We wrote `lookup_patient_appointment(p_ref TEXT, p_phone TEXT)` in PL/pgSQL with `SECURITY DEFINER`. It accepts the reference code and phone number, executes an internal join between `appointments`, `departments`, and `doctors`, and returns the patient's record securely without exposing the full database table to public queries."
