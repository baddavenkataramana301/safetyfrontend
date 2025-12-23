# Safety Frontend - VSMS

Modern, responsive frontend for the Versatile Safety Management System built with React and Vite.

## Features

- **AI-Powered Safety Analysis**: Intelligent hazard identification using text, images, and voice
- **User Management**: Role-based access control for admins, safety managers, supervisors, and employees
- **Group Management**: Create and manage user groups with customizable permissions
- **Hazard Reporting (HIRA)**: Real-time hazard identification and reporting with AI analysis
- **Safety Checklists**: Customizable checklists for different departments and roles
- **Training Management**: Track and manage employee training programs
- **Notifications**: Automated alerts and notifications for safety concerns
- **Analytics & Reports**: Data-driven insights with interactive charts
- **System Settings**: Customizable theme and system configuration
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router DOM (HashRouter)
- **State Management**: React Context API
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Theme Management**: next-themes
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Backend server running on `http://localhost:8000`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Demo Accounts

Use the following credentials to test different user roles:

- **Admin**: admin@company.com / 1122
- **Safety Manager**: manager@company.com / 1122
- **Supervisor**: supervisor@company.com / 1122
- **Employee**: employee@company.com / 1122

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Dashboard, Sidebar, Navbar)
│   ├── ui/            # shadcn/ui components
│   └── ...            # Other components
├── contexts/           # React contexts (AuthContext, ChecklistContext)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── pages/             # Page components
│   ├── Index.jsx      # AI Assessment page
│   ├── InputPanel.jsx # AI input interface
│   ├── ResultsPanel.jsx # AI results display
│   ├── Hazards.jsx    # Hazard management with AI analysis
│   └── ...            # Other pages
├── data.js            # Static data definitions
├── App.jsx            # Main App component
└── main.jsx           # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## User Roles

- **Admin**: Full system access, user management, system settings
- **Safety Manager**: Hazard management, incident tracking, analytics, AI analysis
- **Supervisor**: Team oversight, checklist management, AI analysis
- **Employee**: Hazard reporting, checklist completion, AI analysis

## Key Features

### AI Safety Analysis
- Access via "AI Analysis" button on Hazard Management page
- Multi-modal input: text, images, voice recordings
- Real-time risk assessment
- Professional HIRA report generation
- Download reports in PDF, Word, JPG, JSON formats

### Hazard Management
- Create and track hazards
- Multi-level approval workflow
- Priority and timeline assignment
- Team assignment
- Status tracking (Open → Pending → Approved → Resolved)

### Dashboard
- Role-specific views
- Real-time statistics
- Interactive charts
- Quick access to key features

## Environment Configuration

The app connects to the backend at `http://127.0.0.1:8000`. Update API endpoints in the following files if needed:

- `src/pages/Index.jsx`
- `src/pages/InputPanel.jsx`
- `src/pages/Hazards.jsx`

## Build Configuration

The project uses Vite with the following configuration:
- Base path: `./` for dynamic path support
- Server port: 3000
- Code splitting for optimized bundles
- Hot Module Replacement (HMR) enabled

## Deployment

This project can be deployed to any static hosting service:

### Vercel
```bash
npm run build
# Deploy the dist folder
```

### Netlify
```bash
npm run build
# Deploy the dist folder
```

### GitHub Pages
1. Update `vite.config.js` base path
2. Build: `npm run build`
3. Deploy `dist` folder

## Troubleshooting

### App not loading?
- Hard refresh: `Ctrl + Shift + R`
- Clear browser cache
- Check browser console for errors

### Backend connection issues?
- Ensure backend is running on port 8000
- Check CORS settings in backend
- Verify API endpoint URLs

### Build errors?
- Clear node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Clear cache: `npm cache clean --force`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
