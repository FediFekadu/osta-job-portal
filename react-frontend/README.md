# OSTA Job Portal - React Frontend

🚀 **Complete React Migration** - Modern, Professional, and User-Friendly Job Portal

## 📋 Overview

This is the complete React frontend for the OSTA Job Portal system, featuring a modern, responsive design with comprehensive functionality for all user roles: Applicants, Employers, and Administrators.

## ✨ Features
- **Saved Jobs**: Bookmark and manage interesting job opportunities
- **Application History**: Track all submitted applications with status updates
- **Job Alerts**: Create custom alerts for new job opportunities
- **Profile Management**: Update personal information and preferences

### UI/UX Features
- **Modern Design**: Professional gradient themes and clean typography
- **Interactive Components**: Smooth animations and hover effects
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Dark Mode Ready**: CSS variables for easy theme switching
- **Mobile First**: Responsive design that works on all devices

## 🛠️ Technology Stack

- **React 18**: Latest React with hooks and modern patterns
- **React Router**: Client-side routing for single-page application
- **Axios**: HTTP client for API communication
- **CSS3**: Modern CSS with variables, grid, and flexbox
- **Font Awesome**: Professional icon library
- **Google Fonts**: Inter font family for clean typography

## 📁 Project Structure

```
react-frontend/
├── public/
│   └── index.html          # Main HTML template
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Sidebar.js     # Navigation sidebar
│   │   ├── Header.js      # Top header with user info
│   │   ├── StatsCard.js   # Statistics display cards
│   │   ├── ApplicationsTable.js  # Applications data table
│   │   └── JobApplicationForm.js # Job application form
│   ├── pages/             # Main page components
│   │   ├── Dashboard.js   # Main dashboard page
│   │   ├── Profile.js     # User profile management
│   │   ├── SavedJobs.js   # Saved jobs listing
│   │   ├── Applications.js # Application history
│   │   └── JobAlerts.js   # Job alerts management
│   ├── services/          # API and external services
│   │   └── apiService.js  # Backend API integration
│   ├── styles/            # CSS styling files
│   │   ├── index.css      # Global styles and variables
│   │   ├── App.css        # Main application styles
│   │   └── components.css # Component-specific styles
│   ├── App.js             # Main application component
│   └── index.js           # Application entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager
- PHP backend server running (for API integration)

### Installation

1. **Install Dependencies**
   ```bash
   cd react-frontend
   npm install
   ```

2. **Configure API Endpoint**
   Update the `BASE_URL` in `src/services/apiService.js` to match your PHP backend:
   ```javascript
   const BASE_URL = 'http://localhost/osta_job_portal';
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   The application will open in your browser at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 🔧 Configuration

### API Integration
The React frontend communicates with your existing PHP backend through the API service. Key endpoints include:

- **Authentication**: Session-based authentication with CSRF protection
- **User Management**: Profile updates and user information
- **Job Applications**: Submit and track applications
- **Job Management**: Browse, save, and search jobs
- **Alerts**: Create and manage job alerts

### Environment Variables
Create a `.env` file in the root directory for environment-specific configuration:

```env
REACT_APP_API_URL=http://localhost/osta_job_portal
REACT_APP_UPLOAD_MAX_SIZE=5242880
```

## 🎨 Customization

### Theming
The application uses CSS variables for easy theming. Update the variables in `src/styles/index.css`:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  /* ... more variables */
}
```

### Components
All components are modular and can be easily customized:

- **Sidebar**: Modify navigation items in `src/components/Sidebar.js`
- **Dashboard**: Customize stats and layout in `src/pages/Dashboard.js`
- **Styling**: Update component styles in `src/styles/components.css`

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px
- **Mobile**: Below 768px

Key responsive features:
- Collapsible sidebar on mobile
- Stacked layouts for smaller screens
- Touch-friendly buttons and interactions
- Optimized typography scaling

## 🔐 Security Features

- **CSRF Protection**: Automatic CSRF token handling
- **Session Management**: Secure session-based authentication
- **File Upload Validation**: Client-side file type and size validation
- **Input Sanitization**: XSS protection for user inputs
- **Secure API Calls**: Credentials included in requests

## 🚀 Performance Optimizations

- **Code Splitting**: React.lazy for route-based code splitting
- **Optimized Images**: Responsive image loading
- **CSS Optimization**: Efficient CSS with minimal unused styles
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Browser caching for static assets

## 🧪 Testing

Run the test suite:
```bash
npm test
```

For coverage reports:
```bash
npm run test:coverage
```

## 📈 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🤝 Integration with PHP Backend

This React frontend is designed to work seamlessly with your existing PHP backend:

1. **Session Sharing**: Uses the same session management
2. **API Endpoints**: Calls existing PHP endpoints
3. **File Uploads**: Compatible with PHP file handling
4. **Authentication**: Leverages existing user authentication

### Migration Strategy

1. **Gradual Migration**: Replace PHP pages one by one
2. **Hybrid Approach**: Run React and PHP side by side
3. **API First**: Use PHP as API backend, React as frontend
4. **Progressive Enhancement**: Add React components to existing pages

## 📞 Support

For questions or issues:
1. Check the browser console for error messages
2. Verify API endpoints are accessible
3. Ensure PHP backend is running
4. Check network requests in browser dev tools

## 🎯 Next Steps

1. **Install Dependencies**: Run `npm install` in the react-frontend directory
2. **Start Development**: Run `npm start` to launch the development server
3. **Test Integration**: Verify API calls work with your PHP backend
4. **Customize**: Update colors, branding, and content as needed
5. **Deploy**: Build and deploy to your production environment

## 📄 License

This project is part of the OSTA Job Portal system and follows the same licensing terms as the main application.

---

**Built with ❤️ using React and modern web technologies**
