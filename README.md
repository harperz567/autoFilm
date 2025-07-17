# ScriptBoard - Script to Storyboard Generator

A modern web application that transforms text scripts into professional storyboards using AI and machine learning.

## Features

- **Script Input**: Support for text input, file upload (.txt, .docx, .pdf)
- **AI-Powered Conversion**: Transform scripts into detailed storyboards
- **Project Management**: Create, edit, and manage multiple projects
- **Export Options**: Export storyboards as PDF, Excel, or Word documents
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Preview**: See your storyboard as you work

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Dropzone** for file uploads
- **Lucide React** for icons

### Backend (Coming Soon)
- **FastAPI** with Python
- **PostgreSQL** database
- **Redis** for caching
- **JWT** authentication
- **AI/ML** integration for script analysis

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scriptboard-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```bash
REACT_APP_API_URL=http://localhost:8000/api
```

5. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   └── layout/         # Layout components (Header, Sidebar, etc.)
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication context
│   └── AppContext.tsx  # Global app state
├── pages/              # Page components
│   ├── AuthPages.tsx   # Login/Register pages
│   ├── DashboardPage.tsx # Project management
│   └── EditorPage.tsx  # Main editor interface
├── services/           # API service layer
│   └── api.ts         # API client and endpoints
├── types/             # TypeScript type definitions
│   └── index.ts       # All type definitions
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── App.tsx            # Main application component
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Integration

The frontend is designed to work with a FastAPI backend. The API service layer in `src/services/api.ts` provides:

- User authentication (login, register, logout)
- Project management (CRUD operations)
- Script conversion to storyboard
- File upload and processing
- Export functionality

## Features in Development

- [ ] Backend API implementation
- [ ] AI-powered script analysis
- [ ] Advanced storyboard editing
- [ ] Collaboration features
- [ ] Template library
- [ ] Advanced export options

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
