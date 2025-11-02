# 🚀 QUICK START GUIDE - Clover Inventory Pro

Get up and running in 5 minutes!

## Step 1: Backend Setup (2 minutes)

```bash
cd backend
npm install
cp .env.example .env
npm run init-db
npm start
```

**Expected Output:**
```
✅ Database initialized successfully
✅ Indexes created successfully
✅ Server started successfully
📍 Base URL: http://localhost:5000
🔗 API Documentation: http://localhost:5000/api
🌍 Environment: development
```

## Step 2: Frontend Setup (2 minutes)

```bash
cd frontend
npm install
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view clover-inventory-pro-frontend in the browser.
  Local:            http://localhost:3000
```

## Step 3: Create Admin Account (1 minute)

Open new terminal and run:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

**Note:** For first admin, you may need to modify the authentication middleware temporarily or use a pre-generated token.

## Step 4: Log In

1. Open http://localhost:3000 in your browser
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `AdminPassword123`
3. Click Login

## ✅ You're Ready!

Start by:
1. Creating locations (Settings > Locations)
2. Adding products (Products section)
3. Setting up inventory (Inventory section)
4. Creating purchase orders (if needed)

---

## 🔧 Quick Configuration

### Change Backend Port
Edit `backend/.env`:
```env
PORT=8000
```

### Change Frontend API URL
Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### Enable Clover Integration
Edit `backend/.env`:
```env
CLOVER_APP_ID=your_app_id
CLOVER_APP_SECRET=your_app_secret
CLOVER_ENVIRONMENT=sandbox
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 already in use | Change PORT in backend/.env to 5001 |
| Port 3000 already in use | Frontend will ask to use 3001 |
| Database error | Run `npm run init-db` again |
| CORS error | Check CORS_ORIGIN in backend/.env |
| Can't connect to backend | Ensure backend is running on port 5000 |

---

## 📚 Next Steps

- Read full [README.md](./README.md) for detailed documentation
- Check [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for all endpoints
- See [CLOVER_INTEGRATION.md](./docs/CLOVER_INTEGRATION.md) for POS setup
- Review [USER_GUIDE.md](./docs/USER_GUIDE.md) for features

---

## 🎯 Common Tasks

### Create a Location
```bash
curl -X POST http://localhost:5000/api/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Main Store",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "phone": "555-1234",
    "email": "store@example.com"
  }'
```

### Create a Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sku": "PROD-001",
    "name": "Laptop",
    "description": "High-performance laptop",
    "category": "Electronics",
    "cost": 500,
    "price": 999.99,
    "barcode": "1234567890123",
    "reorder_point": 10,
    "reorder_quantity": 50
  }'
```

### Add Inventory
```bash
curl -X POST http://localhost:5000/api/inventory/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product_id": "PRODUCT_ID",
    "location_id": "LOCATION_ID",
    "quantity": 100,
    "reason": "Opening inventory"
  }'
```

---

**Need help?** Check the documentation files or review error messages in the browser console.

Good luck! 🎉
