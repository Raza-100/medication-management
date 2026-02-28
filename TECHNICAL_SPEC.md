# 💊 MEDICATION MANAGEMENT SYSTEM
## Technical Specification & Architecture Document

### Document Version: 1.0
### Last Updated: February 2026
### DBMS Mini-Project - Full Stack Implementation

---

## TABLE OF CONTENTS

1. Executive Summary
2. System Architecture
3. Database Design
4. Frontend Architecture
5. Backend API Specification
6. Data Flow & Integration
7. Security & Authentication
8. Performance Considerations
9. Deployment Guide
10. Testing Strategy

---

## 1. EXECUTIVE SUMMARY

### Project Objective
Design and implement a complete Personal Medication Management Web Application that enables patients to:
- Manage medication schedules with reminders
- Track medication adherence
- Monitor health conditions
- Request medication refills
- Generate health reports

### Scope
**Inclusions:**
- Full-stack web application (Frontend, Backend, Database)
- User authentication and authorization
- Real-time medication tracking
- Order management system
- Responsive UI for mobile/tablet/desktop

**Exclusions:**
- Mobile native apps
- Integration with external pharmacies (simulated)
- SMS/Push notification provider
- Machine learning features

### Key Deliverables
1. ✅ MySQL Database with 8 tables
2. ✅ RESTful API with 20+ endpoints
3. ✅ Responsive single-page application
4. ✅ Complete documentation
5. ✅ Working test data

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Three-Tier Architecture

```
┌─────────────────────────────────────────────────────┐
│          PRESENTATION LAYER (Frontend)              │
│  HTML5 | CSS3 | JavaScript | Responsive Design     │
│        • Dashboard                                  │
│        • Medication Tracker                         │
│        • Order Management                           │
│        • Health Reports                             │
└────────────────┬────────────────────────────────────┘
                 │
                 │ HTTP/REST API
                 │
┌────────────────▼────────────────────────────────────┐
│      APPLICATION LAYER (Backend)                    │
│    Node.js | Express.js | JWT Authentication      │
│        • Authentication Service                     │
│        • Medication Service                         │
│        • Adherence Service                          │
│        • Order Service                              │
│        • Notification Service                       │
└────────────────┬────────────────────────────────────┘
                 │
                 │ SQL Queries
                 │
┌────────────────▼────────────────────────────────────┐
│         DATA LAYER (Database)                       │
│    MySQL | 8 Tables | Relational Schema            │
│        • User Data                                  │
│        • Medication Records                         │
│        • Adherence Logs                             │
│        • Orders & Inventory                         │
└─────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | HTML5 | - | Structure & Markup |
| | CSS3 | - | Styling & Responsive |
| | JavaScript | ES6+ | Interactivity & DOM |
| **Backend** | Node.js | 14+ | JavaScript Runtime |
| | Express.js | 4.18+ | Web Framework |
| | JWT | 9.0+ | Authentication |
| | bcrypt | 5.1+ | Password Hashing |
| **Database** | MySQL | 5.7+ | Relational Database |
| | mysql2 | 3.4+ | Node Driver |

### 2.3 Application Flow

```
User Opens Application
    ↓
[No Token] → Show Login/Register
    ↓
User Authenticates
    ↓
Backend Validates → Generates JWT Token
    ↓
Frontend Stores Token in localStorage
    ↓
Frontend Displays Dashboard
    ↓
User Navigates (All requests include JWT)
    ↓
Backend Validates Token
    ↓
Executes Service Logic
    ↓
Database Query/Update
    ↓
Returns Response
    ↓
Frontend Updates UI
```

---

## 3. DATABASE DESIGN

### 3.1 Entity-Relationship Diagram (Logical)

```
                    ┌──────────┐
                    │  users   │
                    └─────┬────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
    ┌───────▼────┐ ┌─────▼──────┐ ┌───▼────────┐
    │health_     │ │medications │ │  orders    │
    │conditions  │ │            │ │            │
    └────────────┘ └─────┬──────┘ └───┬────────┘
                         │             │
                    ┌────▼────┐   ┌───▼──────────┐
                    │schedules │   │order_items   │
                    └────┬─────┘   └──────────────┘
                         │
                    ┌────▼──────────┐
                    │adherence_log  │
                    └───────────────┘
