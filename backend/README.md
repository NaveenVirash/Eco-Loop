# Eco Loop Backend

The backend for the **Eco Loop** MERN stack project has been successfully set up with a professional directory structure.

## Project Structure
```text
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Register, Login, Get current user
│   ├── productController.js  # Create, Get, Delete products
│   └── userController.js     # Admin controls for Users
├── middlewares/
│   └── authMiddleware.js     # JWT Verification and Role Authorization
├── models/
│   ├── Product.js            # Product Schema with 30-day auto-delete
│   └── User.js               # User Schema with password hashing
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── productRoutes.js      # /api/products routes
│   └── userRoutes.js         # /api/users routes
├── .env                      # Environment variables
└── server.js                 # Express server entry point
```

## Features Implemented

1. **Authentication**: 
   - Uses JWT tokens for secure authentication. 
   - `User` and `Admin` roles supported out of the box.
2. **Admin Capabilities**: 
   - Admins have access to `/api/users` endpoints to list and delete registered users.
   - Admins can delete any product via the `/api/products/:id` endpoint.
3. **Auto-Delete Products (30 Days)**:
   - Utilizes a MongoDB **TTL (Time-To-Live) index** in `models/Product.js`.
   - The database automatically removes the product 30 days after its `createdAt` timestamp.

## Getting Started

1. Ensure **MongoDB** is running on your machine (Default: `mongodb://localhost:27017`).
2. Navigate to the backend folder:
   ```bash
   cd "d:\Eco Loop\backend"
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   *The server will run on port 5000.*

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register`: Register a new user (`name`, `email`, `password`, `role`).
- `POST /login`: Authenticate and get JWT token (`email`, `password`).
- `GET /me`: Get logged-in user's details (Requires Token).

### Users - Admin Only (`/api/users`)
- `GET /`: Get all users (Requires Token, Admin only).
- `GET /:id`: Get specific user details (Requires Token, Admin only).
- `DELETE /:id`: Delete a user account (Requires Token, Admin only).

### Products (`/api/products`)
- `GET /`: List all products.
- `POST /`: Add a new product (Requires Token).
- `DELETE /:id`: Delete a product (Requires Token; Must be Product Owner or Admin).
