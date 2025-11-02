# 📖 COMPLETE SETUP GUIDE - Clover Inventory Pro

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Clover Integration](#clover-integration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **Node.js**: 20.x or higher
- **npm**: 9.x or higher (comes with Node.js)
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **RAM**: 4 GB
- **Storage**: 500 MB free space
- **Browser**: Chrome 90+, Firefox 88+, Edge 90+

### Installation Check
```bash
node --version    # Should be v20.x or higher
npm --version     # Should be 9.x or higher
```

---

## Installation

### Step 1: Extract Project Files
```bash
# Extract the clover-inventory-pro.zip file
# Navigate to the project directory
cd clover-inventory-pro
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install

# This will install:
# - express (web framework)
# - cors (cross-origin requests)
# - jsonwebtoken (JWT auth)
# - bcryptjs (password hashing)
# - better-sqlite3 (database)
# - axios (HTTP client)
# - dotenv (environment variables)
# - uuid (unique IDs)
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install

# This will install:
# - react (UI library)
# - react-dom (DOM rendering)
# - react-router-dom (routing)
# - axios (HTTP client)
# - react-scripts (build tools)
```

---

## Configuration

### Backend Configuration

1. **Create Environment File**
```bash
cd backend
cp .env.example .env
```

2. **Edit .env with Your Settings**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_PATH=./database/inventory.db

# JWT (Keep secret secure!)
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRE=24h

# CORS (Frontend URL)
CORS_ORIGIN=http://localhost:3000

# Clover (Optional - get from developer.clover.com)
CLOVER_APP_ID=your_app_id
CLOVER_APP_SECRET=your_app_secret
CLOVER_ENVIRONMENT=sandbox
```

### Frontend Configuration

1. **Create Environment File**
```bash
cd ../frontend
touch .env
```

2. **Add Configuration**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Database Setup

### Initialize Database

1. **From Backend Directory**
```bash
cd backend
npm run init-db
```

2. **Expected Output**
```
✅ Database initialized successfully
✅ Indexes created successfully
Database file location: ./database/inventory.db
```

### Database Details
- **Type**: SQLite 3
- **Location**: `database/inventory.db`
- **Tables**: 11 (users, products, inventory, etc.)
- **Indexes**: 9 (for performance optimization)
- **Size**: Grows as data is added (starts ~1 MB)

---

## Running the Application

### Method 1: Terminal (Recommended for Testing)

**Terminal 1 - Backend**
```bash
cd backend
npm start

# Expected output:
# ✅ Server started successfully
# 📍 Base URL: http://localhost:5000
# 🔗 API Documentation: http://localhost:5000/api
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm start

# Expected output:
# Compiled successfully!
# You can now view clover-inventory-pro-frontend in the browser.
#   Local:  http://localhost:3000
```

### Method 2: VS Code Debug

1. Open project in VS Code
2. Go to Run and Debug (Ctrl+Shift+D)
3. Select "Backend - Debug"
4. Click the green play button
5. In another terminal: `cd frontend && npm start`

### Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## Initial Setup Steps

### 1. Create Admin User

First, you need to set up the authentication. The easiest way is via API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "full_name": "Administrator",
    "role": "admin"
  }'
```

### 2. Login to Application
1. Open http://localhost:3000
2. Enter:
   - Email: `admin@example.com`
   - Password: `SecurePassword123`
3. Click Login

### 3. Create Your First Location
1. Navigate to Settings (gear icon)
2. Click "Locations"
3. Click "Add Location"
4. Fill in details:
   - Name: Main Store
   - Address: Your address
   - City: Your city
   - State: Your state
   - ZIP: Your ZIP
5. Click Save

### 4. Add Products
1. Go to Products section
2. Click "Add Product"
3. Fill in:
   - SKU: PROD-001
   - Name: Product Name
   - Price: 9.99
   - Cost: 5.00
   - Category: Electronics (or your category)
   - Reorder Point: 10
   - Reorder Quantity: 50
4. Click Save

### 5. Set Inventory
1. Go to Inventory section
2. Click "Adjust Stock"
3. Select your product and location
4. Enter quantity and reason
5. Click Save

---

## Clover Integration

### Prerequisites
- Clover Developer Account (free at developer.clover.com)
- Your own Clover merchant account

### Setup Instructions

1. **Get Clover Credentials**
   - Go to https://developer.clover.com
   - Create a new application
   - Get your App ID and App Secret
   - Note your Sandbox API URL

2. **Update Backend .env**
```env
CLOVER_APP_ID=com.example.yourapp
CLOVER_APP_SECRET=abcd1234efgh5678ijkl9012mnop3456
CLOVER_ENVIRONMENT=sandbox
CLOVER_SANDBOX_URL=https://sandbox.clover.com
```

3. **In Application**
   - Go to Settings > Clover Integration
   - Click "Connect to Clover"
   - Authorize the application
   - Select your merchant and location
   - Click "Import Products"

4. **Sync Options**
   - **Import**: Clover → Local Database
   - **Export**: Local Database → Clover
   - **Bidirectional**: Both directions

---

## Testing the Application

### API Testing with cURL

**Health Check**
```bash
curl http://localhost:5000/api/health
```

**Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecurePassword123"}'
```

**Get Current User**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**List Products**
```bash
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Frontend Testing

1. **Check Console**: Open DevTools (F12), go to Console
2. **Check Network**: Monitor API calls in Network tab
3. **Test Navigation**: Click all menu items
4. **Test CRUD**: Create, read, update, delete items

---

## Troubleshooting

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Option 1: Change the port
# Edit backend/.env and set PORT=5001

# Option 2: Kill process using port
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000 | kill -9 PID
```

### Issue: "Cannot find module 'better-sqlite3'"
**Solution:**
```bash
cd backend
npm install --build-from-source
# Or reinstall from scratch
rm -rf node_modules package-lock.json
npm install
```

### Issue: "CORS error: Access denied"
**Solution:**
Check that `CORS_ORIGIN` in backend `.env` matches your frontend URL:
```env
CORS_ORIGIN=http://localhost:3000  # For localhost
CORS_ORIGIN=http://192.168.1.100:3000  # For network access
```

### Issue: "Database file not found"
**Solution:**
```bash
cd backend
npm run init-db
```

### Issue: "Invalid token / 401 Unauthorized"
**Solution:**
1. Make sure `JWT_SECRET` is set in `.env`
2. Token expires after 24 hours - login again
3. Ensure token is sent in Authorization header: `Bearer YOUR_TOKEN`

### Issue: Frontend shows "Cannot connect to API"
**Solution:**
1. Check backend is running: http://localhost:5000/api/health
2. Verify `REACT_APP_API_URL` in frontend `.env`
3. Check browser console (F12) for detailed error messages

### Issue: "EACCES permission denied"
**Solution:**
```bash
# On Mac/Linux, use sudo
sudo npm install
sudo npm start
```

### Issue: "npm ERR! code ENOTFOUND"
**Solution:**
This usually means npm cannot reach the registry:
```bash
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm install
```

---

## Performance Tips

1. **Database**: Restart the app occasionally to clear memory
2. **Network**: Ensure good internet connection for Clover sync
3. **Frontend**: Close unused tabs for better performance
4. **Backend**: Monitor logs for slow queries

---

## Security Best Practices

1. **Change JWT_SECRET**: Use a strong, unique secret
2. **Use HTTPS**: In production, always use HTTPS
3. **Firewall**: Restrict backend access to trusted IPs
4. **Backups**: Regularly backup your database file
5. **Updates**: Keep Node.js and dependencies updated

```bash
# Check for security vulnerabilities
npm audit
npm audit fix
```

---

## Backup & Restore

### Backup Database
```bash
# Windows
copy database\inventory.db database\inventory.db.backup

# Mac/Linux
cp database/inventory.db database/inventory.db.backup
```

### Restore Database
```bash
# Windows
copy database\inventory.db.backup database\inventory.db

# Mac/Linux
cp database/inventory.db.backup database/inventory.db
```

---

## Upgrading Dependencies

```bash
# Check for updates
npm outdated

# Update all packages
npm update

# Update to latest major versions (careful!)
npm install -g npm-check-updates
ncu -u
npm install
```

---

## Next Steps

1. ✅ Verify everything is running
2. ✅ Create test data (locations, products)
3. ✅ Learn the API endpoints (see API_DOCUMENTATION.md)
4. ✅ Set up Clover integration (optional)
5. ✅ Configure backup strategy
6. ✅ Deploy to production (if needed)

---

## Support Resources

- **Full README**: See README.md
- **API Documentation**: docs/API_DOCUMENTATION.md
- **User Guide**: docs/USER_GUIDE.md
- **Clover Integration**: docs/CLOVER_INTEGRATION.md

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready
