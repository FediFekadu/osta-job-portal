-- Fix resume paths in database
-- This script fixes resume paths that might contain full paths instead of just filenames

USE osta_job_portal;

-- Update applications table to store only filenames for resume_path
-- Remove any '../uploads/resumes/' prefix from existing paths
UPDATE applications 
SET resume_path = REPLACE(resume_path, '../uploads/resumes/', '')
WHERE resume_path LIKE '../uploads/resumes/%';

-- Also handle cases where paths might have 'uploads/resumes/' prefix
UPDATE applications 
SET resume_path = REPLACE(resume_path, 'uploads/resumes/', '')
WHERE resume_path LIKE 'uploads/resumes/%';

-- Show the updated paths for verification
SELECT id, user_id, job_id, resume_path, created_at 
FROM applications 
WHERE resume_path IS NOT NULL 
ORDER BY created_at DESC;

COMMIT;