```

### 3.2 Table Specifications

#### users
```sql
PRIMARY KEY: id
UNIQUE: email
FOREIGN KEYS: None
INDEXES: idx_email, idx_created_at

Columns:
- id (INT, AUTO_INCREMENT)
- first_name (VARCHAR 100)
- last_name (VARCHAR 100)
- email (VARCHAR 255, UNIQUE)
- password_hash (VARCHAR 255)
- date_of_birth (DATE, nullable)
- phone (VARCHAR 15)
- address (TEXT)
- created_at (TIMESTAMP, DEFAULT CURRENT)
- updated_at (TIMESTAMP, AUTO UPDATE)
- is_active (BOOLEAN, DEFAULT TRUE)
```

#### medications
```sql
PRIMARY KEY: id
FOREIGN KEYS: user_id → users(id)
INDEXES: idx_user_id, idx_medicine_name, idx_stock_quantity

Columns:
- id (INT, AUTO_INCREMENT)
- user_id (INT, NOT NULL)
- medicine_name (VARCHAR 150)
- generic_name (VARCHAR 150)
- dosage (VARCHAR 50)
- dosage_unit (VARCHAR 20)
- frequency (VARCHAR 100)
- stock_quantity (INT)
- reorder_threshold (INT)
- manufacturer (VARCHAR 150)
- prescription_date (DATE)
- prescription_expiry (DATE)
- notes (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### schedules
```sql
PRIMARY KEY: id
FOREIGN KEYS: medication_id → medications(id)
INDEXES: idx_medication_id, idx_scheduled_time, idx_is_active

Columns:
- id (INT, AUTO_INCREMENT)
- medication_id (INT, NOT NULL)
- scheduled_time (TIME)
- days_of_week (VARCHAR 50) [e.g., "Mon,Wed,Fri"]
- specific_dates (DATE)
- duration_start_date (DATE)
- duration_end_date (DATE)
- notes (TEXT)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### adherence_log
```sql
PRIMARY KEY: id
FOREIGN KEYS: schedule_id → schedules(id), user_id → users(id)
INDEXES: idx_schedule_id, idx_user_id, idx_actual_time, idx_scheduled_time

Columns:
- id (INT, AUTO_INCREMENT)
- schedule_id (INT, NOT NULL)
- user_id (INT, NOT NULL)
- taken_status (ENUM: 'taken', 'skipped', 'missed')
- actual_time (DATETIME, nullable)
- scheduled_time (DATETIME)
- notes (TEXT)
- created_at (TIMESTAMP)
```

#### orders
```sql
PRIMARY KEY: id
FOREIGN KEYS: user_id → users(id)
INDEXES: idx_user_id, idx_order_date, idx_status

Columns:
- id (INT, AUTO_INCREMENT)
- user_id (INT, NOT NULL)
- order_date (DATETIME, DEFAULT CURRENT)
- delivery_date (DATE, nullable)
- status (ENUM: 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
- pharmacy_name (VARCHAR 150)
- pharmacy_contact (VARCHAR 15)
- delivery_address (TEXT)
- total_items (INT)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### order_items
```sql
PRIMARY KEY: id
FOREIGN KEYS: order_id → orders(id), medication_id → medications(id)
INDEXES: idx_order_id, idx_medication_id

Columns:
- id (INT, AUTO_INCREMENT)
- order_id (INT, NOT NULL)
- medication_id (INT, NOT NULL)
- quantity_ordered (INT)
- unit_price (DECIMAL 10,2)
- created_at (TIMESTAMP)
```

#### health_conditions
```sql
PRIMARY KEY: id
FOREIGN KEYS: user_id → users(id)
INDEXES: idx_user_id, idx_condition_name

Columns:
- id (INT, AUTO_INCREMENT)
- user_id (INT, NOT NULL)
- condition_name (VARCHAR 150)
- diagnosis_date (DATE)
- notes (TEXT)
- is_primary (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### notifications
```sql
PRIMARY KEY: id
FOREIGN KEYS: user_id → users(id)
INDEXES: idx_user_id, idx_is_read, idx_created_at

Columns:
- id (INT, AUTO_INCREMENT)
- user_id (INT, NOT NULL)
- notification_type (ENUM: 'reminder', 'missed_dose', 'low_stock', 'order_update', 'alert')
- title (VARCHAR 200)
- message (TEXT)
- is_read (BOOLEAN)
- created_at (TIMESTAMP)
```

### 3.3 Key Constraints

**Referential Integrity:**
- All foreign keys have ON DELETE CASCADE
- Ensures data consistency when users/medications deleted
- Orphaned records automatically removed

**Data Validation:**
- Email uniqueness enforced at database level
- Enum types restrict status values
- NOT NULL constraints on required fields
- Date validations in application layer

### 3.4 Performance Optimization

**Indexes Strategy:**
```
High Query Volume Columns:
- users.email (Frequent in WHERE clauses)
- adherence_log.user_id (Filtering by user)
- medications.user_id (User-specific data)
- adherence_log.scheduled_time (Date range queries)

Composite Indexes:
- (user_id, created_at) for timeline queries
- (medication_id, scheduled_time) for schedule queries
```

**Query Optimization:**
```sql
-- Bad: N+1 Query Problem
SELECT * FROM medications WHERE user_id = 1;
// Then loop and query schedules for each

-- Good: JOIN Query
SELECT m.*, s.scheduled_time, s.days_of_week
FROM medications m
LEFT JOIN schedules s ON m.id = s.medication_id
WHERE m.user_id = 1;
```

---

## 4. FRONTEND ARCHITECTURE

### 4.1 Application State

```javascript
// Global State Variables
let currentUser = null;           // {id, email}
let currentToken = null;          // JWT Token
let allMedications = [];          // Cache
let todaySchedules = [];          // Cache
```

### 4.2 Page Structure

```html
Header (Navigation, User Menu)
│
├── Dashboard Section
│   ├── Stats Grid (4 Cards)
│   ├── Primary Condition Card
│   └── Today's Medications List
│
├── Medications Section
│   └── All Medications List
│
├── Orders Section
│   ├── Order Tabs (Pending/All)
│   └── Orders List
│
└── Health Report Section
    ├── Adherence Stats
    └── Activity History
```

### 4.3 Component Architecture

```
App
├── Header
│   ├── Logo
│   ├── Navigation Menu
│   └── User Menu (Logout)
│
├── Auth Section (Login/Register)
│   ├── Login Form
│   └── Register Form
│
├── Main Content (Tabs)
│   ├── Dashboard
│   ├── Medications
│   ├── Orders
│   └── Health Report
│
├── Modals
│   ├── Add Medication
│   └── Place Order
│
└── Notifications
    └── Alert Messages
```

### 4.4 UI/UX Design

**Design Principles:**
- ✅ Mobile-first responsive design
- ✅ Accessibility (WCAG guidelines)
- ✅ Consistency in spacing & colors
- ✅ Clear visual hierarchy
- ✅ Large touch targets (48px minimum)

**Color System:**
```css
Primary:    #4A90E2 (Actions, highlights)
Success:    #66BB6A (Positive actions)
Warning:    #FFA726 (Caution, pending)
Danger:     #EF5350 (Critical, missed)
Neutral:    #7F8C8D (Text secondary)
```

**Responsive Breakpoints:**
```css
Mobile:     < 480px
Tablet:     480px - 768px
Desktop:    768px - 1200px
Large:      > 1200px
```

### 4.5 User Interaction Flow

```
User Opens App
    ↓
Check localStorage for token
    ├─ No Token → Show Login/Register
    │   ├─ Register → Create Account
    │   └─ Login → Get Token
    │
    └─ Token Exists → Show Dashboard
        ├─ API Call: GET /dashboard
        ├─ Render: Stats, Medications, Alerts
        └─ User Can:
            ├─ Mark pill as Taken/Skipped
            ├─ Add new medication
            ├─ View adherence stats
            └─ Place order
```

---

## 5. BACKEND API SPECIFICATION

### 5.1 API Overview

**Base URL:** `http://localhost:5000/api`

**Authentication:** JWT Bearer Token
```javascript
Headers: {
  'Authorization': 'Bearer eyJhbGc...',
  'Content-Type': 'application/json'
}
```

### 5.2 Authentication Endpoints

#### POST /auth/register
**Purpose:** Create new user account

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "dateOfBirth": "1985-06-15",
  "phone": "555-0100"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

**Error (400):**
```json
{
  "error": "Email already registered"
}
```

---

#### POST /auth/login
**Purpose:** Authenticate user and get JWT token

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

### 5.3 Dashboard Endpoints

#### GET /dashboard
**Purpose:** Get complete dashboard summary for today

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "todayMedications": [
    {
      "id": 1,
      "medicine_name": "Lisinopril",
      "dosage": "10",
      "dosage_unit": "mg",
      "schedule_id": 5,
      "scheduled_time": "08:00:00",
      "status": "pending"
    }
  ],
  "primaryCondition": "Hypertension",
  "lowStockMedications": [
    {
      "id": 3,
      "medicine_name": "Aspirin",
      "stock_quantity": 5,
      "reorder_threshold": 15
    }
  ],
  "adherenceStats": {
    "taken_count": 2,
    "skipped_count": 0,
    "missed_count": 1
  }
}
```

### 5.4 Medication Endpoints

#### GET /medications
**Purpose:** Get all user's active medications

**Response (200):**
```json
[
  {
    "id": 1,
    "medicine_name": "Lisinopril",
    "generic_name": "Lisinopril",
    "dosage": "10",
    "dosage_unit": "mg",
    "frequency": "Once daily",
    "stock_quantity": 25,
    "reorder_threshold": 10,
    "is_active": true
  }
]
```

---

#### GET /medications/:id
**Purpose:** Get specific medication with schedules

**Response (200):**
```json
{
  "id": 1,
  "medicine_name": "Lisinopril",
  "dosage": "10",
  "dosage_unit": "mg",
  "frequency": "Once daily",
  "stock_quantity": 25,
  "schedules": [
    {
      "id": 5,
      "medication_id": 1,
      "scheduled_time": "08:00:00",
      "days_of_week": "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"
    }
  ]
}
```

---

#### POST /medications
**Purpose:** Add new medication for user

**Request:**
```json
{
  "medicineName": "Metformin",
  "genericName": "Metformin",
  "dosage": "500",
  "dosageUnit": "mg",
  "frequency": "Twice daily",
  "stockQuantity": 45,
  "reorderThreshold": 20
}
```

**Response (201):**
```json
{
  "message": "Medication added successfully",
  "medicationId": 2
}
```

---

#### PATCH /medications/:id/stock
**Purpose:** Update medication stock quantity

**Request:**
```json
{
  "stockQuantity": 30
}
```

**Response (200):**
```json
{
  "message": "Stock updated successfully"
}
```

### 5.5 Schedule Endpoints

#### GET /schedules/today
**Purpose:** Get today's medication schedule with adherence status

**Response (200):**
```json
[
  {
    "id": 5,
    "scheduled_time": "08:00:00",
    "days_of_week": "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
    "medication_id": 1,
    "medicine_name": "Lisinopril",
    "dosage": "10",
    "dosage_unit": "mg",
    "status": "pending"
  }
]
```

---

#### POST /schedules
**Purpose:** Create new medication schedule

**Request:**
```json
{
  "medicationId": 1,
  "scheduledTime": "08:00:00",
  "daysOfWeek": "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"
}
```

**Response (201):**
```json
{
  "message": "Schedule created successfully",
  "scheduleId": 5
}
```

### 5.6 Adherence Endpoints

#### POST /adherence
**Purpose:** Log medication adherence (mark as taken/skipped)

**Request:**
```json
{
  "scheduleId": 5,
  "takenStatus": "taken",
  "notes": "Took with breakfast"
}
```

**Response (201):**
```json
{
  "message": "Adherence logged successfully",
  "adherenceId": 42
}
```

**Side Effects:**
- If status is "taken", stock_quantity decremented by 1
- Notification created for adherence event

---

#### GET /adherence/history?days=30
**Purpose:** Get adherence history for last N days

**Response (200):**
```json
[
  {
    "id": 42,
    "taken_status": "taken",
    "actual_time": "2026-02-28T08:15:00",
    "scheduled_time": "2026-02-28T08:00:00",
    "medicine_name": "Lisinopril",
    "dosage": "10"
  }
]
```

---

#### GET /adherence/stats
**Purpose:** Get adherence statistics for last 30 days

**Response (200):**
```json
{
  "total_doses": 60,
  "taken_count": 58,
  "skipped_count": 2,
  "missed_count": 0,
  "adherence_percentage": 96.67
}
```

### 5.7 Order Endpoints

#### GET /orders
**Purpose:** Get all user's orders with items

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "order_date": "2026-02-28T10:30:00",
    "status": "pending",
    "pharmacy_name": "City Pharmacy",
    "delivery_address": "123 Main St, Anytown",
    "total_items": 2,
    "items": [
      {
        "id": 1,
        "medication_id": 3,
        "medicine_name": "Aspirin",
        "dosage": "81",
        "quantity_ordered": 30,
        "unit_price": 5.99
      }
    ]
  }
]
```

---

#### POST /orders
**Purpose:** Create new medication refill order

**Request:**
```json
{
  "items": [
    {
      "medicationId": 3,
      "quantity": 30,
      "unitPrice": 5.99
    }
  ],
  "pharmacyName": "City Pharmacy",
  "deliveryAddress": "123 Main Street, Anytown, USA"
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "orderId": 1
}
```

**Side Effects:**
- Creates order record
- Creates order_items for each medication
- Creates notification
- Sends simulated email to pharmacy

---

#### PATCH /orders/:id/status
**Purpose:** Update order status

**Request:**
```json
{
  "status": "shipped"
}
```

**Response (200):**
```json
{
  "message": "Order status updated"
}
```

### 5.8 Health Conditions Endpoints

#### GET /health-conditions
**Purpose:** Get all user's health conditions

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "condition_name": "Hypertension",
    "diagnosis_date": "2020-03-10",
    "notes": "Controlled with medication",
    "is_primary": true
  }
]
```

---

#### POST /health-conditions
**Purpose:** Add new health condition

**Request:**
```json
{
  "conditionName": "Type 2 Diabetes",
  "diagnosisDate": "2021-07-20",
  "notes": "Family history",
  "isPrimary": false
}
```

**Response (201):**
```json
{
  "message": "Health condition added successfully",
  "conditionId": 2
}
```

### 5.9 Notification Endpoints

#### GET /notifications
**Purpose:** Get user's recent notifications

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "notification_type": "reminder",
    "title": "Time for your medication",
    "message": "Take Lisinopril 10mg",
    "is_read": false,
    "created_at": "2026-02-28T08:00:00"
  }
]
```

