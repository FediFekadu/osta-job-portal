<?php
// OSTA Job Portal - React App Entry Point
// This serves as the main entry point and redirects to React app

// Check if React dev server is running
$react_dev_url = 'http://localhost:3000';
$react_prod_path = './react-frontend/build/index.html';

// Try to detect if we're in development mode
$is_dev = false;
if (function_exists('curl_init')) {
    $ch = curl_init($react_dev_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    $result = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code === 200) {
        $is_dev = true;
    }
}

// Redirect to React app
if ($is_dev) {
    // Development mode - redirect to React dev server
    header("Location: $react_dev_url");
    exit;
} else {
    // Production mode - serve built React app
    if (file_exists($react_prod_path)) {
        include $react_prod_path;
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSTA Job Portal - Starting React App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --osta-green: #228B22;
            --osta-dark: #2C3E50;
            --osta-gold: #DAA520;
            --osta-red: #DC143C;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        /* Navigation */
        .navbar {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 1rem 0;
        }
        
        .navbar-brand {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--osta-green) !important;
        }
        
        .nav-link {
            font-weight: 500;
            color: var(--osta-dark) !important;
            margin: 0 0.5rem;
            transition: color 0.3s ease;
        }
        
        .nav-link:hover {
            color: var(--osta-green) !important;
        }
        
        .btn-osta-primary {
            background: var(--osta-green);
            border: none;
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-osta-primary:hover {
            background: #1e7a1e;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(34, 139, 34, 0.3);
        }
        
        /* Hero Section */
        .hero-section {
            background: linear-gradient(135deg, var(--osta-green) 0%, var(--osta-dark) 100%);
            padding: 100px 0;
            color: white;
            text-align: center;
        }
        
        .hero-section h1 {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .hero-section p {
            font-size: 1.3rem;
            margin-bottom: 3rem;
            opacity: 0.9;
        }
        
        .hero-search {
            background: rgba(255,255,255,0.95);
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .search-row {
            display: grid;
            grid-template-columns: 2fr 1.5fr 1.5fr auto;
            gap: 1rem;
            align-items: end;
        }
        
        .search-field label {
            color: var(--osta-dark);
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }
        
        .search-field input,
        .search-field select {
            padding: 0.8rem;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 1rem;
            width: 100%;
        }
        
        .search-btn {
            background: var(--osta-green);
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .search-btn:hover {
            background: #1e7a1e;
            transform: translateY(-2px);
        }
        
        /* Portal Access Cards */
        .portal-access {
            padding: 80px 0;
            background: #f8f9fa;
        }
        
        .access-card {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            height: 100%;
        }
        
        .access-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        
        .access-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2rem;
            color: white;
        }
        
        .access-icon.applicant { background: var(--osta-green); }
        .access-icon.employer { background: var(--osta-gold); }
        .access-icon.admin { background: var(--osta-red); }
        
        /* Featured Jobs */
        .featured-jobs {
            padding: 80px 0;
        }
        
        .job-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            border: 1px solid #e1e5e9;
            height: 100%;
        }
        
        .job-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .job-type {
            font-size: 0.8rem;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .job-type.full_time { background-color: #d4edda; color: #155724; }
        .job-type.part_time { background-color: #fff3cd; color: #856404; }
        .job-type.contract { background-color: #cce5ff; color: #004085; }
        .job-type.internship { background-color: #f8d7da; color: #721c24; }
        
        /* Statistics */
        .stats-section {
            background: var(--osta-dark);
            color: white;
            padding: 60px 0;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 3rem;
            font-weight: 700;
            color: var(--osta-green);
        }
        
        /* Footer */
        .footer {
            background: var(--osta-dark);
            color: white;
            padding: 60px 0 30px;
        }
        
        .footer h5 {
            color: var(--osta-green);
            margin-bottom: 1rem;
        }
        
        .footer a {
            color: #ccc;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .footer a:hover {
            color: var(--osta-green);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .search-row {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .hero-section h1 {
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg">
        <div class="container">
            <a class="navbar-brand" href="index.php">
                <i class="fas fa-briefcase me-2"></i>OSTA Job Portal
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="index.php">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="jobs.php">Browse Jobs</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="about.php">About OSTA</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="contact.php">Contact</a>
                    </li>
                </ul>
                
                <ul class="navbar-nav">
                    <?php if ($user): ?>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                                <i class="fas fa-user me-1"></i><?php echo htmlspecialchars($user['first_name']); ?>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="<?php echo $user['role']; ?>/dashboard.php">Dashboard</a></li>
                                <li><a class="dropdown-item" href="<?php echo $user['role']; ?>/profile.php">Profile</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="logout.php">Logout</a></li>
                            </ul>
                        </li>
                    <?php else: ?>
                        <li class="nav-item">
                            <a class="nav-link" href="login.php">Login</a>
                        </li>
                        <li class="nav-item">
                            <a href="register.php" class="btn btn-osta-primary">Register</a>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container">
            <h1>Find Your Future Career at OSTA & Partners</h1>
            <p>Connecting skilled professionals with opportunities across Oromia</p>
            
            <!-- Search Form -->
            <div class="hero-search">
                <form method="GET" action="jobs.php">
                    <div class="search-row">
                        <div class="search-field">
                            <label>Keywords</label>
                            <input type="text" name="search" placeholder="e.g., Engineer, Manager...">
                        </div>
                        
                        <div class="search-field">
                            <label>Job Type</label>
                            <select name="job_type">
                                <option value="">All Types</option>
                                <option value="full_time">Full-time</option>
                                <option value="part_time">Part-time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                            </select>
                        </div>
                        
                        <div class="search-field">
                            <label>Department</label>
                            <select name="department">
                                <option value="">All Departments</option>
                                <?php foreach ($departments as $dept): ?>
                                    <option value="<?php echo $dept['id']; ?>">
                                        <?php echo htmlspecialchars($dept['name']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <button type="submit" class="search-btn">
                            <i class="fas fa-search me-1"></i>Search Jobs
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </section>

    <!-- Portal Access Section -->
    <section class="portal-access">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="h3 fw-bold">Access Your Portal</h2>
                <p class="text-muted">Choose your role to access the appropriate dashboard</p>
            </div>
            
            <div class="row g-4">
                <div class="col-lg-4 col-md-6">
                    <div class="access-card">
                        <div class="access-icon applicant">
                            <i class="fas fa-user-graduate"></i>
                        </div>
                        <h4>Job Seekers</h4>
                        <p class="text-muted mb-4">Search and apply for jobs, manage your applications, and track your career progress.</p>
                        <div class="d-grid gap-2">
                            <?php if ($user && $user['role'] === 'applicant'): ?>
                                <a href="applicant/dashboard.php" class="btn btn-osta-primary">Go to Dashboard</a>
                            <?php else: ?>
                                <a href="register.php?role=applicant" class="btn btn-osta-primary">Register as Applicant</a>
                                <a href="login.php" class="btn btn-outline-secondary">Login</a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4 col-md-6">
                    <div class="access-card">
                        <div class="access-icon employer">
                            <i class="fas fa-building"></i>
                        </div>
                        <h4>Employers</h4>
                        <p class="text-muted mb-4">Post job openings, manage applications, and find the best candidates for your organization.</p>
                        <div class="d-grid gap-2">
                            <?php if ($user && $user['role'] === 'employer'): ?>
                                <a href="employer/dashboard.php" class="btn btn-osta-primary">Go to Dashboard</a>
                            <?php else: ?>
                                <a href="register.php?role=employer" class="btn btn-osta-primary">Register as Employer</a>
                                <a href="login.php" class="btn btn-outline-secondary">Login</a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4 col-md-6">
                    <div class="access-card">
                        <div class="access-icon admin">
                            <i class="fas fa-cogs"></i>
                        </div>
                        <h4>Administrators</h4>
                        <p class="text-muted mb-4">Manage users, oversee job postings, and maintain the portal system.</p>
                        <div class="d-grid gap-2">
                            <?php if ($user && $user['role'] === 'admin'): ?>
                                <a href="admin/dashboard.php" class="btn btn-osta-primary">Go to Dashboard</a>
                            <?php else: ?>
                                <a href="login.php" class="btn btn-osta-primary">Admin Login</a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Jobs -->
    <section class="featured-jobs">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="h3 fw-bold">Featured Jobs</h2>
                <p class="text-muted">Discover exciting career opportunities</p>
            </div>
            
            <div class="row g-4">
                <?php if (empty($featured_jobs)): ?>
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-briefcase fa-3x text-muted mb-3"></i>
                        <h4 class="text-muted">No jobs available</h4>
                        <p class="text-muted">Check back later for new opportunities.</p>
                    </div>
                <?php else: ?>
                    <?php foreach ($featured_jobs as $job): ?>
                        <div class="col-lg-4 col-md-6">
                            <div class="job-card">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <span class="job-type <?php echo $job['employment_type']; ?>">
                                        <?php echo ucfirst(str_replace('_', ' ', $job['employment_type'])); ?>
                                    </span>
                                </div>
                                
                                <h5 class="mb-3"><?php echo htmlspecialchars($job['title']); ?></h5>
                                
                                <div class="mb-2">
                                    <small class="text-muted">
                                        <i class="fas fa-building me-1"></i>
                                        <?php echo htmlspecialchars($job['department_name']); ?>
                                    </small>
                                </div>
                                
                                <div class="mb-2">
                                    <small class="text-muted">
                                        <i class="fas fa-map-marker-alt me-1"></i>
                                        <?php echo htmlspecialchars($job['location']); ?>
                                    </small>
                                </div>
                                
                                <div class="mb-3">
                                    <small class="text-danger">
                                        <i class="fas fa-clock me-1"></i>
                                        Deadline: <?php echo date('M j, Y', strtotime($job['deadline'])); ?>
                                    </small>
                                </div>
                                
                                <p class="text-muted mb-3">
                                    <?php echo substr(strip_tags($job['description']), 0, 120) . '...'; ?>
                                </p>
                                
                                <div class="d-grid">
                                    <a href="job_details.php?id=<?php echo $job['id']; ?>" class="btn btn-osta-primary">
                                        View Details
                                    </a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
            
            <div class="text-center mt-5">
                <a href="jobs.php" class="btn btn-outline-primary btn-lg">
                    <i class="fas fa-search me-2"></i>Browse All Jobs
                </a>
            </div>
        </div>
    </section>

    <!-- Statistics -->
    <section class="stats-section">
        <div class="container">
            <div class="row text-center">
                <div class="col-md-4">
                    <div class="stat-item">
                        <div class="stat-number"><?php echo $stats['total_jobs']; ?>+</div>
                        <h5>Active Jobs</h5>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-item">
                        <div class="stat-number"><?php echo $stats['total_departments']; ?>+</div>
                        <h5>Departments</h5>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-item">
                        <div class="stat-number"><?php echo $stats['total_applications']; ?>+</div>
                        <h5>Applications</h5>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-lg-4">
                    <h5>OSTA Job Portal</h5>
                    <p>Connecting skilled professionals with opportunities across Oromia region.</p>
                    <div>
                        <a href="#" class="me-3"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="me-3"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="me-3"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
                
                <div class="col-lg-2">
                    <h5>Quick Links</h5>
                    <ul class="list-unstyled">
                        <li><a href="index.php">Home</a></li>
                        <li><a href="jobs.php">Browse Jobs</a></li>
                        <li><a href="about.php">About</a></li>
                        <li><a href="contact.php">Contact</a></li>
                    </ul>
                </div>
                
                <div class="col-lg-2">
                    <h5>For Job Seekers</h5>
                    <ul class="list-unstyled">
                        <li><a href="register.php?role=applicant">Register</a></li>
                        <li><a href="login.php">Login</a></li>
                        <li><a href="jobs.php">Search Jobs</a></li>
                    </ul>
                </div>
                
                <div class="col-lg-2">
                    <h5>For Employers</h5>
                    <ul class="list-unstyled">
                        <li><a href="register.php?role=employer">Register</a></li>
                        <li><a href="login.php">Login</a></li>
                        <li><a href="employer/post-job.php">Post Jobs</a></li>
                    </ul>
                </div>
                
                <div class="col-lg-2">
                    <h5>Support</h5>
                    <ul class="list-unstyled">
                        <li><a href="help.php">Help Center</a></li>
                        <li><a href="privacy.php">Privacy Policy</a></li>
                        <li><a href="terms.php">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            
            <hr class="my-4">
            <div class="text-center">
                <p>&copy; <?php echo date('Y'); ?> OSTA Job Portal. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- React Integration Script -->
    <script>
        // Check if React dev server is available and redirect for SPA features
        const reactDevUrl = 'http://localhost:3000';
        
        // Add click handlers for React-powered features
        document.addEventListener('DOMContentLoaded', function() {
            // Check if React dev server is running
            fetch(reactDevUrl)
                .then(response => {
                    if (response.ok) {
                        // React is available, add SPA navigation for certain links
                        const reactLinks = document.querySelectorAll('[data-react-route]');
                        reactLinks.forEach(link => {
                            link.addEventListener('click', function(e) {
                                e.preventDefault();
                                window.location.href = reactDevUrl + this.getAttribute('data-react-route');
                            });
                        });
                    }
                })
                .catch(error => {
                    console.log('React dev server not available, using PHP pages');
                });
        });
    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>