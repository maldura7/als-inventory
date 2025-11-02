# 📦 Clover Inventory Pro

## Enterprise Inventory Management System with Clover POS Integration

Clover Inventory Pro is a production-ready, full-stack inventory management system designed for retail businesses using Clover POS. It provides real-time inventory tracking, multi-location support, purchase order management, and comprehensive reporting.

---

## ✨ Features

### Core Features
- ✅ **Multi-Location Inventory**: Manage inventory across unlimited store locations
- ✅ **Real-time Stock Tracking**: Live inventory levels with automatic updates
- ✅ **Clover POS Integration**: Bidirectional sync with Clover Point-of-Sale
- ✅ **Purchase Order Management**: Create, track, and receive purchase orders
- ✅ **Inventory Transfers**: Move stock between locations with audit trails
- ✅ **Supplier Management**: Maintain supplier information and contact details
- ✅ **Comprehensive Reports**: Inventory valuation, low stock, ABC analysis, turnover rates
- ✅ **User Management**: Role-based access control (Admin, Manager, Staff)
- ✅ **Audit Logging**: Complete audit trail of all system operations
- ✅ **Low Stock Alerts**: Automatic notifications for reorder points

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js 20.x
- Express.js 4.18
- SQLite 3 (with better-sqlite3)
- JWT Authentication
- bcryptjs Password Hashing

**Frontend:**
- React 18.x
- React Router v6
- Axios HTTP Client
- CSS3

**External Integrations:**
- Clover API (OAuth 2.0)
- RESTful API

### Database Schema
The system uses 11 interconnected tables:
- `users` - User accounts and authentication
- `locations` - Store/warehouse locations
- `products` - Product catalog
- `inventory` - Stock levels by location
- `suppliers` - Vendor information
- `purchase_orders` - Purchase orders
- `purchase_order_items` - PO line items
- `stock_movements` - Inventory transaction history
- `transfers` - Inter-location transfers
- `transfer_items` - Transfer line items
- `audit_log` - System audit trail

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- SQLite 3

### Installation

1. **Clone/Extract Project**
```bash
cd clover-inventory-pro
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run init-db
npm start
```

3. **Frontend Setup** (in another terminal)
```bash
cd frontend
npm install
npm start
```

4. **Access Application**
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- API Health: http://localhost:5000/api/health

---

## 🔐 Authentication & Security

### Default Admin User Setup
On first run, create an admin account via the registration endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure_password",
    "full_name": "Administrator",
    "role": "admin"
  }'
```

### User Roles
- **Admin**: Full system access, user management
- **Manager**: Location management, reporting
- **Staff**: Basic inventory operations

### Security Features
- JWT token-based authentication (24-hour expiry)
- Bcrypt password hashing (10 salt rounds)
- SQL injection prevention (parameterized queries)
- CORS configuration
- Audit logging for all operations

---

## 🔗 Clover POS Integration

### Setup Steps

1. **Register Clover Application**
   - Go to clover.com/developers
   - Create a new application
   - Get your App ID and App Secret

2. **Configure Environment**
```env
CLOVER_APP_ID=your_app_id
CLOVER_APP_SECRET=your_app_secret
CLOVER_ENVIRONMENT=sandbox  # or production
```

3. **OAuth Authorization Flow**
   - Click "Connect to Clover" in the app
   - Authorize the application
   - Select merchant and location
   - System imports products and inventory

4. **Bidirectional Sync**
   - **Import**: Syncs Clover products to local database
   - **Export**: Updates Clover inventory with local quantities
   - **Auto-sync**: Scheduled synchronization (configurable)

### API Endpoints
```
POST   /api/clover/auth-url              - Get authorization URL
GET    /api/clover/auth-callback         - OAuth callback handler
GET    /api/clover/merchant-info         - Get merchant information
POST   /api/clover/import-products       - Import products from Clover
POST   /api/clover/export-inventory      - Export inventory to Clover
GET    /api/clover/sync-status           - Check sync status
POST   /api/clover/manual-sync           - Trigger manual synchronization
```

---

## 📊 API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register (admin only)
GET  /api/auth/me
PUT  /api/auth/change-password
```

### Products
```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/categories/all
```

### Inventory
```
GET    /api/inventory
GET    /api/inventory/product/:productId
POST   /api/inventory/adjust
GET    /api/inventory/report/low-stock
GET    /api/inventory/movements/history
```