---

#### PATCH /notifications/:id/read
**Purpose:** Mark notification as read

**Response (200):**
```json
{
  "message": "Notification marked as read"
}
```

---

## 6. DATA FLOW & INTEGRATION

### 6.1 Complete User Journey

```
1. REGISTRATION
   User Fills Form
   ↓
   Frontend: POST /auth/register
   ↓
   Backend: Hash Password, Create User Record
   ↓
   Database: INSERT into users
   ↓
   Response: userId
   ↓
   Frontend: Show Login Form

2. LOGIN
   User Enters Credentials
   ↓
   Frontend: POST /auth/login
   ↓
   Backend: Validate Credentials, Generate JWT
   ↓
   Response: JWT Token
   ↓
   Frontend: Store in localStorage
   ↓
   Show Dashboard

3. VIEW DASHBOARD
   Frontend: GET /dashboard (with JWT)
   ↓
   Backend:
   ├─ Validate Token
   ├─ Query today's medications
   ├─ Get adherence status
   └─ Get low stock items
   ↓
   Database: Multiple SELECTs with JOINs
   ↓
   Response: Complete dashboard data
   ↓
   Frontend: Render UI

4. LOG ADHERENCE
   User Clicks "Taken"
   ↓
   Frontend: POST /adherence
   ↓
   Backend:
   ├─ Record adherence
   ├─ Update stock (if taken)
   └─ Create notification
   ↓
   Database:
   ├─ INSERT into adherence_log
   ├─ UPDATE medications.stock_quantity
   └─ INSERT into notifications
   ↓
   Response: Success
   ↓
   Frontend: Update UI

5. PLACE ORDER
   User Selects Medications
   ↓
   Frontend: POST /orders
   ↓
   Backend:
   ├─ Create order record
   ├─ Add order items
   ├─ Create notification
   └─ Simulate pharmacy notification
   ↓
   Database:
   ├─ INSERT into orders
   ├─ INSERT into order_items
   └─ INSERT into notifications
   ↓
   Response: orderId
   ↓
   Frontend: Show confirmation
```

