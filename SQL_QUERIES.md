# SQL Queries Reference

## Database Setup

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS todo;

-- Switch to the database
USE todo;
```

## Users Table

```sql
-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Todos Table

```sql
-- Create Todos Table
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
```

## Common CRUD Operations

### Users

```sql
-- Get all users
SELECT * FROM users;

-- Get user by email
SELECT * FROM users WHERE email = 'user@example.com';

-- Get user by ID
SELECT * FROM users WHERE id = 1;

-- Insert a new user
INSERT INTO users (email, password, name) VALUES ('newuser@example.com', 'hashed_password', 'John Doe');

-- Update user name
UPDATE users SET name = 'Jane Doe' WHERE id = 1;

-- Update user email
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- Delete user (cascades to todos)
DELETE FROM users WHERE id = 1;
```

### Todos

```sql
-- Get all todos for a specific user
SELECT * FROM todos WHERE user_id = 1 ORDER BY created_at DESC;

-- Get active todos (not completed)
SELECT * FROM todos WHERE user_id = 1 AND completed = FALSE ORDER BY created_at DESC;

-- Get completed todos
SELECT * FROM todos WHERE user_id = 1 AND completed = TRUE ORDER BY created_at DESC;

-- Get a specific todo
SELECT * FROM todos WHERE id = 5;

-- Insert a new todo
INSERT INTO todos (user_id, text, completed) VALUES (1, 'Buy groceries', FALSE);

-- Update todo text
UPDATE todos SET text = 'Buy groceries and milk' WHERE id = 1;

-- Mark todo as completed
UPDATE todos SET completed = TRUE WHERE id = 1;

-- Mark todo as incomplete
UPDATE todos SET completed = FALSE WHERE id = 1;

-- Delete a specific todo
DELETE FROM todos WHERE id = 1;

-- Delete all todos for a user
DELETE FROM todos WHERE user_id = 1;
```

## Advanced Queries

```sql
-- Count todos per user
SELECT user_id, COUNT(*) as total_todos FROM todos GROUP BY user_id;

-- Count completed and incomplete todos for a user
SELECT 
  completed,
  COUNT(*) as count
FROM todos
WHERE user_id = 1
GROUP BY completed;

-- Get user with their todo count
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(t.id) as todo_count
FROM users u
LEFT JOIN todos t ON u.id = t.user_id
GROUP BY u.id;

-- Get todos with user information
SELECT 
  t.id,
  t.text,
  t.completed,
  t.created_at,
  u.name,
  u.email
FROM todos t
JOIN users u ON t.user_id = u.id
WHERE t.user_id = 1
ORDER BY t.created_at DESC;

-- Search todos by text
SELECT * FROM todos WHERE user_id = 1 AND text LIKE '%grocery%' ORDER BY created_at DESC;

-- Get recently modified todos
SELECT * FROM todos WHERE user_id = 1 ORDER BY updated_at DESC LIMIT 10;

-- Get todos created in the last 7 days
SELECT * FROM todos 
WHERE user_id = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC;
```

## Maintenance Queries

```sql
-- Show table structure
DESCRIBE users;
DESCRIBE todos;

-- Check indexes
SHOW INDEX FROM users;
SHOW INDEX FROM todos;

-- Get database size
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'todo';

-- Get row counts
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'todos', COUNT(*) FROM todos;

-- Truncate table (delete all data)
TRUNCATE TABLE todos;
TRUNCATE TABLE users;

-- Check table status
SHOW TABLE STATUS FROM todo;
```

## Database Backup

```sql
-- Backup using mysqldump (in terminal/command line)
mysqldump -u root -p todo > todo_backup.sql

-- Restore from backup
mysql -u root -p todo < todo_backup.sql
```

## Important Notes

- All passwords are stored using bcryptjs (hashed) in the application
- Foreign keys are enforced with CASCADE delete
- Indexes are created for better query performance
- UTF-8 encoding for better character support
- Timestamps auto-update when records are modified
