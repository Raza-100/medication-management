// =====================================================
// MEDICATION MANAGEMENT SYSTEM - BACKEND
// Node.js with Express.js
// =====================================================

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'med_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

// =====================================================
// AUTH MIDDLEWARE
// =====================================================
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// =====================================================
// AUTHENTICATION ENDPOINTS
// =====================================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    const { firstName, lastName, email, password, dateOfBirth, phone } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        // Check if user exists
        const [existingUser] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUser.length > 0) {
            connection.release();
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Create user
        const [result] = await connection.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, date_of_birth, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, passwordHash, dateOfBirth, phone]
        );
        
        connection.release();
        
        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        const [users] = await connection.query(
            'SELECT id, password_hash FROM users WHERE email = ?',
            [email]
        );
        
        connection.release();
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ token, userId: user.id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// =====================================================
// DASHBOARD ENDPOINTS
// =====================================================

// Get user dashboard data
app.get('/api/dashboard', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        // Get today's medications and adherence
        const [todayMeds] = await connection.query(`
            SELECT 
                m.id, m.medicine_name, m.dosage, m.dosage_unit,
                s.id as schedule_id, s.scheduled_time,
                IFNULL(al.taken_status, 'pending') as status,
                al.actual_time
            FROM medications m
            JOIN schedules s ON m.id = s.medication_id
            LEFT JOIN adherence_log al ON s.id = al.schedule_id 
                AND DATE(al.scheduled_time) = CURDATE()
            WHERE m.user_id = ?
            ORDER BY s.scheduled_time
        `, [req.userId]);
        
        // Get primary health condition
        const [conditions] = await connection.query(
            'SELECT condition_name FROM health_conditions WHERE user_id = ? AND is_primary = TRUE LIMIT 1',
            [req.userId]
        );
        
        // Get medications needing reorder
        const [lowStock] = await connection.query(`
            SELECT id, medicine_name, stock_quantity, reorder_threshold
            FROM medications
            WHERE user_id = ? AND stock_quantity <= reorder_threshold
            ORDER BY stock_quantity
        `, [req.userId]);
        
        // Get adherence statistics for today
        const [stats] = await connection.query(`
            SELECT 
                COUNT(CASE WHEN taken_status = 'taken' THEN 1 END) as taken_count,
                COUNT(CASE WHEN taken_status = 'skipped' THEN 1 END) as skipped_count,
                COUNT(CASE WHEN taken_status = 'missed' THEN 1 END) as missed_count
            FROM adherence_log
            WHERE user_id = ? AND DATE(scheduled_time) = CURDATE()
        `, [req.userId]);
        
        connection.release();
        
        res.json({
            todayMedications: todayMeds,
            primaryCondition: conditions[0]?.condition_name || 'No condition recorded',
            lowStockMedications: lowStock,
            adherenceStats: stats[0]
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// =====================================================
// MEDICATIONS ENDPOINTS
// =====================================================

// Get all medications for user
app.get('/api/medications', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [medications] = await connection.query(
            'SELECT * FROM medications WHERE user_id = ? AND is_active = TRUE ORDER BY medicine_name',
            [req.userId]
        );
        
        connection.release();
        
        res.json(medications);
    } catch (error) {
        console.error('Get medications error:', error);
        res.status(500).json({ error: 'Failed to fetch medications' });
    }
});

// Get medication details with schedules
app.get('/api/medications/:id', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [meds] = await connection.query(
            'SELECT * FROM medications WHERE id = ? AND user_id = ?',
            [req.params.id, req.userId]
        );
        
        if (meds.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Medication not found' });
        }
        
        const [schedules] = await connection.query(
            'SELECT * FROM schedules WHERE medication_id = ? AND is_active = TRUE',
            [req.params.id]
        );
        
        connection.release();
        
        res.json({
            ...meds[0],
            schedules: schedules
        });
    } catch (error) {
        console.error('Get medication error:', error);
        res.status(500).json({ error: 'Failed to fetch medication' });
    }
});