### 6.2 API Request/Response Cycle

```
Frontend
  │
  ├─ Prepare request with:
  │  ├─ JWT Token in header
  │  ├─ JSON payload
  │  └─ Correct HTTP method
  │
  ├─ POST/GET/PATCH to API URL
  │
  └─ Receive response
     ├─ Parse JSON
     ├─ Handle errors
     └─ Update DOM

    ↓↑

Backend
  │
  ├─ Receive HTTP request
  │
  ├─ Parse headers/body
  │
  ├─ Validate JWT token
  │
  ├─ Extract userId from token
  │
  ├─ Execute service logic
  │
  ├─ Query database
  │
  ├─ Format response
  │
  └─ Send JSON response
     ├─ Status code (200, 201, 400, 401, 500)
     └─ JSON body

    ↓

Database
  │
  ├─ Receive SQL query
  │
  ├─ Execute (SELECT, INSERT, UPDATE, DELETE)
  │
  ├─ Apply constraints & triggers
  │
  └─ Return results to backend
```

### 6.3 Data Consistency

**ACID Compliance:**
- **Atomicity:** Single API call = single transaction
- **Consistency:** Foreign key constraints enforced
- **Isolation:** Database locks prevent race conditions
- **Durability:** Data persisted to disk

**Example Transaction:**
```javascript
// Logging adherence as "taken" is atomic
1. Insert adherence_log record
2. Update medication stock_quantity
3. Insert notification
// If any step fails, all rolled back
```

