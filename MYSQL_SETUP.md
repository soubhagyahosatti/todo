# TODO App - MySQL Setup Guide

## Prerequisites
- Node.js installed
- MySQL Server installed and running
- npm or yarn

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create MySQL Database
Open MySQL command line or MySQL Workbench and run the SQL queries from `database.sql`:

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS todo;
USE todo;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Todos Table
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

### 3. Configure Environment Variables
Edit the `.env` file with your MySQL credentials:

```env
VITE_API_URL=http://localhost:5000

# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=todo
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
```

### 4. Run the Application

**Terminal 1 - Start Backend Server:**
```bash
npm run server
```

**Terminal 2 - Start Frontend Development Server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Todos
- `GET /api/todos` - Get all todos for user
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Database Schema

### Users Table
| Column | Type | Details |
|--------|------|---------|
| id | INT | Primary Key, Auto Increment |
| email | VARCHAR(255) | Unique, Required |
| password | VARCHAR(255) | Required |
| name | VARCHAR(255) | Required |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### Todos Table
| Column | Type | Details |
|--------|------|---------|
| id | INT | Primary Key, Auto Increment |
| user_id | INT | Foreign Key (users.id) |
| text | VARCHAR(500) | Required |
| completed | BOOLEAN | Default: FALSE |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

## Useful MySQL Commands

```sql
-- Show all databases
SHOW DATABASES;

-- Use todo database
USE todo;

-- Show all tables
SHOW TABLES;

-- Describe users table
DESCRIBE users;

-- Describe todos table
DESCRIBE todos;

-- View all users
SELECT * FROM users;

-- View all todos
SELECT * FROM todos;

-- View todos for specific user
SELECT * FROM todos WHERE user_id = 1;

-- Delete all data (use with caution)
DELETE FROM todos;
DELETE FROM users;

-- Drop database (use with extreme caution)
DROP DATABASE todo;
```

## Troubleshooting

### Connection Error
- Check if MySQL server is running
- Verify credentials in `.env` file
- Ensure database is created

### Port Already in Use
Change the PORT in `.env` file to an available port (e.g., 5001)

### CORS Error
Frontend should be running on a different port. Default: 5173 (frontend), 5000 (backend)

## Security Notes
- Change `JWT_SECRET` in production
- Use strong database passwords
- Never commit `.env` file with real credentials
- Use environment variables for sensitive data