// Add new medication
app.post('/api/medications', authMiddleware, async (req, res) => {
    const { medicineName, genericName, dosage, dosageUnit, frequency, stockQuantity, reorderThreshold } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            `INSERT INTO medications 
            (user_id, medicine_name, generic_name, dosage, dosage_unit, frequency, stock_quantity, reorder_threshold)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.userId, medicineName, genericName, dosage, dosageUnit, frequency, stockQuantity, reorderThreshold]
        );
        
        connection.release();
        
        res.status(201).json({
            message: 'Medication added successfully',
            medicationId: result.insertId
        });
    } catch (error) {
        console.error('Add medication error:', error);
        res.status(500).json({ error: 'Failed to add medication' });
    }
});

// Update medication stock
app.patch('/api/medications/:id/stock', authMiddleware, async (req, res) => {
    const { stockQuantity } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            'UPDATE medications SET stock_quantity = ? WHERE id = ? AND user_id = ?',
            [stockQuantity, req.params.id, req.userId]
        );
        
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medication not found' });
        }
        
        res.json({ message: 'Stock updated successfully' });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ error: 'Failed to update stock' });
    }
});

// =====================================================
// SCHEDULES ENDPOINTS
// =====================================================

// Get today's schedules
app.get('/api/schedules/today', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [schedules] = await connection.query(`
            SELECT 
                s.id, s.scheduled_time, s.days_of_week,
                m.id as medication_id, m.medicine_name, m.dosage, m.dosage_unit,
                IFNULL(al.taken_status, 'pending') as status
            FROM schedules s
            JOIN medications m ON s.medication_id = m.id
            LEFT JOIN adherence_log al ON s.id = al.schedule_id 
                AND DATE(al.scheduled_time) = CURDATE()
            WHERE m.user_id = ? AND s.is_active = TRUE
            ORDER BY s.scheduled_time
        `, [req.userId]);
        
        connection.release();
        
        res.json(schedules);
    } catch (error) {
        console.error('Get schedules error:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

// Add schedule for medication
app.post('/api/schedules', authMiddleware, async (req, res) => {
    const { medicationId, scheduledTime, daysOfWeek } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        // Verify medication belongs to user
        const [meds] = await connection.query(
            'SELECT id FROM medications WHERE id = ? AND user_id = ?',
            [medicationId, req.userId]
        );
        
        if (meds.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Medication not found' });
        }
        
        const [result] = await connection.query(
            'INSERT INTO schedules (medication_id, scheduled_time, days_of_week) VALUES (?, ?, ?)',
            [medicationId, scheduledTime, daysOfWeek]
        );
        
        connection.release();
        
        res.status(201).json({
            message: 'Schedule created successfully',
            scheduleId: result.insertId
        });
    } catch (error) {
        console.error('Add schedule error:', error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

// =====================================================
// ADHERENCE ENDPOINTS
// =====================================================

// Log medication adherence (mark as taken/skipped)
app.post('/api/adherence', authMiddleware, async (req, res) => {
    const { scheduleId, takenStatus, notes } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        const actualTime = takenStatus === 'taken' ? new Date() : null;
        
        const [result] = await connection.query(
            `INSERT INTO adherence_log (schedule_id, user_id, taken_status, actual_time, scheduled_time, notes)
            VALUES (?, ?, ?, ?, NOW(), ?)`,
            [scheduleId, req.userId, takenStatus, actualTime, notes]
        );
        
        // Update medication stock if marked as taken
        if (takenStatus === 'taken') {
            await connection.query(`
                UPDATE medications
                SET stock_quantity = stock_quantity - 1
                WHERE id = (SELECT medication_id FROM schedules WHERE id = ?)
            `, [scheduleId]);
        }
        
        connection.release();
        
        res.status(201).json({
            message: 'Adherence logged successfully',
            adherenceId: result.insertId
        });
    } catch (error) {
        console.error('Log adherence error:', error);
        res.status(500).json({ error: 'Failed to log adherence' });
    }
});

// Get adherence history
app.get('/api/adherence/history', authMiddleware, async (req, res) => {
    const days = req.query.days || 30;
    
    try {
        const connection = await pool.getConnection();
        
        const [history] = await connection.query(`
            SELECT 
                al.id, al.taken_status, al.actual_time, al.scheduled_time,
                m.medicine_name, m.dosage
            FROM adherence_log al
            JOIN schedules s ON al.schedule_id = s.id
            JOIN medications m ON s.medication_id = m.id
            WHERE al.user_id = ? AND al.scheduled_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY al.scheduled_time DESC
        `, [req.userId, days]);
        
        connection.release();
        
        res.json(history);
    } catch (error) {
        console.error('Get adherence history error:', error);
        res.status(500).json({ error: 'Failed to fetch adherence history' });
    }
});

// Get adherence statistics
app.get('/api/adherence/stats', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [stats] = await connection.query(`
            SELECT 
                COUNT(*) as total_doses,
                COUNT(CASE WHEN taken_status = 'taken' THEN 1 END) as taken_count,
                COUNT(CASE WHEN taken_status = 'skipped' THEN 1 END) as skipped_count,
                COUNT(CASE WHEN taken_status = 'missed' THEN 1 END) as missed_count,
                ROUND(COUNT(CASE WHEN taken_status = 'taken' THEN 1 END) * 100.0 / COUNT(*), 2) as adherence_percentage
            FROM adherence_log
            WHERE user_id = ? AND scheduled_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `, [req.userId]);
        
        connection.release();
        
        res.json(stats[0]);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// =====================================================
// ORDERS ENDPOINTS
// =====================================================

// Get user's orders
app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [orders] = await connection.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC',
            [req.userId]
        );
        
        // Get order items for each order
        for (let order of orders) {
            const [items] = await connection.query(`
                SELECT oi.*, m.medicine_name, m.dosage
                FROM order_items oi
                JOIN medications m ON oi.medication_id = m.id
                WHERE oi.order_id = ?
            `, [order.id]);
            
            order.items = items;
        }
        
        connection.release();
        
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Create new order
app.post('/api/orders', authMiddleware, async (req, res) => {
    const { items, pharmacyName, deliveryAddress } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        // Create order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, pharmacy_name, delivery_address, status) VALUES (?, ?, ?, ?)',
            [req.userId, pharmacyName, deliveryAddress, 'pending']
        );
        
        const orderId = orderResult.insertId;
        let totalItems = 0;
        
        // Add order items
        for (let item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, medication_id, quantity_ordered, unit_price) VALUES (?, ?, ?, ?)',
                [orderId, item.medicationId, item.quantity, item.unitPrice]
            );
            totalItems += item.quantity;
        }
        
        // Update order total_items
        await connection.query(
            'UPDATE orders SET total_items = ? WHERE id = ?',
            [totalItems, orderId]
        );
        
        // Create notification
        await connection.query(
            'INSERT INTO notifications (user_id, notification_type, title, message) VALUES (?, ?, ?, ?)',
            [req.userId, 'order_update', 'Order Placed', `Your medication order #${orderId} has been placed successfully`]
        );
        
        connection.release();
        
        res.status(201).json({
            message: 'Order created successfully',
            orderId: orderId
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order status
app.patch('/api/orders/:id/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            'UPDATE orders SET status = ? WHERE id = ? AND user_id = ?',
            [status, req.params.id, req.userId]
        );
        
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({ message: 'Order status updated' });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// =====================================================
// HEALTH CONDITIONS ENDPOINTS
// =====================================================

// Get user's health conditions
app.get('/api/health-conditions', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [conditions] = await connection.query(
            'SELECT * FROM health_conditions WHERE user_id = ? ORDER BY is_primary DESC, diagnosis_date DESC',
            [req.userId]
        );
        
        connection.release();
        
        res.json(conditions);
    } catch (error) {
        console.error('Get conditions error:', error);
        res.status(500).json({ error: 'Failed to fetch health conditions' });
    }
});

// Add health condition
app.post('/api/health-conditions', authMiddleware, async (req, res) => {
    const { conditionName, diagnosisDate, notes, isPrimary } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            'INSERT INTO health_conditions (user_id, condition_name, diagnosis_date, notes, is_primary) VALUES (?, ?, ?, ?, ?)',
            [req.userId, conditionName, diagnosisDate, notes, isPrimary || false]
        );
        
        connection.release();
        
        res.status(201).json({
            message: 'Health condition added successfully',
            conditionId: result.insertId
        });
    } catch (error) {
        console.error('Add condition error:', error);
        res.status(500).json({ error: 'Failed to add health condition' });
    }
});

// =====================================================
// NOTIFICATIONS ENDPOINTS
// =====================================================

// Get user's notifications
app.get('/api/notifications', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [notifications] = await connection.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [req.userId]
        );
        
        connection.release();
        
        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        await connection.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [req.params.id, req.userId]
        );
        
        connection.release();
        
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification error:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🏥 Medication Management Server running on http://localhost:${PORT}`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/api/docs`);
});

module.exports = app;
