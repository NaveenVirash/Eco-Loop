# 🌱 EcoLoop - Community Recyclable Redistribution Platform

A full-stack MERN application for sharing and redistributing recyclable items within your community.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14+)
- **MongoDB** (local or cloud)
- **npm** or **yarn**

### Full Project Structure

```
Eco Loop/
├── backend/                 # Node.js/Express API
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/                # React application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
└── ecoloop-v2.html          # Original HTML template (reference)
```

## 📋 Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Make sure MongoDB is running
# For local MongoDB:
# mongod

# Update .env file with your settings
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/ecoloop
# JWT_SECRET=your_secret_key_here
# NODE_ENV=development

# Start backend server
npm run dev    # Development (with auto-reload)
# OR
npm start      # Production
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup

```bash
# Open a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

Frontend will run on: `http://localhost:3000`

## 🔐 Authentication

### Register as User
1. Go to `/register`
2. Fill in name, email, password
3. Select "User" role
4. Click Register
5. You'll be redirected to dashboard

### Register as Admin
1. Go to `/register`
2. Fill in name, email, password
3. Select "Admin" role
4. Click Register
5. You'll be redirected to admin dashboard

### Login
1. Go to `/login`
2. Enter email and password
3. Click Login

## 👤 User Features

**User Dashboard** (`/dashboard`)
- **Upload Products**: Add items with title, description, category, and price
- **My Products**: View and delete your uploaded products
- **Browse Products**: See all available products from community members
- **Auto-Deletion**: Products automatically disappear after 30 days
- **View Product Details**: See who posted each product and when

### Product Categories
- Electronics
- Furniture
- Clothing
- Books
- Toys
- Other

## 👨‍💼 Admin Features

**Admin Dashboard** (`/admin`)
- **User Management**: 
  - View all registered users
  - See user details (name, email, role, join date)
  - Delete users if needed
  
- **Product Management**:
  - View all products in system
  - See who posted each product
  - Monitor product expiration (countdown timer)
  - Manual product deletion
  - Automatic deletion happens after 30 days

## 📡 API Endpoints

### Authentication (`/api/auth`)
```
POST /register          - Register new user
POST /login            - Login user
GET /me                - Get current user (protected)
```

### Products (`/api/products`)
```
GET /                  - Get all products
POST /                 - Create product (protected)
DELETE /:id            - Delete product (protected, owner/admin)
```

### Users (`/api/users`) - Admin Only
```
GET /                  - Get all users (admin only)
GET /:id              - Get specific user (admin only)
DELETE /:id           - Delete user (admin only)
```

## 🛡️ Security Features

✅ JWT Token Authentication (30-day expiration)
✅ Password Hashing with bcryptjs
✅ Role-Based Access Control (Admin/User)
✅ Protected Routes
✅ CORS Enabled
✅ Environment Variables for Sensitive Data

## 🗄️ Database Models

### User Model
- name (String)
- email (String, unique)
- password (String, hashed)
- role (String: 'user' or 'admin')
- createdAt (Date)

### Product Model
- title (String)
- description (String)
- category (String)
- price (Number, optional)
- user (ObjectId reference)
- createdAt (Date, TTL: 30 days auto-delete)

## 🎨 Design System

**Colors**
- Primary Green: #1E9B6B
- Accent Amber: #C47B14
- Secondary Coral: #D45A2A
- Background: #F8F7F3
- Text: #1A1A18

**Typography**
- Headings: Fraunces (serif)
- Body: Plus Jakarta Sans (sans-serif)

## 📱 Responsive Design

The application is fully responsive and works on:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1200px)
- ✅ Mobile (320px - 768px)

## 🚀 Deployment

### Backend Deployment (Example: Heroku)
```bash
cd backend
heroku create your-app-name
git push heroku main
```

### Frontend Deployment (Example: Vercel)
```bash
cd frontend
npm run build
vercel
```

## 🧪 Testing the Application

### Test User Account
1. Register with test credentials
2. Post some products
3. View them in dashboard
4. Test deletion

### Test Admin Account
1. Register with role set to "admin"
2. Go to `/admin`
3. View all users and products
4. Test user/product deletion

## 🐛 Troubleshooting

**Backend not connecting to MongoDB:**
- Ensure MongoDB is running (`mongod` in terminal)
- Check MONGO_URI in .env file
- Verify MongoDB connection string format

**Frontend can't reach backend:**
- Check backend is running on port 5000
- Ensure proxy is set in frontend/package.json
- Clear browser cache and restart

**JWT token errors:**
- Ensure JWT_SECRET is set in .env
- Clear localStorage and login again
- Check token expiration (30 days)

**CORS errors:**
- Verify CORS is enabled in server.js
- Check backend origin settings
- Ensure correct API URL in frontend

## 📚 Tech Stack

**Frontend**
- React 18
- React Router v6
- Axios
- Context API
- CSS3

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## 📝 Development Notes

### Adding New Features

1. **Backend**: Add new route → Create controller → Define model
2. **Frontend**: Create page component → Add route → Style with CSS
3. **API Integration**: Update `/src/utils/api.js`

### Code Structure Best Practices
- Keep components focused and reusable
- Use meaningful variable names
- Add comments for complex logic
- Separate styling into CSS files

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

ISC

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Made with 💚 for a sustainable community**

🌱 EcoLoop - Give items a second life