---

## 7. SECURITY & AUTHENTICATION

### 7.1 Authentication Flow

```
Registration
  ├─ User submits password
  ├─ Backend: bcrypt.hash(password, 10)
  ├─ Hashed password stored in DB
  └─ Original password never stored

Login
  ├─ User submits email + password
  ├─ Backend: Query user by email
  ├─ Backend: bcrypt.compare(input, stored)
  ├─ If match: Generate JWT
  │   - Payload: {userId, iat, exp}
  │   - Sign with JWT_SECRET
  │   - Return token
  └─ Frontend: Store token in localStorage

Protected Requests
  ├─ Frontend sends: Authorization: Bearer {token}
  ├─ Backend: jwt.verify(token, JWT_SECRET)
  ├─ If valid: Extract userId
  ├─ If invalid: Return 401 Unauthorized
  └─ Continue request processing

Token Expiry
  ├─ Tokens last 24 hours
  ├─ After expiry: 401 Unauthorized
  └─ User must login again
```

### 7.2 Password Security

**Current Implementation:**
```javascript
// Hashing on registration
const hash = await bcrypt.hash(password, 10);
// 10 = salt rounds (cost factor)

// Verification on login
const valid = await bcrypt.compare(input, hash);
```

**Why bcrypt?**
- Slow hashing (intentionally)
- Resistant to GPU attacks
- Salt automatically included
- Industry standard

