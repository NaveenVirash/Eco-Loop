# 📁 EcoLoop Complete File Structure

```
Eco Loop/
│
├── 📄 README.md                      # Project overview & features
├── 📄 RUNNING.md                     # How to run the app
├── 📄 SETUP_GUIDE.md                 # Step-by-step installation
├── 📄 DEVELOPMENT_SUMMARY.md         # Complete development details
├── 🚀 start.bat                      # Windows quick start script
├── 🚀 start.sh                       # Mac/Linux quick start script
│
├── 📂 backend/                       # Node.js/Express API Server
│   │
│   ├── 📂 config/
│   │   └── db.js                    # MongoDB connection
│   │
│   ├── 📂 controllers/
│   │   ├── authController.js        # Register, login, get user
│   │   ├── productController.js     # Product CRUD operations
│   │   └── userController.js        # Admin user management
│   │
│   ├── 📂 models/
│   │   ├── User.js                  # User schema (with bcryptjs)
│   │   └── Product.js               # Product schema (with TTL)
│   │
│   ├── 📂 routes/
│   │   ├── authRoutes.js            # /api/auth endpoints
│   │   ├── productRoutes.js         # /api/products endpoints
│   │   └── userRoutes.js            # /api/users endpoints (admin)
│   │
│   ├── 📂 middlewares/
│   │   └── authMiddleware.js        # JWT & role verification
│   │
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Environment template
│   ├── package.json                 # Dependencies & scripts
│   ├── server.js                    # Main server file
│   ├── README.md                    # Backend documentation
│   └── 📂 node_modules/             # (Auto-generated after npm install)
│
└── 📂 frontend/                      # React Application
    │
    ├── 📂 public/
    │   └── index.html               # HTML entry point
    │
    ├── 📂 src/
    │   │
    │   ├── 📂 components/
    │   │   ├── Navbar.js            # Navigation bar
    │   │   ├── Navbar.css           # Navbar styling
    │   │   └── PrivateRoute.js      # Protected routes wrapper
    │   │
    │   ├── 📂 context/
    │   │   └── AuthContext.js       # Authentication state (global)
    │   │
    │   ├── 📂 pages/
    │   │   ├── Home.js              # Landing page
    │   │   ├── Home.css             # Home styling
    │   │   ├── Login.js             # Login page
    │   │   ├── Register.js          # Registration page
    │   │   ├── Auth.css             # Auth pages styling
    │   │   ├── UserDashboard.js     # User dashboard
    │   │   ├── AdminDashboard.js    # Admin dashboard
    │   │   └── Dashboard.css        # Dashboard styling
    │   │
    │   ├── 📂 utils/
    │   │   └── api.js               # Axios API calls & helpers
    │   │
    │   ├── App.js                   # Main app (routing)
    │   ├── App.css                  # App styling
    │   ├── index.js                 # React entry point
    │   ├── index.css                # Global styles
    │   │
    │   └── 📂 node_modules/         # (Auto-generated after npm install)
    │
    ├── .gitignore                   # Git ignore rules
    ├── package.json                 # Dependencies & scripts
    ├── README.md                    # Frontend documentation
    └── 📂 node_modules/             # (Auto-generated after npm install)
```

---

## 📊 Key Files Breakdown

### Backend Core
| File | Purpose |
|------|---------|
| `server.js` | Express app initialization |
| `config/db.js` | MongoDB connection |
| `.env` | API keys & database URI |

### Backend Controllers (Business Logic)
| File | Handles |
|------|---------|
| `controllers/authController.js` | User registration & login |
| `controllers/productController.js` | Product CRUD operations |
| `controllers/userController.js` | Admin user management |

### Backend Data Models
| File | Schema |
|------|--------|
| `models/User.js` | User collection (with password hashing) |
| `models/Product.js` | Product collection (with 30-day TTL) |

### Backend Routes
| File | Endpoints |
|------|-----------|
| `routes/authRoutes.js` | `/api/auth/*` |
| `routes/productRoutes.js` | `/api/products/*` |
| `routes/userRoutes.js` | `/api/users/*` (admin) |

### Backend Middleware
| File | Function |
|------|----------|
| `middlewares/authMiddleware.js` | JWT verification & role authorization |

---

### Frontend Pages (Complete Screens)
| File | Route | Purpose |
|------|-------|---------|
| `pages/Home.js` | `/` | Landing page |
| `pages/Login.js` | `/login` | User login |
| `pages/Register.js` | `/register` | User registration |
| `pages/UserDashboard.js` | `/dashboard` | User product management |
| `pages/AdminDashboard.js` | `/admin` | Admin panel |

