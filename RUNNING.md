# 🚀 How to Run EcoLoop

## Prerequisites
Before you start, make sure you have:
- ✅ Node.js installed (v14+)
- ✅ MongoDB installed or MongoDB Atlas account
- ✅ Both folders have dependencies installed (run `npm install` in each)

## ⚡ Quick Start (Easiest Way)

### Windows:
Double-click the `start.bat` file in the project root
```bash
start.bat
```
This will automatically:
- Install dependencies (if needed)
- Start backend on port 5000
- Start frontend on port 3000
- Open browser automatically

### Mac/Linux:
```bash
bash start.sh
```

---

## 🔧 Manual Startup (3 Terminal Windows)

### Terminal 1: Ensure MongoDB is Running
```bash
# Make sure MongoDB is running first!
mongod
# For MongoDB Atlas: skip this and ensure connection string is in .env
```

### Terminal 2: Start Backend
```bash
cd backend
npm run dev
# You should see: "Server running on port 5000"
# You should see: "MongoDB Connected"
```

### Terminal 3: Start Frontend
```bash
cd frontend
npm start
# Browser will automatically open to http://localhost:3000
```

---

## 📱 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Endpoints**: http://localhost:5000/api/auth, /api/products, /api/users

---

## ✅ Verify Everything is Working

1. **Frontend loads**: http://localhost:3000 shows the home page
2. **Can register**: Go to /register, create account
3. **Can login**: Go to /login, login with credentials
4. **User dashboard**: Can upload and manage products
5. **Admin dashboard**: Admin account can manage users/products

---

## 📝 Create Test Accounts

### User Account
- Email: `user@example.com`
- Password: `password123`
- Role: `User`

### Admin Account
- Email: `admin@example.com`
- Password: `admin123`
- Role: `Admin`

---

## 🛑 Stop the Application

**If running manually:**
- Terminal 1: `Ctrl + C` (stop MongoDB)
- Terminal 2: `Ctrl + C` (stop backend)
- Terminal 3: `Ctrl + C` (stop frontend)

**If using start script:**
- Click the X button on both windows OR
- Terminal: `Ctrl + C` to stop all processes

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB is running
- Check `.env` file exists
- Try: `rm -rf node_modules && npm install`

**Frontend won't start:**
- Check backend is running first (port 5000 must be active)
- Clear browser cache
- Try: `rm -rf node_modules && npm install`

**Can't login:**
- Make sure you registered first
- Check email/password is correct
- Try clearing localStorage in browser

**MongoDB connection failed:**
- Local: Run `mongod` in separate terminal
- Atlas: Verify connection string in `.env`

---

## 📊 Project Structure

```
Eco Loop/
├── backend/           ← Node.js API server
├── frontend/          ← React app
├── README.md          ← Project overview
├── SETUP_GUIDE.md     ← Detailed setup
├── DEVELOPMENT_SUMMARY.md ← What was built
├── start.bat          ← Windows quick start
└── start.sh           ← Mac/Linux quick start
```

---

## 🎯 What Can You Do?

### As User:
- Register & login
- Upload products
- View all products
- Delete your own products
- See auto-deletion countdown

### As Admin:
- Register & login as admin
- View all users
- Delete users
- View all products
- Delete any product
- Monitor expiration dates

---

## 📚 Documentation

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Step-by-step setup
- `backend/README.md` - API documentation
- `frontend/README.md` - Frontend guide
- `DEVELOPMENT_SUMMARY.md` - Complete development info

---

## 🎓 Learning Resources

The project uses:
- **Express.js**: REST API framework
- **MongoDB**: NoSQL database
- **React**: Frontend library
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing

Check the documentation files for detailed explanations.

---

## 🚀 Next Steps After Running

1. **Test the app**: Register, login, create products
2. **Explore code**: Check backend routes and React components
3. **Read docs**: Check SETUP_GUIDE.md and README.md
4. **Build on it**: Add features or deploy

---

## 📞 Quick Commands Reference

```bash
# Backend
cd backend && npm run dev        # Start with auto-reload
cd backend && npm start          # Start production

# Frontend  
cd frontend && npm start         # Start dev server
cd frontend && npm run build     # Build for production

# Database
mongod                           # Start MongoDB locally

# Clean install
rm -rf node_modules && npm install
```

---

**Your EcoLoop app is ready to use! 🌱**

Happy developing! 💚