### 7.3 JWT Security

**Token Structure:**
```
Header.Payload.Signature
├─ Header: {alg: 'HS256', typ: 'JWT'}
├─ Payload: {userId: 1, iat: 1234567890, exp: 1234671490}
└─ Signature: HMACSHA256(base64(header) + '.' + base64(payload), secret)
```

**Security Measures:**
- Signed with secret key (never transmitted)
- Tampered tokens detected
- Expiration enforced
- Stored in localStorage (vulnerable to XSS, but no alternative in SPA)

**To Improve (Production):**
- Use httpOnly cookies (backend-set)
- Implement refresh token rotation
- Add token blacklist for logout

### 7.4 API Security

**Current:**
- ✅ CORS enabled (allow localhost)
- ✅ Input validation
- ✅ Parameterized queries (SQL injection prevention)
- ✅ Authentication required for protected routes

**To Add (Production):**
- [ ] HTTPS/SSL encryption
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] Output escaping
- [ ] CSRF tokens
- [ ] Content Security Policy headers
- [ ] API versioning
- [ ] Request size limits

### 7.5 Data Protection

**What's Protected:**
- ✅ Passwords (hashed with bcrypt)
- ✅ API endpoints (JWT required)
- ✅ User data (queries filtered by user_id)
- ✅ Database (parameterized queries)