### Frontend Components (Reusable Pieces)
| File | Purpose |
|------|---------|
| `components/Navbar.js` | Navigation bar |
| `components/PrivateRoute.js` | Route protection |

### Frontend State Management
| File | Purpose |
|------|---------|
| `context/AuthContext.js` | Global authentication state |

### Frontend Utilities
| File | Purpose |
|------|---------|
| `utils/api.js` | Centralized API calls |

---

## 🔄 File Dependencies Flow

```
Backend Request Flow:
routes/ → controllers/ → models/ → database

Frontend Request Flow:
components/pages → AuthContext → api.js → Backend

Authentication Flow:
Register/Login → AuthContext → JWT Token → LocalStorage
Protected Route → PrivateRoute → AuthContext → Redirect
```

---

## 📦 Important Configuration Files

### Backend
- `.env` - Environment variables (PORT, MONGO_URI, JWT_SECRET)
- `.env.example` - Template for environment variables
- `package.json` - Dependencies (express, mongoose, jwt, bcryptjs, etc.)
- `server.js` - Main entry point

### Frontend
- `package.json` - Dependencies (react, react-router, axios, etc.)
- `public/index.html` - HTML entry point
- `src/index.js` - React entry point
- `.gitignore` - Files to exclude from git

---

## 🎨 Styling Files

- `components/Navbar.css` - Navigation styling
- `pages/Home.css` - Home page styling
- `pages/Auth.css` - Login/Register styling
- `pages/Dashboard.css` - All dashboard styling
- `src/App.css` - App-wide styling
- `src/index.css` - Global styles

---

## 🔑 Critical Files to Edit

### To Add New Feature (Example):

**Backend:**
1. Update `models/YourModel.js` - Define schema
2. Create `controllers/yourController.js` - Business logic
3. Create `routes/yourRoutes.js` - Endpoints
4. Add route to `server.js`

**Frontend:**
1. Create `pages/YourPage.js` - New page
2. Update `App.js` - Add route
3. Create `pages/YourPage.css` - Styling
4. Update `utils/api.js` - Add API calls

---

## 📈 Lines of Code Distribution

```
Backend:
- Models: ~60 lines
- Controllers: ~150 lines
- Routes: ~50 lines
- Middleware: ~40 lines
- Config: ~10 lines
Total: ~310 lines

Frontend:
- Pages: ~600 lines
- Components: ~150 lines
- Context: ~100 lines
- Utils: ~80 lines
- Styles: ~800 lines
Total: ~1730 lines

Total Project: ~2000+ lines of code
```

---

## 📚 Finding Files by Purpose

### Need to modify authentication?
- `/backend/controllers/authController.js`
- `/backend/routes/authRoutes.js`
- `/backend/models/User.js`
- `/frontend/context/AuthContext.js`

### Need to modify products?
- `/backend/controllers/productController.js`
- `/backend/routes/productRoutes.js`
- `/backend/models/Product.js`
- `/frontend/pages/UserDashboard.js`
- `/frontend/utils/api.js`

### Need to modify styling?
- `/frontend/pages/Dashboard.css` - Main styling
- `/frontend/pages/Auth.css` - Auth pages
- `/frontend/pages/Home.css` - Home page
- `/frontend/components/Navbar.css` - Navigation

### Need to add new API endpoint?
1. Add controller method in `/backend/controllers/*.js`
2. Add route in `/backend/routes/*.js`
3. Import in `/backend/server.js`
4. Add API call in `/frontend/utils/api.js`

---

## 🚀 Deployment Ready Files

**To deploy backend:**
- `.env` (with production values)
- `package.json`
- `server.js` + all controllers, models, routes, middleware

**To deploy frontend:**
- Run `npm run build` to create `/build` folder
- Upload `/build` folder contents to hosting

---

## 🔍 Quick File Reference

| Need to... | File to Edit |
|-----------|-------------|
| Add user field | `/backend/models/User.js` |
| Add API endpoint | `/backend/routes/*.js` & `/backend/controllers/*.js` |
| Add page | `/frontend/src/pages/NewPage.js` |
| Change colors | `/frontend/pages/Dashboard.css` or individual CSS files |
| Fix authentication | `/backend/middlewares/authMiddleware.js` |
| Modify product fields | `/backend/models/Product.js` |
| Change navbar | `/frontend/components/Navbar.js` |
| Add navigation route | `/frontend/src/App.js` |

---

**Total Files Created: 33+**
**Backend: 11 files**
**Frontend: 17 files**
**Documentation: 6 files**

🎉 Everything is organized and ready to extend!
