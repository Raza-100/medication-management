# 💊 Personal Medication Management System
## Full-Stack Web Application with MySQL Database

A complete, production-ready web application for managing medications, tracking adherence, monitoring health conditions, and managing refill orders. Built with modern technologies and designed for accessibility and ease of use.

---

## 📋 Project Overview

**Purpose:** Help patients manage their medication schedules, track medication adherence, monitor health conditions, and reorder prescriptions in one integrated platform.

**Technology Stack:**
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js with Express.js
- **Database:** MySQL 8.0+
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcrypt hashing

**Key Features:**
- User authentication and account management
- Complete medication inventory management
- Medication reminder and tracking system
- Adherence logging and statistics
- Low stock alerts
- Prescription order management
- Health condition tracking
- Comprehensive dashboard with analytics
- Responsive mobile-first design
- Real-time notifications

---

## 🏗️ Project Structure

```
medication-management-system/
│
├── database.sql              # MySQL database schema
├── server.js                 # Express.js backend
├── package.json              # Node.js dependencies
├── .env.example              # Environment configuration template
├── index.html                # Frontend application
└── README.md                 # This file
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+ recommended)
- MySQL Server (v5.7+)
- npm or yarn
- Git

### Step 1: Clone/Download Project Files

```bash
# Create project directory
mkdir med-management && cd med-management

# Copy all project files into this directory
# Ensure you have: database.sql, server.js, package.json, index.html, .env.example
```

### Step 2: Set Up Database

```bash
# Open MySQL command line
mysql -u root -p

# Run the database setup script
source database.sql;

# Or copy-paste the contents of database.sql into MySQL Workbench
```

**Verify database creation:**
```sql
USE med_management;
SHOW TABLES;
```

You should see these tables:
- users
- health_conditions
- medications
- schedules
- adherence_log
- orders
- order_items
- notifications

### Step 3: Install Node.js Dependencies

```bash
# Navigate to project directory
cd medication-management-system

# Install dependencies
npm install

# Verify installation
npm list
```

### Step 4: Configure Environment Variables

```bash
# Copy example config
cp .env.example .env

# Edit .env with your settings
nano .env
# or use your preferred editor
```

**Important settings:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=med_management
JWT_SECRET=use_a_strong_random_string_here
PORT=5000
```

### Step 5: Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start

# Expected output:
# 🏥 Medication Management Server running on http://localhost:5000
```

### Step 6: Open Frontend in Browser

```bash
# Method 1: Direct file access
# Open index.html in your web browser
# File → Open → Select index.html

# Method 2: Using Python HTTP Server
python -m http.server 8000
# Then visit http://localhost:8000

