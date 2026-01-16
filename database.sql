-- =====================================================
-- TODO App Database Schema
-- Database: todo
-- =====================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS todo;
USE todo;

-- =====================================================
-- Users Table
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Todos Table
-- =====================================================
CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  text VARCHAR(500) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sample Queries (Optional - for testing)
-- =====================================================

-- Insert a sample user
-- INSERT INTO users (email, password, name) VALUES ('test@example.com', 'hashed_password', 'John Doe');

-- Insert sample todos for user with id 1
-- INSERT INTO todos (user_id, text, completed) VALUES (1, 'Buy groceries', FALSE);
-- INSERT INTO todos (user_id, text, completed) VALUES (1, 'Complete project', FALSE);

-- Get all todos for a user
-- SELECT * FROM todos WHERE user_id = 1 ORDER BY created_at DESC;

-- Update todo status
-- UPDATE todos SET completed = TRUE WHERE id = 1;

-- Delete a todo
-- DELETE FROM todos WHERE id = 1;

-- Get user with email
-- SELECT * FROM users WHERE email = 'test@example.com';