### Locations
```
GET    /api/locations
GET    /api/locations/:id
POST   /api/locations
PUT    /api/locations/:id
DELETE /api/locations/:id
GET    /api/locations/:id/inventory
```

### Purchase Orders
```
GET    /api/purchase-orders
GET    /api/purchase-orders/:id
POST   /api/purchase-orders
PUT    /api/purchase-orders/:id/status
POST   /api/purchase-orders/:id/receive
```

### Suppliers
```
GET    /api/suppliers
GET    /api/suppliers/:id
POST   /api/suppliers
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id
```

### Transfers
```
GET    /api/transfers
GET    /api/transfers/:id
POST   /api/transfers
PUT    /api/transfers/:id/status
POST   /api/transfers/:id/receive
```

### Reports
```
GET    /api/reports/inventory-value
GET    /api/reports/low-stock
GET    /api/reports/stock-movements
GET    /api/reports/abc-analysis
GET    /api/reports/turnover
GET    /api/reports/location-summary
```

---

## 📁 Project Structure

```
clover-inventory-pro/
├── backend/
│   ├── routes/              # API endpoints
│   ├── middleware/          # Authentication & validation
│   ├── services/            # Clover integration service
│   ├── database/            # Database initialization
│   ├── server.js            # Express server
│   ├── package.json         # Dependencies
│   └── .env.example         # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   ├── utils/           # Utilities
│   │   ├── App.js           # Main app
│   │   ├── index.js         # Entry point
│   │   └── App.css          # Styles
│   ├── public/              # Static files
│   ├── package.json         # Dependencies
│   └── .env                 # Frontend config
│
├── database/
│   ├── init-database.js     # Schema initialization
│   └── inventory.db         # SQLite database
│
└── README.md                # This file
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=5000
NODE_ENV=development
DB_PATH=./database/inventory.db
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRE=24h
CORS_ORIGIN=http://localhost:3000
CLOVER_APP_ID=your_app_id
CLOVER_APP_SECRET=your_app_secret
CLOVER_ENVIRONMENT=sandbox
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing

### API Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get all products
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a location
curl -X POST http://localhost:5000/api/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Main Store",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }'
```

---

## 📦 Deployment Options

### Option 1: Local Network
1. Set `CORS_ORIGIN` to your network IP
2. Run on a dedicated machine
3. Access via `http://YOUR_IP:3000`

### Option 2: Cloud (AWS/Azure)
1. Create EC2/VM instance
2. Deploy backend to Node.js runtime
3. Deploy frontend to S3 + CloudFront
4. Use RDS for production database (PostgreSQL recommended)

### Option 3: Docker
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD npm start
```

---

## 📈 Performance Optimization

### Database
- Indexes on frequently queried columns
- Parameterized queries to prevent SQL injection
- Connection pooling ready

### Frontend
- Code splitting with React Router
- Lazy loading for routes
- Memoization for components

### Backend
- Response caching headers
- Pagination on list endpoints (default 20 items)
- Database query optimization

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Reinitialize database
npm run init-db
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

### CORS Error
- Check `CORS_ORIGIN` in backend .env
- Ensure frontend URL matches

### Token Expired
- Token expires after 24 hours
- User needs to log in again

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Support & Contact

### Documentation
- Full API docs available in `/docs/API_DOCUMENTATION.md`
- User guide in `/docs/USER_GUIDE.md`
- Deployment guide in `/docs/DEPLOYMENT_GUIDE.md`
- Clover integration guide in `/docs/CLOVER_INTEGRATION.md`

### Troubleshooting
- Check logs: `backend/server.js` output
- Database file: `database/inventory.db`
- Browser console for frontend errors

---

## ✅ System Readiness Checklist

- [ ] Node.js 20.x installed
- [ ] Database initialized
- [ ] Backend configured (.env)
- [ ] Frontend configured (.env)
- [ ] Clover API credentials obtained (optional)
- [ ] First admin user created
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can log in to application
- [ ] Can create products and inventory

---

## 🎯 Next Steps

1. **Create Your First Location**
   - Navigate to Settings > Locations
   - Add your store information

2. **Add Products**
   - Go to Products section
   - Create or import product catalog

3. **Set Up Inventory**
   - Add opening inventory balances
   - Configure reorder points

4. **Connect Clover** (Optional)
   - Follow Clover integration guide
   - Import products and sync inventory

5. **Generate Reports**
   - View inventory valuation
   - Monitor stock levels
   - Analyze sales trends

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready  
**Support:** Available

---

*Clover Inventory Pro - Enterprise-Grade Inventory Management*