**What Could Be Protected (Production):**
- [ ] Encryption at rest (database)
- [ ] Encryption in transit (HTTPS)
- [ ] Sensitive fields (PII encryption)
- [ ] Audit logging

---

## 8. PERFORMANCE CONSIDERATIONS

### 8.1 Database Performance

**Query Optimization:**
```sql
-- GOOD: Uses index, specific columns
SELECT m.id, m.medicine_name, m.dosage
FROM medications
WHERE user_id = 1 AND is_active = TRUE;

-- BAD: Wildcard, no index
SELECT *
FROM medications
WHERE LOWER(medicine_name) LIKE '%insulin%';

-- GOOD: JOIN instead of N+1
SELECT m.*, s.scheduled_time
FROM medications m
LEFT JOIN schedules s ON m.id = s.medication_id
WHERE m.user_id = 1;
```

**Index Usage:**
- `medications.user_id` → filters 95% of queries
- `adherence_log.scheduled_time` → date range queries
- `users.email` → login queries
- `orders.status` → order filtering

### 8.2 Frontend Performance

**Optimization Strategies:**
1. **Minimal Dependencies:** Only uses vanilla JS, no frameworks
2. **Lazy Loading:** Sections load on demand
3. **Caching:** Store fetched data in variables
4. **Debouncing:** Prevent rapid API calls

**Sample Debounce:**
```javascript
let debounceTimer;
function debounceSearch(query) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        // API call
    }, 500);
}
```

### 8.3 Backend Performance

**Connection Pooling:**
```javascript
const pool = mysql.createPool({
    connectionLimit: 10,  // Maintain 10 connections
    queueLimit: 0         // Queue unlimited requests
});
// Reuses connections, faster than creating new ones
```

**Scalability Features:**
- Stateless design (no server-side sessions)
- Can run multiple instances behind load balancer
- Database is single point of scale
- Cache layer can be added (Redis)

### 8.4 Load Testing Benchmarks

```
Expected Performance (Single Server):
- Peak Requests: 1,000+ req/sec
- Database Connections: 10 concurrent
- Response Time: <200ms average
- Database Size: < 500MB at 10,000 users

Scaling Strategy:
- Horizontal: Multiple Node servers + load balancer
- Vertical: Increase server RAM/CPU
- Database: Master-slave replication
- Cache: Redis for session/data caching
```

---

## 9. DEPLOYMENT GUIDE

### 9.1 Environment Setup

**Development:**
```bash
# .env file
DB_HOST=localhost
JWT_SECRET=dev-secret-key
PORT=5000
NODE_ENV=development
```

**Production:**
```bash
# .env file
DB_HOST=prod-db-server.com
JWT_SECRET=use_random_secure_key
PORT=80/443
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### 9.2 Docker Deployment

```dockerfile
# Dockerfile
FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: med_management
    ports:
      - "3306:3306"
    volumes:
      - ./database.sql:/docker-entrypoint-initdb.d/

  backend:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: rootpass
```

### 9.3 Cloud Deployment (AWS)

**Architecture:**
```
                    CDN (CloudFront)
                          ↓
                    S3 (Static Files)
                          ↓
                    ALB (Load Balancer)
                          ↓
        ┌───────────────────┬───────────────────┐
        ↓                   ↓                   ↓
      EC2 Node-1          EC2 Node-2          EC2 Node-3
     (Backend)            (Backend)           (Backend)
        ↓                   ↓                   ↓
        └───────────────────┬───────────────────┘
                            ↓
                    RDS MySQL (Multi-AZ)