# Method 3: Using Node.js http-server
npm install -g http-server
http-server
# Then visit http://localhost:8080
```

---

## 🔐 User Authentication

### Default Test Account (After DB Setup)

**Email:** john@example.com  
**Password:** (You'll need to create this through the registration form)

To add test users, create accounts through the application's Sign Up form.

### Register New Account
1. Click "Sign Up" on the login page
2. Fill in your details (Name, Email, DOB, Phone)
3. Create a password
4. Click "Create Account"

### Login
1. Use your email and password
2. System creates JWT token valid for 24 hours
3. Token stored in browser's localStorage

---

## 📱 User Interface Guide

### Dashboard (Home)
- Overview of today's medications
- Taken/Pending/Missed count
- Primary health condition
- Low stock alerts
- Quick actions to mark medications

### My Pills (Medications)
- View all active medications
- Add new medications
- See stock levels
- Manage prescriptions

### My Tracker (Adherence)
- Track medication intake
- Mark pills as Taken/Skipped
- View history
- See adherence statistics

### Orders
- View all medication orders
- Place new refill orders
- Track order status
- Filter by pending/completed

### Health Report
- 30-day adherence percentage
- Breakdown of taken/skipped/missed
- Recent activity timeline
- Health metrics

---

## 🔌 API Endpoints Reference

### Authentication
```
POST   /api/auth/register      - Create new user account
POST   /api/auth/login         - Login and get JWT token
```

### Dashboard
```
GET    /api/dashboard          - Get dashboard summary
```

### Medications
```
GET    /api/medications        - List user's medications
GET    /api/medications/:id    - Get specific medication with schedules
POST   /api/medications        - Add new medication
PATCH  /api/medications/:id/stock - Update medication stock
```

### Schedules
```
GET    /api/schedules/today    - Get today's medication schedule
POST   /api/schedules          - Add schedule for medication
```

### Adherence
```
POST   /api/adherence          - Log medication taken/skipped
GET    /api/adherence/history  - Get adherence history
GET    /api/adherence/stats    - Get adherence statistics
```

### Orders
```
GET    /api/orders             - Get all user orders
POST   /api/orders             - Create new order
PATCH  /api/orders/:id/status  - Update order status
```

### Health Conditions
```
GET    /api/health-conditions  - Get user's health conditions
POST   /api/health-conditions  - Add new health condition
```

### Notifications
```
GET    /api/notifications      - Get user notifications
PATCH  /api/notifications/:id/read - Mark notification as read
```

### Example API Call (Frontend)
```javascript
// Get user's medications
const response = await fetch('http://localhost:5000/api/medications', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
const medications = await response.json();
```

---

## 🗄️ Database Schema Overview

### users
- Stores user accounts with hashed passwords
- Email unique constraint
- Timestamp tracking for audits

### medications
- Links to users (one-to-many)
- Tracks dosage, frequency, stock quantity
- Reorder threshold for alerts

### schedules
- Links medications to specific times
- Days of week configuration
- Support for date ranges

### adherence_log
- Records every dose (taken/skipped/missed)
- Tracks actual vs scheduled time
- History for compliance reporting

### orders
- Medication refill requests
- Status tracking (pending → shipped → delivered)
- Pharmacy and delivery information

### order_items
- Individual items in each order
- Quantity and pricing
- Links to medications

### health_conditions
- Patient's medical conditions
- Diagnosis dates
- Primary condition flag

### notifications
- System alerts and reminders
- Read/unread status
- Multiple notification types

---

## 🎨 Design Features

### Color Palette
- **Primary Blue:** #4A90E2 (Actions, highlights)
- **Success Green:** #66BB6A (Taken, positive)
- **Warning Orange:** #FFA726 (Pending, caution)
- **Danger Red:** #EF5350 (Missed, critical)
- **Light Background:** #F5F7FA
- **White Cards:** #FFFFFF

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1200px
- Mobile: < 768px

### Accessibility
- Large, tappable buttons (48px minimum)
- Clear status indicators with colors + text
- Simple, jargon-free labels
- Semantic HTML structure
- ARIA labels where needed

---

## 🚀 Common Tasks

### Add a New Medication
1. Click "Add Medicine" button
2. Enter medicine name, dosage, frequency
3. Set stock quantity and reorder threshold
4. Click "Add Medicine"
5. Medication appears in dashboard

### Log Medication Taken
1. On Dashboard or Tracker
2. Find medication in today's list
3. Click "✓ Taken" or "⊘ Skip"
4. Status updates immediately
5. Stock automatically decrements if taken

### Place Medication Order
1. Click "Place New Order"
2. Select medications and quantities
3. Enter pharmacy name (optional)
4. Provide delivery address
5. Submit order
6. Status shows "pending" until confirmed

### View Adherence Report
1. Go to "Health Report"
2. See 30-day adherence percentage
3. View breakdown of taken/skipped/missed
4. Review recent activity timeline

### Add Health Condition
1. On Backend: POST /api/health-conditions
2. Include condition name and diagnosis date
3. Mark as primary if applicable
4. Displays in dashboard

---

## 🔧 Troubleshooting

### Issue: Cannot Connect to Database
**Solution:**
```bash
# Check MySQL is running
mysql -u root -p

# Verify connection parameters in .env
# Check database exists
USE med_management; SHOW TABLES;

# Ensure user has permissions
GRANT ALL PRIVILEGES ON med_management.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Issue: Port 5000 Already in Use
```bash
# Change PORT in .env to different port (e.g., 5001)
# Or kill the process using port 5000

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### Issue: CORS Error on Frontend
**Solution:** Update CORS in server.js if using different frontend URL
```javascript
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
```

### Issue: JWT Token Expired
**Solution:** Token lasts 24 hours. Log out and log back in for new token.

### Issue: Frontend Cannot Reach Backend
**Solution:** Ensure:
1. Backend server is running (`npm run dev`)
2. API_URL in frontend points to correct address
3. No firewall blocking port 5000
4. Check browser console for CORS errors

---

## 📊 Sample Data

The database.sql file includes sample data:
- 1 test user
- 2 health conditions (Hypertension, Diabetes)
- 3 medications (Lisinopril, Metformin, Aspirin)
- 4 medication schedules
- Sample adherence log
- 1 sample order

Login with registered credentials to see data.

---

## 🔐 Security Considerations

### Current Implementation
- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ CORS protection
- ✅ SQL injection prevention with parameterized queries

### For Production Deployment
1. **Environment Variables:** Keep secrets out of code
2. **HTTPS:** Use SSL/TLS certificates
3. **Rate Limiting:** Implement rate limiting on endpoints
4. **Input Validation:** Add extensive validation
5. **HTTPS Only Cookies:** If adding cookie auth
6. **Database Backup:** Regular backups
7. **Monitoring:** Set up error logging
8. **Access Control:** Implement role-based access (admin, patient, pharmacy)

---

## 📈 Performance Optimization

### Database Indexes
- Created on frequently queried columns
- Indexes on user_id, email, created_at, taken_status
- Foreign keys automatically indexed

### Frontend Optimization
- Lazy loading of sections
- Minimal CSS (no external dependencies)
- Caching of API responses in memory
- Debouncing on API calls

### Backend Optimization
- Connection pooling (10 connections)
- Efficient queries with specific selects
- Response caching where applicable

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Register new account
- [ ] Login with credentials
- [ ] Logout properly
- [ ] Token expires after 24 hours
- [ ] Cannot access protected routes without token

**Medications:**
- [ ] Add medication
- [ ] View medications
- [ ] Update stock
- [ ] Create schedule
- [ ] Medications appear on dashboard

**Adherence:**
- [ ] Mark medication as taken
- [ ] Mark medication as skipped
- [ ] Stock decreases when taken
- [ ] History updates
- [ ] Statistics calculate correctly

**Orders:**
- [ ] View existing orders
- [ ] Create new order
- [ ] Select medications
- [ ] Order status displays
- [ ] Filter orders

**Responsive Design:**
- [ ] Works on mobile (< 480px)
- [ ] Works on tablet (768px)
- [ ] Works on desktop (1200px+)
- [ ] Navigation adapts
- [ ] Forms are usable

---

## 📝 API Examples

### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Response:
# {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "userId": 1}
```

### Example: Get Dashboard
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Response:
# {
#   "todayMedications": [...],
#   "primaryCondition": "Hypertension",
#   "lowStockMedications": [...],
#   "adherenceStats": {...}
# }
```

### Example: Log Adherence
```bash
curl -X POST http://localhost:5000/api/adherence \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": 1,
    "takenStatus": "taken"
  }'

# Response:
# {"message": "Adherence logged successfully", "adherenceId": 42}
```

---

## 🎓 Learning Resources

- **Express.js:** https://expressjs.com
- **MySQL:** https://dev.mysql.com/doc/
- **JWT:** https://jwt.io/introduction
- **Responsive Design:** https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
- **REST API Best Practices:** https://restfulapi.net/

---

## 📄 License

This project is provided as-is for educational purposes. Feel free to modify and use for your DBMS mini-project.

---

## 👤 Author

Created as a comprehensive full-stack medication management system with complete frontend, backend, and database layers.

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API endpoint documentation
3. Check browser console for errors
4. Check server logs
5. Verify all setup steps were completed

---

## 🎯 Future Enhancements

Potential features for expansion:
- [ ] Push notifications for medication reminders
- [ ] Integration with pharmacy APIs
- [ ] Mobile app (React Native/Flutter)
- [ ] Doctor portal for prescription management
- [ ] Medication interaction checker
- [ ] Side effects database
- [ ] Integration with health trackers
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Email reminders
- [ ] SMS notifications

---

**Happy coding! This is a complete, working medication management system ready for your DBMS mini-project.** 💊✨
