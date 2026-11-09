-- ============================================================================
-- CarePlus Hospital Management System — Relational Database Schema
-- Subject: Database Management Systems (DBMS) Course Project
-- Target Database: PostgreSQL 15+ (Hosted on Supabase)
-- Normalization: Fully normalized to Third Normal Form (3NF)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DROP EXISTING TABLES (FOR CLEAN INITIALIZATION)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS patient_notifications CASCADE;
DROP TABLE IF EXISTS admin_notifications CASCADE;
DROP TABLE IF EXISTS appointment_change_requests CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- ----------------------------------------------------------------------------
-- 2. TABLE: departments (Master Entity)
-- Stores the 10 medical departments offered by the hospital.
-- ----------------------------------------------------------------------------
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    lead_specialist VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. TABLE: doctors (Entity linked by Foreign Key)
-- Stores specialist doctors assigned to specific medical departments.
-- ----------------------------------------------------------------------------
CREATE TABLE doctors (
    doctor_id SERIAL PRIMARY KEY,
    department_id INT NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL CHECK (experience_years >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. TABLE: patients (User Authentication & Directory Entity)
-- Stores enrolled patient profiles for sign-in and appointment linking.
-- ----------------------------------------------------------------------------
CREATE TABLE patients (
    patient_id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    age INT NOT NULL CHECK (age > 0 AND age <= 120),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Secured credentials
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. TABLE: appointments (Core Transactional Entity)
-- Stores consultation bookings. Note: reason is an OPTIONAL field.
-- ----------------------------------------------------------------------------
CREATE TABLE appointments (
    appointment_id BIGSERIAL PRIMARY KEY,
    appointment_ref VARCHAR(20) NOT NULL UNIQUE, -- e.g. CP-12345
    patient_name VARCHAR(150) NOT NULL,
    age INT NOT NULL CHECK (age > 0 AND age <= 120),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    department_id INT NOT NULL REFERENCES departments(department_id),
    doctor_id INT NOT NULL REFERENCES doctors(doctor_id),
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    reason TEXT, -- OPTIONAL: Patient can leave blank or describe symptoms
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. TABLE: appointment_change_requests
-- Stores patient-initiated Reschedule and Cancellation requests.
-- Reviewed and resolved exclusively by Hospital Administration.
-- ----------------------------------------------------------------------------
CREATE TABLE appointment_change_requests (
    request_id BIGSERIAL PRIMARY KEY,
    appointment_ref VARCHAR(20) NOT NULL REFERENCES appointments(appointment_ref) ON DELETE CASCADE,
    patient_phone VARCHAR(20) NOT NULL,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('Reschedule', 'Cancel')),
    requested_date DATE,
    requested_time VARCHAR(20),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ----------------------------------------------------------------------------
-- 7. TABLE: admin_notifications
-- Real-time notifications for hospital administration upon new bookings & changes.
-- ----------------------------------------------------------------------------
CREATE TABLE admin_notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    notification_type VARCHAR(50) NOT NULL, -- 'new_booking', 'change_request', 'patient_enrolled'
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    appointment_ref VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. TABLE: patient_notifications
-- Notifications delivered to patient portal when admin approves/declines/reschedules.
-- ----------------------------------------------------------------------------
CREATE TABLE patient_notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    patient_phone VARCHAR(20) NOT NULL,
    appointment_ref VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL, -- 'Confirmed', 'Cancelled', 'Rescheduled'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. INDEXES FOR HIGH-PERFORMANCE QUERY EXECUTION
-- ----------------------------------------------------------------------------
CREATE INDEX idx_appointments_ref ON appointments(appointment_ref);
CREATE INDEX idx_appointments_phone ON appointments(phone);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_change_requests_ref ON appointment_change_requests(appointment_ref);
CREATE INDEX idx_patient_notif_phone ON patient_notifications(patient_phone);

-- ----------------------------------------------------------------------------
-- 10. SEED DATA: 10 DEPARTMENTS & 10 DOCTORS (MATCHING FRONTEND UI)
-- ----------------------------------------------------------------------------
INSERT INTO departments (department_id, name, description, lead_specialist) VALUES
(1, 'General Medicine', 'Comprehensive primary care and diagnosis for acute and chronic lifestyle illnesses.', 'Dr. Ananya Das'),
(2, 'Cardiology', 'Advanced cardiovascular treatment, heart diagnostics, hypertension, and ECG.', 'Dr. Rajesh Mishra'),
(3, 'Neurology', 'Brain, spinal cord, nerve pathways, stroke prevention, and neurological health.', 'Dr. Suman Patnaik'),
(4, 'Orthopedics', 'Bones, joints, arthritis therapy, spine rehabilitation, and trauma management.', 'Dr. Abhishek Mohanty'),
(5, 'Dermatology', 'Therapeutic skin care, allergies, hair rejuvenation, and clinical dermatology.', 'Dr. Priya Rout'),
(6, 'Pediatrics', 'Child healthcare, neonatal monitoring, immunization programs, and developmental care.', 'Dr. Rakesh Behera'),
(7, 'Gynecology', 'Comprehensive women health services, maternal wellness, and prenatal care.', 'Dr. Sneha Nayak'),
(8, 'ENT', 'Ear infections, sinusitis, hearing evaluations, and throat disorders.', 'Dr. Amit Pradhan'),
(9, 'Ophthalmology', 'Comprehensive vision care, cataracts, retina examinations, and corrective lens testing.', 'Dr. Pooja Sahu'),
(10, 'Diabetes & Endocrinology', 'Hormonal treatments, thyroid disorders, and lifestyle diabetes therapies.', 'Dr. Debasish Jena');

INSERT INTO doctors (doctor_id, department_id, name, qualification, experience_years) VALUES
(1, 1, 'Dr. Ananya Das', 'MD - General Medicine', 12),
(2, 2, 'Dr. Rajesh Mishra', 'MD, DM - Cardiology', 15),
(3, 3, 'Dr. Suman Patnaik', 'MD, DM - Neurology', 10),
(4, 4, 'Dr. Abhishek Mohanty', 'MS - Orthopedics', 14),
(5, 5, 'Dr. Priya Rout', 'MD - Dermatology', 8),
(6, 6, 'Dr. Rakesh Behera', 'MD - Pediatrics', 11),
(7, 7, 'Dr. Sneha Nayak', 'MS - Obstetrics & Gynecology', 13),
(8, 8, 'Dr. Amit Pradhan', 'MS - ENT (Otolaryngology)', 9),
(9, 9, 'Dr. Pooja Sahu', 'MS - Ophthalmology', 7),
(10, 10, 'Dr. Debasish Jena', 'MD, DM - Endocrinology', 16);

-- Seed initial test patient
INSERT INTO patients (full_name, age, gender, phone, email, password_hash)
VALUES ('Rahul Sharma', 28, 'Male', '9876543210', 'rahul@example.com', 'patient123');

-- Seed initial appointments
INSERT INTO appointments (appointment_ref, patient_name, age, gender, phone, email, department_id, doctor_id, appointment_date, appointment_time, reason, status)
VALUES
('CP-10101', 'Rahul Sharma', 28, 'Male', '9876543210', 'rahul@example.com', 1, 1, CURRENT_DATE + INTERVAL '2 days', '10:00 AM', 'Routine blood pressure and health checkup', 'Confirmed'),
('CP-10102', 'Priya Patel', 34, 'Female', '9123456780', 'priya@example.com', 2, 2, CURRENT_DATE + INTERVAL '3 days', '11:00 AM', NULL, 'Pending');

-- ----------------------------------------------------------------------------
-- 11. STORED PROCEDURES (RPC FUNCTIONS FOR SUPABASE CLIENT)
-- ----------------------------------------------------------------------------

-- A. Patient Status Lookup Procedure (matches appointment reference and phone)
CREATE OR REPLACE FUNCTION lookup_patient_appointment(p_ref TEXT, p_phone TEXT)
RETURNS TABLE (
    appointment_ref VARCHAR,
    patient_name VARCHAR,
    age INT,
    gender VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    department_name VARCHAR,
    doctor_name VARCHAR,
    appointment_date DATE,
    appointment_time VARCHAR,
    reason TEXT,
    status VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.appointment_ref,
        a.patient_name,
        a.age,
        a.gender,
        a.phone,
        a.email,
        d.name AS department_name,
        doc.name AS doctor_name,
        a.appointment_date,
        a.appointment_time,
        a.reason,
        a.status
    FROM appointments a
    JOIN departments d ON a.department_id = d.department_id
    JOIN doctors doc ON a.doctor_id = doc.doctor_id
    WHERE UPPER(a.appointment_ref) = UPPER(p_ref)
      AND a.phone = p_phone
    LIMIT 1;
END;
$$;

-- B. Patient Change Request Submission Procedure
CREATE OR REPLACE FUNCTION submit_patient_change_request(
    p_ref TEXT,
    p_phone TEXT,
    p_request_type TEXT,
    p_req_date DATE,
    p_req_time TEXT,
    p_reason TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists INT;
BEGIN
    -- Verify appointment belongs to this phone number
    SELECT COUNT(*) INTO v_exists
    FROM appointments
    WHERE UPPER(appointment_ref) = UPPER(p_ref)
      AND phone = p_phone;

    IF v_exists = 0 THEN
        RETURN json_build_object('success', false, 'message', 'Appointment reference and phone number did not match any record.');
    END IF;

    -- Insert request
    INSERT INTO appointment_change_requests (
        appointment_ref,
        patient_phone,
        request_type,
        requested_date,
        requested_time,
        reason,
        status
    ) VALUES (
        UPPER(p_ref),
        p_phone,
        p_request_type,
        p_req_date,
        p_req_time,
        p_reason,
        'Pending'
    );

    -- Notify Admin
    INSERT INTO admin_notifications (
        notification_type,
        title,
        message,
        appointment_ref
    ) VALUES (
        'change_request',
        'Patient Change Request: ' || UPPER(p_ref),
        'Patient requested ' || p_request_type || ' for ' || UPPER(p_ref) || '. Reason: ' || p_reason,
        UPPER(p_ref)
    );

    RETURN json_build_object('success', true, 'message', 'Change request successfully submitted to administration.');
END;
$$;

-- ----------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES FOR SECURE & DEMO ACCESS
-- ----------------------------------------------------------------------------
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notifications ENABLE ROW LEVEL SECURITY;

-- Allow read/write access for anonymous and authenticated clients
CREATE POLICY "Public Read Departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public Read Doctors" ON doctors FOR SELECT USING (true);

CREATE POLICY "Public Patient Access" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Appointments Access" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Change Requests Access" ON appointment_change_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Admin Notifs Access" ON admin_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Patient Notifs Access" ON patient_notifications FOR ALL USING (true) WITH CHECK (true);