```

---

## 10. TESTING STRATEGY

### 10.1 Unit Testing Example

```javascript
// test/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
    it('should register user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@example.com',
                password: 'password123'
            });
        
        expect(response.status).toBe(201);
        expect(response.body.userId).toBeDefined();
    });

    it('should not register duplicate email', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'test@example.com',  // Same email
                password: 'password456'
            });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Email already registered');
    });
});
```

### 10.2 Integration Testing

```javascript
describe('Medication Management', () => {
    let token, userId;

    beforeAll(async () => {
        // Setup: Register and login
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'john@example.com',
                password: 'password'
            });
        
        token = loginResponse.body.token;
        userId = loginResponse.body.userId;
    });

    it('should add medication', async () => {
        const response = await request(app)
            .post('/api/medications')
            .set('Authorization', `Bearer ${token}`)
            .send({
                medicineName: 'Aspirin',
                dosage: 81,
                dosageUnit: 'mg',
                frequency: 'Once daily'
            });
        
        expect(response.status).toBe(201);
        expect(response.body.medicationId).toBeDefined();
    });

    it('should log adherence', async () => {
        const response = await request(app)
            .post('/api/adherence')
            .set('Authorization', `Bearer ${token}`)
            .send({
                scheduleId: 1,
                takenStatus: 'taken'
            });
        
        expect(response.status).toBe(201);
    });
});
```

### 10.3 API Testing Checklist

**Authentication:**
- [ ] Register with valid data
- [ ] Register with invalid email
- [ ] Register with duplicate email
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Token expires after 24 hours

**Medications:**
- [ ] Add medication
- [ ] Get all medications
- [ ] Get specific medication
- [ ] Update stock
- [ ] Add medication without auth (should fail)

**Adherence:**
- [ ] Log as taken
- [ ] Log as skipped
- [ ] Stock decreases when taken
- [ ] Get history
- [ ] Get statistics

**Orders:**
- [ ] Create order
- [ ] Get orders
- [ ] Update order status
- [ ] Cannot see other user's orders

### 10.4 Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/medications

# Using LoadRunner or JMeter
# Simulate 100 concurrent users
# Run for 10 minutes
# Target: < 200ms response time
# Target: < 1% error rate
```

---

## APPENDIX A: SQL Cheat Sheet

### Helpful Queries

```sql
-- Get today's medications for user
SELECT m.medicine_name, m.dosage, s.scheduled_time, IFNULL(al.taken_status, 'pending') as status
FROM medications m
JOIN schedules s ON m.id = s.medication_id
LEFT JOIN adherence_log al ON s.id = al.schedule_id AND DATE(al.scheduled_time) = CURDATE()
WHERE m.user_id = 1
ORDER BY s.scheduled_time;

-- Get medications needing reorder
SELECT id, medicine_name, stock_quantity, reorder_threshold
FROM medications
WHERE user_id = 1 AND stock_quantity <= reorder_threshold;

-- Get adherence for this month
SELECT 
    CAST(COUNT(CASE WHEN taken_status = 'taken' THEN 1 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as adherence_percentage
FROM adherence_log
WHERE user_id = 1 AND MONTH(scheduled_time) = MONTH(NOW());

-- Get user's orders with items
SELECT o.id, o.order_date, o.status, oi.medicine_name, oi.quantity_ordered
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 1
ORDER BY o.order_date DESC;
```

---

## APPENDIX B: Glossary

| Term | Definition |
|------|-----------|
| **JWT** | JSON Web Token - stateless authentication mechanism |
| **CORS** | Cross-Origin Resource Sharing - security policy |
| **API** | Application Programming Interface |
| **REST** | Representational State Transfer - API style |
| **ACID** | Database properties: Atomicity, Consistency, Isolation, Durability |
| **Adherence** | Patient compliance with medication schedule |
| **Refill** | Request for new medication supply |

---

**Document End**

Version 1.0 | Complete Technical Specification for Full-Stack Medication Management System
