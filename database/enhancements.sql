-- Database Enhancements for OSTA Job Portal
-- Run this after the main database setup

USE osta_job_portal;

-- 1. Add missing columns to existing tables

-- Add feedback column to applications table (if not exists)
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS feedback TEXT AFTER status;

-- Add responsibilities column to jobs table (if not exists)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS responsibilities TEXT AFTER requirements;

-- Add internship to employment_type enum (if not exists)
ALTER TABLE jobs 
MODIFY COLUMN employment_type ENUM('full_time', 'part_time', 'contract', 'internship') NOT NULL;

-- 2. Create job_alerts table for applicant job notifications
CREATE TABLE IF NOT EXISTS job_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    keywords VARCHAR(255),
    location VARCHAR(100),
    employment_type ENUM('full_time', 'part_time', 'contract', 'internship'),
    department_id INT,
    salary_min INT,
    salary_max INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 3. Create job_attachments table for job-related documents
CREATE TABLE IF NOT EXISTS job_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT,
    file_type VARCHAR(50),
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 4. Create user_sessions table for better session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(128) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (session_id)
);

-- 5. Create password_resets table for password recovery
CREATE TABLE IF NOT EXISTS password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (email),
    INDEX (token),
    INDEX (expires_at)
);

-- 6. Create application_history table for tracking application status changes
CREATE TABLE IF NOT EXISTS application_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    old_status ENUM('pending', 'shortlisted', 'rejected', 'accepted'),
    new_status ENUM('pending', 'shortlisted', 'rejected', 'accepted') NOT NULL,
    changed_by INT NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- 7. Create job_views table for analytics
CREATE TABLE IF NOT EXISTS job_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. Create email_templates table for customizable email notifications
CREATE TABLE IF NOT EXISTS email_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 9. Create user_preferences table for user customization
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    preference_name VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preference (user_id, preference_name)
);

-- 10. Create system_logs table for better error tracking
CREATE TABLE IF NOT EXISTS system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level ENUM('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL') NOT NULL,
    message TEXT NOT NULL,
    context JSON,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX (level),
    INDEX (created_at)
);

-- Insert default email templates (ignore if already exists)
INSERT IGNORE INTO email_templates (template_name, subject, body_html, body_text, variables, created_by) VALUES
('application_status_update', 'Application Status Update: {{job_title}}', 
'<html><body><h2>OSTA Job Portal</h2><p>Dear {{applicant_name}},</p><p>The status of your application for <strong>{{job_title}}</strong> has been updated to: <strong>{{status}}</strong></p>{{#feedback}}<p><strong>Feedback:</strong> {{feedback}}</p>{{/feedback}}<p>You can view your applications by logging into your account.</p><p>Best regards,<br>OSTA Job Portal Team</p></body></html>',
'Dear {{applicant_name}}, The status of your application for {{job_title}} has been updated to: {{status}}. {{#feedback}}Feedback: {{feedback}}{{/feedback}} You can view your applications by logging into your account. Best regards, OSTA Job Portal Team',
'["applicant_name", "job_title", "status", "feedback"]', 1),

('job_alert_notification', 'New Job Alert: {{job_title}}', 
'<html><body><h2>OSTA Job Portal</h2><p>Dear {{applicant_name}},</p><p>A new job matching your criteria has been posted:</p><h3>{{job_title}}</h3><p><strong>Department:</strong> {{department_name}}</p><p><strong>Location:</strong> {{location}}</p><p><strong>Type:</strong> {{employment_type}}</p><p><strong>Deadline:</strong> {{deadline}}</p><p><a href="{{job_url}}">View Job Details</a></p><p>Best regards,<br>OSTA Job Portal Team</p></body></html>',
'Dear {{applicant_name}}, A new job matching your criteria has been posted: {{job_title}} in {{department_name}}. Location: {{location}}, Type: {{employment_type}}, Deadline: {{deadline}}. View details: {{job_url}}. Best regards, OSTA Job Portal Team',
'["applicant_name", "job_title", "department_name", "location", "employment_type", "deadline", "job_url"]', 1),

