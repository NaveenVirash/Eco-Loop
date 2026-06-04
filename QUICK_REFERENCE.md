# ⚡ EcoLoop Quick Reference Card

## 🎯 Start Here - 3 Steps

```bash
# Step 1: Open terminal and run
cd "d:\Eco Loop"
start.bat              # Windows
# OR
bash start.sh          # Mac/Linux

# Step 2: Wait for both servers to start
# Terminal 1: Backend running on http://localhost:5000
# Terminal 2: Frontend opening http://localhost:3000

# Step 3: Test the app
Visit http://localhost:3000 in browser
```

---

## 🧪 Test Accounts

### User Account
```
Email: user@example.com
Password: password123
Role: User
```

### Admin Account
```
Email: admin@example.com
Password: admin123
Role: Admin
```

---

## 📍 URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React app |
| Backend API | http://localhost:5000 | Express API |
| User Dashboard | http://localhost:3000/dashboard | Product management |
| Admin Dashboard | http://localhost:3000/admin | User & product mgmt |

---

## 🔑 Key Files

```
Backend:
- server.js              → Main server
- controllers/*.js       → Business logic
- models/*.js            → Database schemas
- routes/*.js            → API endpoints

Frontend:
- App.js                 → Main app & routing
- pages/*.js             → Full pages
- components/*.js        → Reusable components
- context/AuthContext.js → Authentication state
```

---

## 📡 Main API Endpoints

```
POST   /api/auth/register        → Register user
POST   /api/auth/login           → Login user
GET    /api/auth/me              → Get current user

GET    /api/products             → Get all products
POST   /api/products             → Create product
DELETE /api/products/:id         → Delete product

GET    /api/users                → Get all users (admin)
DELETE /api/users/:id            → Delete user (admin)
```

---

## 💻 Commands

```bash
# Backend
npm run dev              → Start with auto-reload
npm start                → Start production mode

# Frontend
npm start                → Start dev server
npm run build            → Build for production

# Database
mongod                   → Start MongoDB locally
```

---

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Backend won't start | Check MongoDB running, check .env |
| Frontend won't connect | Ensure backend on port 5000 |
| Can't login | Register first, check email/password |
| CORS error | Clear cache, restart servers |
| Port in use | Change PORT in .env |

---

## 🔐 Features

**User Can:**
- ✅ Register/Login
- ✅ Upload products
- ✅ Delete own products
- ✅ View all products
- ✅ See expiration date

**Admin Can:**
- ✅ View all users
- ✅ Delete users
- ✅ View all products
- ✅ Delete any product
- ✅ Monitor expirations

**System:**
- ✅ Auto-delete after 30 days
- ✅ JWT authentication
- ✅ Password hashing
- ✅ Role-based access

---

## 📚 Documentation

| Doc | For |
|-----|-----|
| [RUNNING.md](RUNNING.md) | How to run |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed setup |
| [README.md](README.md) | Project info |
| [DEVELOPMENT_SUMMARY.md](DEVELOPMENT_SUMMARY.md) | What was built |
| [FILE_STRUCTURE.md](FILE_STRUCTURE.md) | File locations |
| [backend/README.md](backend/README.md) | API docs |
| [frontend/README.md](frontend/README.md) | Frontend docs |
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | Doc guide |

---

## 🚀 Deploy

```bash
# Backend: Heroku, Railway, AWS
# Frontend: Vercel, Netlify, AWS S3
# Database: MongoDB Atlas (free)
```

---

## 📊 Quick Stats

- **Backend**: 11 files
- **Frontend**: 17 files  
- **Docs**: 8 files
- **Total Code**: 2000+ lines
- **API Endpoints**: 9
- **Database Models**: 2

---

## ✅ Verification

- [ ] MongoDB running
- [ ] Backend on port 5000
- [ ] Frontend on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register & login
- [ ] Can upload product
- [ ] Can delete product
- [ ] Admin can delete users

---

## 🎓 Tech Stack

```
Backend:  Node.js + Express + MongoDB + JWT
Frontend: React + React Router + Axios
Auth:     bcryptjs + JWT tokens
```

---

## 🌟 Next Steps

1. Run the app ([RUNNING.md](RUNNING.md))
2. Test all features
3. Read [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
4. Explore code
5. Build on it or deploy

---

## 💚 You Have

✅ Complete MERN stack
✅ Production-ready code  
✅ All documentation
✅ Quick start scripts
✅ Test accounts
✅ Troubleshooting guide

**Everything is ready to use! 🚀**

---

*Last Updated: May 2026*
*For detailed info: See DOCUMENTATION_INDEX.md*
