<<<<<<< HEAD
# safetyfrontend
=======
# Safety App - Comprehensive Safety Management System

A modern, full-featured safety management system designed for workplaces to streamline EHS (Environment, Health, and Safety) processes, reduce incidents, and create safer work environments.

## Features

- **User Management**: Role-based access control for admins, safety managers, supervisors, and employees. Admins can view and manage all registered users in the User Management section, with real-time updates in the admin dashboard showing total user counts.
- **Group Management**: Create and manage user groups with customizable permissions, member assignments, and group-specific notifications.
- **Hazard Reporting**: Real-time hazard identification and reporting system
- **Safety Checklists**: Customizable checklists for different departments and roles
- **Incident Management**: Comprehensive incident tracking and analysis
- **Training Management**: Track and manage employee training programs
- **Notifications**: Automated alerts and notifications for safety concerns, including group-specific notifications
- **Analytics & Reports**: Data-driven insights for safety performance using charts and graphs
- **System Settings**: Customizable theme and system configuration
- **System Theme**: Dark/light mode support
- **Mobile Responsive**: Optimized for desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Theme Management**: next-themes
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <YOUR_GIT_URL>
cd safety-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Demo Accounts

The application includes demo accounts for testing different user roles. Use the following credentials to log in:

- **Admin**: admin@company.com / 1122
- **Safety Manager**: manager@company.com / 1122
- **Supervisor**: supervisor@company.com / 1122
- **Employee**: employee@company.com / 1122
- **Additional Supervisor**: emilsa@company.com / 1122

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Dashboard, Sidebar, Navbar, Footer, Topbar)
│   ├── ui/            # shadcn/ui components (accordion, alert, button, etc.)
│   └── ...            # Other components (About, AuthModal, Contact, etc.)
├── contexts/           # React contexts (AuthContext)
├── hooks/             # Custom React hooks (use-mobile, use-toast)
├── lib/               # Utility functions (notificationUtils, permissionUtils, utils)
├── pages/             # Page components (Dashboard, Login, UserManagement, etc.)
├── data.js            # Static data definitions
├── App.jsx            # Main App component
├── main.jsx           # Application entry point
└── vite-env.d.js      # Vite environment types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## User Roles

- **Admin**: Full system access, user management, system settings
- **Safety Manager**: Hazard management, incident tracking, analytics
- **Supervisor**: Team oversight, checklist management
- **Employee**: Basic reporting, checklist completion

## Deployment

This project can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
>>>>>>> 6b5ec2d (main)