('welcome_applicant', 'Welcome to OSTA Job Portal', 
'<html><body><h2>Welcome to OSTA Job Portal</h2><p>Dear {{full_name}},</p><p>Welcome to the OSTA Job Portal! Your account has been successfully created.</p><p>You can now:</p><ul><li>Browse and search for jobs</li><li>Apply to positions</li><li>Save jobs for later</li><li>Set up job alerts</li><li>Track your applications</li></ul><p><a href="{{login_url}}">Login to your account</a></p><p>Best regards,<br>OSTA Job Portal Team</p></body></html>',
'Dear {{full_name}}, Welcome to the OSTA Job Portal! Your account has been successfully created. You can now browse jobs, apply to positions, save jobs, set up alerts, and track applications. Login: {{login_url}}. Best regards, OSTA Job Portal Team',
'["full_name", "login_url"]', 1);

-- Insert default user preferences for existing users
INSERT INTO user_preferences (user_id, preference_name, preference_value) 
SELECT id, 'email_notifications', 'true' FROM users WHERE role = 'applicant';

INSERT INTO user_preferences (user_id, preference_name, preference_value) 
SELECT id, 'job_alert_frequency', 'daily' FROM users WHERE role = 'applicant';

INSERT INTO user_preferences (user_id, preference_name, preference_value) 
SELECT id, 'dashboard_layout', 'default' FROM users;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_status_deadline ON jobs(status, deadline);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_job_status ON applications(job_id, status);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_active ON job_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target, target_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_date ON audit_log(user_id, created_at);

-- Update settings with new configuration options
INSERT INTO settings (setting_name, setting_value) VALUES
('job_alert_enabled', '1'),
('max_job_alerts_per_user', '5'),
('job_view_tracking', '1'),
('password_reset_expiry_hours', '24'),
('session_timeout_minutes', '60'),
('max_login_attempts', '5'),
('login_lockout_minutes', '15'),
('file_upload_max_size_mb', '10'),
('allowed_attachment_types', 'pdf,doc,docx,txt'),
('email_queue_enabled', '1'),
('analytics_enabled', '1')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Create triggers for automatic audit logging
DELIMITER //

CREATE TRIGGER IF NOT EXISTS audit_job_insert 
AFTER INSERT ON jobs 
FOR EACH ROW 
BEGIN
    INSERT INTO audit_log (user_id, action, details) 
    VALUES (NEW.created_by, 'CREATE_JOB', CONCAT('Created job: ', NEW.title));
END//

CREATE TRIGGER IF NOT EXISTS audit_job_update 
AFTER UPDATE ON jobs 
FOR EACH ROW 
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO audit_log (user_id, action, details) 
        VALUES (NEW.created_by, 'UPDATE_JOB_STATUS', 
                CONCAT('Changed job status from ', OLD.status, ' to ', NEW.status, ' for: ', NEW.title));
    END IF;
END//

CREATE TRIGGER IF NOT EXISTS audit_application_insert 
AFTER INSERT ON applications 
FOR EACH ROW 
BEGIN
    INSERT INTO audit_log (user_id, action, details) 
    VALUES (NEW.user_id, 'APPLY_JOB', CONCAT('Applied for job ID: ', NEW.job_id));
END//

CREATE TRIGGER IF NOT EXISTS audit_application_status_update 
AFTER UPDATE ON applications 
FOR EACH ROW 
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO application_history (application_id, old_status, new_status, changed_by, feedback) 
        VALUES (NEW.id, OLD.status, NEW.status, NEW.user_id, NEW.feedback);
        
        INSERT INTO audit_log (user_id, action, details) 
        VALUES (NEW.user_id, 'UPDATE_APPLICATION_STATUS', 
                CONCAT('Application status changed from ', OLD.status, ' to ', NEW.status));
    END IF;
END//

DELIMITER ;

-- Sample data for new tables
INSERT INTO job_alerts (user_id, keywords, location, employment_type, department_id, is_active) VALUES
(8, 'research, scientist', 'Addis Ababa', 'full_time', 1, TRUE),
(9, 'technology, transfer', 'Addis Ababa', NULL, 2, TRUE),
(10, 'quality, assurance', 'Addis Ababa', 'full_time', 3, TRUE);

-- Add some job views for analytics
INSERT INTO job_views (job_id, user_id, ip_address) VALUES
(1, 8, '192.168.1.100'),
(1, 9, '192.168.1.101'),
(2, 8, '192.168.1.100'),
(2, 10, '192.168.1.102'),
(3, 9, '192.168.1.101'),
(3, 10, '192.168.1.102');

COMMIT;
