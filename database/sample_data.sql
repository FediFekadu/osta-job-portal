-- Create database
CREATE DATABASE IF NOT EXISTS osta_job_portal;
USE osta_job_portal;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('applicant', 'employer', 'admin') NOT NULL,
    status ENUM('active', 'pending', 'inactive') DEFAULT 'active',
    department_id INT,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    skills TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    employment_type ENUM('full_time', 'part_time', 'contract') NOT NULL,
    location VARCHAR(100) NOT NULL,
    salary_range VARCHAR(50),
    deadline DATE NOT NULL,
    status ENUM('pending', 'approved', 'expired') DEFAULT 'pending',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS saved_jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

CREATE TABLE IF NOT EXISTS applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    cover_letter TEXT,
    resume_path VARCHAR(255),
    status ENUM('pending', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_name VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (setting_name)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') NOT NULL,
    target ENUM('all', 'user', 'department', 'job') NOT NULL,
    target_id VARCHAR(50),
    created_by INT NOT NULL,
    status ENUM('unread', 'read') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert sample data

-- Admin user
INSERT INTO users (username, email, password, role, status, full_name, phone, address, skills) VALUES
('admin', 'admin@osta.org.et', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', 'System Administrator', '+251 11 123 4567', 'Addis Ababa, Ethiopia', 'System Administration, Database Management, Security');

-- Departments
INSERT INTO departments (name, description, contact_email, contact_phone, created_by) VALUES
('Research & Development', 'Department focused on scientific research and development projects', 'rd@osta.org.et', '+251 11 123 4568', 1),
('Technology Transfer', 'Department managing technology transfer and commercialization', 'techtransfer@osta.org.et', '+251 11 123 4569', 1),
('Quality Assurance', 'Department ensuring quality standards in research and development', 'qa@osta.org.et', '+251 11 123 4570', 1),
('Human Resources', 'Department managing human resources and recruitment', 'hr@osta.org.et', '+251 11 123 4571', 1);

-- Employer users
INSERT INTO users (username, email, password, role, status, department_id, full_name, phone, address, skills) VALUES
('rd_manager', 'rd.manager@osta.org.et', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employer', 'active', 1, 'Research Manager', '+251 11 123 4568', 'Addis Ababa, Ethiopia', 'Research Management, Project Management, Team Leadership'),
('tech_manager', 'tech.manager@osta.org.et', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employer', 'active', 2, 'Technology Manager', '+251 11 123 4569', 'Addis Ababa, Ethiopia', 'Technology Transfer, Commercialization, IP Management'),
('qa_manager', 'qa.manager@osta.org.et', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employer', 'active', 3, 'QA Manager', '+251 11 123 4570', 'Addis Ababa, Ethiopia', 'Quality Assurance, Standards, Auditing');

-- Applicant users
INSERT INTO users (username, email, password, role, status, full_name, phone, address, skills) VALUES
('applicant1', 'applicant1@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'applicant', 'active', NULL, 'John Doe', '+251 11 123 4572', 'Addis Ababa, Ethiopia', 'Research, Data Analysis, Report Writing'),
('applicant2', 'applicant2@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'applicant', 'active', NULL, 'Jane Smith', '+251 11 123 4573', 'Addis Ababa, Ethiopia', 'Technology Transfer, Business Development, Project Management'),
('applicant3', 'applicant3@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'applicant', 'active', NULL, 'Michael Brown', '+251 11 123 4574', 'Addis Ababa, Ethiopia', 'Quality Assurance, Testing, Documentation');

-- Jobs
INSERT INTO jobs (department_id, title, description, requirements, employment_type, location, salary_range, deadline, status, created_by) VALUES
(1, 'Research Scientist', 'We are seeking a talented Research Scientist to join our R&D team.', 'PhD in relevant field, 5+ years experience, strong research background', 'full_time', 'Addis Ababa', 'ETB 50,000 - 70,000', '2025-08-15', 'approved', 5),
(2, 'Technology Transfer Specialist', 'Looking for a specialist to manage technology commercialization.', 'MSc in Engineering, 3+ years in technology transfer', 'full_time', 'Addis Ababa', 'ETB 40,000 - 60,000', '2025-08-10', 'approved', 6),
(3, 'QA Engineer', 'Quality Assurance Engineer needed for our QA department.', 'BSc in Engineering, 2+ years QA experience', 'full_time', 'Addis Ababa', 'ETB 35,000 - 55,000', '2025-08-20', 'approved', 7),
(1, 'Research Assistant', 'Entry-level position for recent graduates.', 'BSc in relevant field, 1+ year experience', 'part_time', 'Addis Ababa', 'ETB 25,000 - 35,000', '2025-08-30', 'pending', 5);

-- Applications
INSERT INTO applications (user_id, job_id, cover_letter, status) VALUES
(8, 1, 'I am highly interested in the Research Scientist position...', 'pending'),
(8, 2, 'I believe my background in technology transfer...', 'shortlisted'),
(9, 2, 'I am excited about the opportunity to work...', 'pending'),
(10, 3, 'I am confident in my QA skills and...', 'pending');

-- Settings
INSERT INTO settings (setting_name, setting_value) VALUES
('site_title', 'OSTA Job Portal'),
('site_email', 'info@osta.org.et'),
('site_phone', '+251 11 123 4567'),
('site_address', 'Addis Ababa, Ethiopia'),
('smtp_host', 'smtp.gmail.com'),
('smtp_port', '587'),
('smtp_user', 'osta.jobportal@gmail.com'),
('smtp_pass', 'your-smtp-password'),
('smtp_from', 'noreply@osta.org.et'),
('max_resume_size', '5'),
('max_cover_letter_size', '2'),
('allowed_resume_types', 'pdf,doc,docx'),
('allowed_cover_letter_types', 'pdf,docx'),
('notification_email', 'admin@osta.org.et'),
('notification_phone', '+251 11 123 4567'),
('maintenance_mode', '0'),
('allow_self_registration', '1');

-- Notifications
INSERT INTO notifications (title, message, type, target, target_id, created_by, status) VALUES
('New Job Posted', 'A new job has been posted in Research & Development', 'info', 'all', NULL, 1, 'unread'),
('Application Received', 'John Doe has applied for Research Scientist position', 'info', 'department', '1', 1, 'unread'),
('Job Approval Required', 'Research Assistant position needs approval', 'warning', 'user', '5', 1, 'unread');

-- Audit Log
INSERT INTO audit_log (user_id, action, details, created_at) VALUES
(1, 'CREATE_DEPARTMENT', 'Created Research & Development department', NOW()),
(1, 'CREATE_JOB', 'Created Research Scientist position', NOW()),
(8, 'APPLY_JOB', 'Applied for Research Scientist position', NOW()),
(1, 'UPDATE_JOB_STATUS', 'Approved Research Scientist position', NOW());
