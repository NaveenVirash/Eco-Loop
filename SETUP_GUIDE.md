# EcoLoop - Complete Setup & Running Guide

## 📋 Prerequisites Checklist

- [ ] Node.js installed (v14 or higher)
- [ ] npm installed
- [ ] MongoDB installed locally OR MongoDB Atlas account (cloud)
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## 🔧 Step 1: Install MongoDB

### Option A: Local MongoDB
1. Download from https://www.mongodb.com/try/download/community
2. Follow installation guide for your OS
3. Start MongoDB:
   ```bash
   mongod
   ```

### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/ecoloop`

## 🚀 Step 2: Backend Setup

### 2.1 Install Backend Dependencies
```bash
# Navigate to backend folder
cd "d:\Eco Loop\backend"

# Install all dependencies
npm install

# List of packages that will be installed:
# - express (web framework)
# - mongoose (MongoDB ODM)
# - jsonwebtoken (JWT auth)
# - bcryptjs (password hashing)
# - cors (cross-origin)
# - dotenv (environment variables)
# - nodemon (dev auto-reload)
```

### 2.2 Configure Environment Variables
```bash
# The .env file already exists, verify it has:
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecoloop
JWT_SECRET=supersecretkey_change_in_production
NODE_ENV=development

# For MongoDB Atlas, update MONGO_URI to your connection string
```

### 2.3 Start Backend Server
```bash
# Terminal 1: Navigate to backend
cd "d:\Eco Loop\backend"

# Option A: Development mode (auto-reload on changes)
npm run dev

# Option B: Production mode
npm start

# Expected output:
# Server running on port 5000
# MongoDB Connected: localhost
```

✅ Backend is now running at: `http://localhost:5000`

## 🎨 Step 3: Frontend Setup

### 3.1 Install Frontend Dependencies
```bash
# Terminal 2: Navigate to frontend (new terminal window)
cd "d:\Eco Loop\frontend"

# Install all dependencies
npm install

# This installs:
# - react (UI framework)
# - react-router-dom (routing)
# - axios (HTTP client)
# - react-scripts (build tools)
```

### 3.2 Start Frontend Server
```bash
# While backend is still running, start frontend
npm start

# Expected behavior:
# - Automatically opens browser to http://localhost:3000
# - React development server with hot reload
```

✅ Frontend is now running at: `http://localhost:3000`

## 📱 Step 4: Test the Application

### 4.1 Create User Account
1. Open http://localhost:3000
2. Click "Register"
3. Fill in details:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Role: User
4. Click "Register"

### 4.2 Test User Features
1. You'll be on User Dashboard at `/dashboard`
2. Click "+ New Product"
3. Add a product:
   - Title: "Wooden Chair"
   - Description: "Good condition, brown wooden chair"
   - Category: "Furniture"
   - Price: 25
4. Click "Upload Product"
5. Product appears in both "My Products" and "All Available Products"

### 4.3 Create Admin Account
1. Go to http://localhost:3000/register
2. Create another account:
   - Name: Admin User
   - Email: admin@example.com
   - Password: admin123
   - Role: Admin
3. Click "Register"

### 4.4 Test Admin Features
1. You'll see "Admin Dashboard" link in navbar
2. Click it to go to `/admin`
3. **Users Tab**: See all registered users with option to delete
4. **Products Tab**: See all products with:
   - Expiration countdown (days remaining)
   - Posted by information
   - Delete button for each product

### 4.5 Test Auto-Deletion
- Products automatically delete after 30 days
- Admin can manually delete products
- Check Products table for "days left" indicator

## 🔄 Development Workflow

### While Developing:

**Terminal 1 - Backend:**
```bash
cd "d:\Eco Loop\backend"
npm run dev
# Stays running, auto-reloads on file changes
```

**Terminal 2 - Frontend:**
```bash
cd "d:\Eco Loop\frontend"
npm start
# Stays running, auto-reloads on file changes
```

**Terminal 3 - Optional (Git/Admin commands):**
```bash
# Use for git commits, file management, etc.
```

## 🛠️ Making Changes

### Adding API Endpoint Example

1. **Backend**: Create in `/routes/productRoutes.js`
```javascript
router.get('/my-products', protect, getMyProducts);
```

2. **Backend**: Add controller in `/controllers/productController.js`
```javascript
exports.getMyProducts = async (req, res) => {
  // Implementation
};
```

3. **Frontend**: Add API call in `/src/utils/api.js`
```javascript
export const getMyProducts = () =>
  axios.get('/api/products/my-products', getAuthHeaders());
```

4. **Frontend**: Use in component
```javascript
const response = await productAPI.getMyProducts();
```

## 📦 Build for Production

### Frontend Build:
```bash
cd frontend
npm run build
# Creates optimized build in 'build' folder
# Ready to deploy to any hosting service
```

### Deploy Options:
- **Frontend**: Vercel, Netlify, GitHub Pages, AWS S3
- **Backend**: Heroku, Railway, AWS, DigitalOcean
- **Database**: MongoDB Atlas (free tier available)

## 🚨 Common Issues & Solutions

### Issue 1: "MongoDB connection failed"
**Solution:**
```bash
# Check if MongoDB is running
# For local: mongod should be running in separate terminal
# For Atlas: Verify connection string in .env
```

### Issue 2: "Port 5000 already in use"
**Solution:**
```bash
# Kill process using port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

### Issue 3: "CORS error in browser"
**Solution:**
- Make sure backend is running on port 5000
- Clear browser cache
- Check browser console for specific error

### Issue 4: "Module not found" errors
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: "JWT token expired"
**Solution:**
- Logout and login again
- Token lasts 30 days from login

## 📊 Project Statistics

**Backend Files**:
- 3 Controllers
- 2 Models
- 3 Routes
- 1 Middleware file
- 1 Config file

**Frontend Components**:
- 1 Navigation component
- 1 Private route wrapper
- 2 Auth pages (Login, Register)
- 1 User dashboard
- 1 Admin dashboard
- 1 Home page

**Total Dependencies**: ~40 packages

## 🔑 Key Features Implemented

✅ User Registration & Login (JWT-based)
✅ Two User Roles: Admin & User
✅ Product Management (Create, Read, Delete)
✅ Automatic 30-Day Product Deletion (MongoDB TTL)
✅ Admin User Management (View & Delete users)
✅ Admin Product Monitoring
✅ Password Hashing (bcryptjs)
✅ Protected Routes
✅ Responsive Design
✅ Professional UI/UX

## 📞 Support Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# List running processes on port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Clean install
rm -rf node_modules && npm install

# Check npm cache
npm cache verify

# Update npm
npm install -g npm@latest
```

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Backend npm install completed
- [ ] Backend running on port 5000 (npm run dev)
- [ ] Frontend npm install completed
- [ ] Frontend running on port 3000 (npm start)
- [ ] Can access http://localhost:3000
- [ ] Can register new account
- [ ] Can login with account
- [ ] Can upload product as user
- [ ] Can access admin dashboard as admin
- [ ] Can delete users/products as admin

## 🎉 You're All Set!

Your EcoLoop application is now fully functional!

- 👤 Users can register, login, and manage products
- 👨‍💼 Admins can manage users and products
- 🗑️ Products auto-delete after 30 days
- 🎨 Beautiful, responsive UI
- 🔐 Secure with JWT & password hashing

**Happy developing! 🚀**
