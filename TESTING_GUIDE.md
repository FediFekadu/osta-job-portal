# OSTA Job Portal - User Management System Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
1. XAMPP running with Apache and MySQL
2. React development server running (`npm start` in react-frontend folder)
3. Database setup completed (run `setup_complete_system.php`)

## 📋 Complete Testing Checklist

### 1. Database Setup Verification
- [ ] Run `http://localhost/osta_job_portal/setup_complete_system.php`
- [ ] Verify all tables created successfully
- [ ] Confirm admin user exists
- [ ] Check sample departments created

### 2. Admin Functionality Testing

#### Admin Login
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Login with: `admin@osta.gov` / `admin123`
- [ ] Verify redirect to admin dashboard
- [ ] Check admin navigation menu appears

#### Create Employer Account
- [ ] Click "Create Employer" in admin navigation
- [ ] Fill out form with test company:
  - Company Name: "Test Company Inc"
  - Contact Person: "John Doe"
  - Phone: "555-0123"
  - Address: "123 Test Street"
- [ ] Verify auto-generated email appears: `testcompanyinc@company.com`
- [ ] Submit form
- [ ] Verify success message and generated credentials displayed
- [ ] Note the generated password (e.g., `testcompanyinc123`)

### 3. Employer Functionality Testing

#### Employer Login
- [ ] Logout from admin account
- [ ] Login with generated employer credentials:
  - Email: `testcompanyinc@company.com`
  - Password: `testcompanyinc123`
- [ ] Verify redirect to employer dashboard
- [ ] Check employer navigation menu appears

#### Profile Management
- [ ] Click "Settings" in employer navigation
- [ ] Verify profile tab loads with company information
- [ ] Update company details:
  - Change company name
  - Add website URL
  - Update contact information
  - Add company description
- [ ] Save changes and verify success message

#### Password Change
- [ ] Switch to "Change Password" tab
- [ ] Enter current password: `testcompanyinc123`
- [ ] Enter new password: `newpassword123`
- [ ] Confirm new password: `newpassword123`
- [ ] Submit and verify success message
- [ ] Logout and login with new password to confirm

### 4. Job Seeker Registration Testing

#### Self-Registration
- [ ] Navigate to `http://localhost:3000/register`
- [ ] Fill out registration form:
  - Full Name: "Jane Smith"
  - Email: "jane.smith@email.com"
  - Phone: "555-0456"
  - Password: "jobseeker123"
  - Confirm Password: "jobseeker123"
- [ ] Submit form and verify success message
- [ ] Verify redirect to applicant dashboard

#### Job Seeker Login
- [ ] Logout and return to login page
- [ ] Login with job seeker credentials:
  - Email: `jane.smith@email.com`
  - Password: `jobseeker123`
- [ ] Verify redirect to applicant dashboard
- [ ] Check applicant navigation menu appears

### 5. UI/UX Testing

#### Professional CSS Verification
- [ ] Check all forms have consistent styling
- [ ] Verify buttons have hover effects and proper colors
- [ ] Test responsive design on mobile viewport
- [ ] Confirm loading spinners appear during form submissions
- [ ] Verify alert messages display properly (success/error)

#### Navigation Testing
- [ ] Test all navigation menus work correctly
- [ ] Verify role-based navigation (admin/employer/applicant)
- [ ] Check logout functionality from all user types
- [ ] Test browser back/forward navigation

### 6. Security Testing

#### Authentication Security
- [ ] Try accessing admin pages without admin login (should redirect)
- [ ] Try accessing employer pages without employer login (should redirect)
- [ ] Verify password hashing (check database - passwords should be hashed)
- [ ] Test duplicate email prevention during registration

#### Input Validation
- [ ] Try submitting forms with empty required fields
- [ ] Test email format validation
- [ ] Test password length requirements
- [ ] Verify password confirmation matching

## 🐛 Common Issues and Solutions

### Issue: "Cannot connect to database"
**Solution:** Check XAMPP MySQL service is running and database credentials in `config/database.php`

### Issue: "CORS errors in browser console"
**Solution:** Ensure React proxy is configured in `package.json` and no duplicate CORS headers in PHP files

### Issue: "404 errors for API endpoints"
**Solution:** Verify Apache is running and `.htaccess` file exists in project root

### Issue: "React components not loading"
**Solution:** Check `npm start` is running and all imports are correct in React files

### Issue: "Styling looks broken"
**Solution:** Verify `GlobalProfessional.css` is imported in `App.js`

## ✅ Success Criteria

The system is working correctly if:
- [ ] Admin can create employer accounts with auto-generated credentials
- [ ] Employers can login with default credentials and change them
- [ ] Job seekers can self-register and login independently
- [ ] All forms have professional styling and validation
- [ ] Role-based navigation and dashboards work correctly
- [ ] No console errors in browser developer tools
- [ ] All database operations complete successfully

## 📊 Performance Testing

### Load Testing (Optional)
- [ ] Create multiple employer accounts (10+)
- [ ] Register multiple job seekers (20+)
- [ ] Test form submission speed
- [ ] Check database query performance

## 🔒 Security Checklist

- [ ] All passwords are hashed in database
- [ ] SQL injection protection (prepared statements used)
- [ ] XSS protection (input sanitization)
- [ ] CSRF protection (session-based auth)
- [ ] Role-based access control working
- [ ] Sensitive data not exposed in API responses

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________

Admin Functionality: ✅ / ❌
Employer Management: ✅ / ❌
Job Seeker Registration: ✅ / ❌
UI/UX Quality: ✅ / ❌
Security: ✅ / ❌
Performance: ✅ / ❌

Issues Found:
1. ________________
2. ________________
3. ________________

Overall Status: PASS / FAIL
```

## 🚀 Deployment Checklist

Before going live:
- [ ] Change default admin password
- [ ] Update database credentials for production
- [ ] Enable HTTPS
- [ ] Set up proper backup procedures
- [ ] Configure error logging
- [ ] Test on production environment
- [ ] Update CORS settings for production domain
- [ ] Optimize React build (`npm run build`)

---

**This testing guide ensures the complete user management system works perfectly before deployment!**
