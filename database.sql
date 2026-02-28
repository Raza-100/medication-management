-- =====================================================
-- PERSONAL MEDICATION MANAGEMENT SYSTEM DATABASE
-- =====================================================
-- Database for managing patient medications, schedules, adherence tracking, and orders

CREATE DATABASE IF NOT EXISTS med_management;
USE med_management;

-- =====================================================
-- 1. USERS/PATIENTS TABLE
-- =====================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 2. HEALTH CONDITIONS TABLE
-- =====================================================
CREATE TABLE health_conditions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    condition_name VARCHAR(150) NOT NULL,
    diagnosis_date DATE,
    notes TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_condition_name (condition_name)
);

-- =====================================================
-- 3. MEDICATIONS TABLE
-- =====================================================
CREATE TABLE medications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150),
    dosage VARCHAR(50) NOT NULL,
    dosage_unit VARCHAR(20),
    frequency VARCHAR(100) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    reorder_threshold INT DEFAULT 10,
    manufacturer VARCHAR(150),
    prescription_date DATE,
    prescription_expiry DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_medicine_name (medicine_name),
    INDEX idx_stock_quantity (stock_quantity)
);

-- =====================================================
-- 4. MEDICATION SCHEDULES TABLE
-- =====================================================
CREATE TABLE schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    medication_id INT NOT NULL,
    scheduled_time TIME NOT NULL,
    days_of_week VARCHAR(50),
    specific_dates DATE,
    duration_start_date DATE,
    duration_end_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    INDEX idx_medication_id (medication_id),
    INDEX idx_scheduled_time (scheduled_time),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- 5. ADHERENCE LOG TABLE
-- =====================================================
CREATE TABLE adherence_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    user_id INT NOT NULL,
    taken_status ENUM('taken', 'skipped', 'missed') NOT NULL,
    actual_time DATETIME,
    scheduled_time DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_user_id (user_id),
    INDEX idx_actual_time (actual_time),
    INDEX idx_scheduled_time (scheduled_time),
    INDEX idx_taken_status (taken_status)
);

-- =====================================================
-- 6. ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATE,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    pharmacy_name VARCHAR(150),
    pharmacy_contact VARCHAR(15),
    delivery_address TEXT,
    total_items INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_order_date (order_date),
    INDEX idx_status (status)
);

-- =====================================================
-- 7. ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    medication_id INT NOT NULL,
    quantity_ordered INT NOT NULL,
    unit_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_medication_id (medication_id)
);

-- =====================================================
-- 8. NOTIFICATIONS TABLE (for alerts)
-- =====================================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_type ENUM('reminder', 'missed_dose', 'low_stock', 'order_update', 'alert') DEFAULT 'reminder',
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert test user
INSERT INTO users (first_name, last_name, email, password_hash, date_of_birth, phone)
VALUES ('John', 'Doe', 'john@example.com', 'hashed_password_123', '1985-06-15', '555-0100');

-- Insert health conditions
INSERT INTO health_conditions (user_id, condition_name, diagnosis_date, is_primary)
VALUES 
(1, 'Hypertension', '2020-03-10', TRUE),
(1, 'Type 2 Diabetes', '2021-07-20', FALSE);

-- Insert medications
INSERT INTO medications (user_id, medicine_name, generic_name, dosage, dosage_unit, frequency, stock_quantity, reorder_threshold)
VALUES
(1, 'Lisinopril', 'Lisinopril', '10', 'mg', 'Once daily', 25, 10),
(1, 'Metformin', 'Metformin', '500', 'mg', 'Twice daily', 45, 20),
(1, 'Aspirin', 'Acetylsalicylic Acid', '81', 'mg', 'Once daily', 5, 15);

-- Insert schedules
INSERT INTO schedules (medication_id, scheduled_time, days_of_week)
VALUES
(1, '08:00:00', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'),
(2, '08:00:00', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'),
(2, '20:00:00', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'),
(3, '09:00:00', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday');

-- Insert sample adherence log
INSERT INTO adherence_log (schedule_id, user_id, taken_status, actual_time, scheduled_time)
VALUES
(1, 1, 'taken', '2026-02-28 08:15:00', '2026-02-28 08:00:00'),
(2, 1, 'taken', '2026-02-28 08:30:00', '2026-02-28 08:00:00'),
(3, 1, 'skipped', NULL, '2026-02-28 20:00:00'),
(4, 1, 'taken', '2026-02-28 09:10:00', '2026-02-28 09:00:00');

-- Insert sample order
INSERT INTO orders (user_id, status, pharmacy_name, delivery_address)
VALUES
(1, 'pending', 'City Pharmacy', '123 Main Street, Anytown, USA');

-- Insert order items
INSERT INTO order_items (order_id, medication_id, quantity_ordered, unit_price)
VALUES
(1, 3, 30, 5.99),
(1, 1, 30, 12.99);

-- =====================================================
-- HELPFUL QUERIES FOR DASHBOARD
-- =====================================================

-- Get today's medication schedule for a user
-- SELECT m.medicine_name, m.dosage, s.scheduled_time, IFNULL(al.taken_status, 'pending') as status
-- FROM medications m
-- JOIN schedules s ON m.id = s.medication_id
-- LEFT JOIN adherence_log al ON s.id = al.schedule_id AND DATE(al.scheduled_time) = CURDATE()
-- WHERE m.user_id = 1
-- ORDER BY s.scheduled_time;

-- Get medications that need reordering
-- SELECT id, medicine_name, stock_quantity, reorder_threshold
-- FROM medications
-- WHERE user_id = 1 AND stock_quantity <= reorder_threshold
-- ORDER BY stock_quantity;

-- Get adherence statistics
-- SELECT 
--     COUNT(CASE WHEN taken_status = 'taken' THEN 1 END) as taken_count,
--     COUNT(CASE WHEN taken_status = 'skipped' THEN 1 END) as skipped_count,
--     COUNT(CASE WHEN taken_status = 'missed' THEN 1 END) as missed_count
-- FROM adherence_log
-- WHERE user_id = 1 AND DATE(scheduled_time) = CURDATE();
