# EcoLoop Frontend

A React-based frontend for the EcoLoop platform, featuring user authentication, product management, and admin controls.

## Features

- **User Authentication**: Register and login functionality
- **User Dashboard**: Upload and manage products, browse all available items
- **Admin Dashboard**: Manage users and monitor products
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Instant product listing and management

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Navbar.css
│   │   └── PrivateRoute.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Home.css
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Auth.css
│   │   ├── UserDashboard.js
│   │   ├── AdminDashboard.js
│   │   └── Dashboard.css
│   ├── utils/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend root:
```bash
REACT_APP_API_URL=http://localhost:5000
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Key Technologies

- **React 18**: Frontend framework
- **React Router v6**: Client-side routing
- **Axios**: HTTP client for API calls
- **Context API**: State management for authentication

## Available Pages

- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - User dashboard (protected)
- `/admin` - Admin dashboard (protected, admin only)

## API Integration

The frontend communicates with the backend API at `http://localhost:5000`. All API calls are configured in `src/utils/api.js`.

### Authentication Flow

1. User registers/logs in via `/register` or `/login`
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is sent with all subsequent requests in Authorization header
5. AuthContext manages global authentication state

## Features Detail

### User Dashboard
- View all available products
- Upload new products with title, description, category, and price
- Delete own products
- View expiration status (products auto-delete after 30 days)

### Admin Dashboard
- View all users with their details
- Delete users
- View all products with deletion countdown
- Delete products manually

## Styling

The project uses custom CSS with a cohesive design system:
- **Primary Color**: #1E9B6B (Green)
- **Accent Color**: #C47B14 (Amber)
- **Background**: #F8F7F3 (Sand)
- **Text**: #1A1A18 (Ink)

## Environment Variables

```
REACT_APP_API_URL=http://localhost:5000
```

## Contributing

Feel free to fork and submit pull requests for improvements.

## License

ISC
