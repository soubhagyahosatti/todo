import express from 'express'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Middleware
app.use(cors())
app.use(express.json())

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'todo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const connection = await pool.getConnection()

    // Check if user exists
    const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [email])
    if (rows.length > 0) {
      connection.release()
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const [result] = await connection.execute(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    )

    const userId = result.insertId
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

    connection.release()

    res.json({
      token,
      user: { id: userId, email, name }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Signup failed' })
  }
})

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const connection = await pool.getConnection()

    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      connection.release()
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = rows[0]
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      connection.release()
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

    connection.release()

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Signin failed' })
  }
})

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.execute('SELECT id, email, name FROM users WHERE id = ?', [
      req.userId
    ])
    connection.release()

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Todo Routes
app.get('/api/todos', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [todos] = await connection.execute('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC', [
      req.userId
    ])
    connection.release()

    res.json(todos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch todos' })
  }
})

app.post('/api/todos', verifyToken, async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    const connection = await pool.getConnection()
    const [result] = await connection.execute(
      'INSERT INTO todos (user_id, text, completed) VALUES (?, ?, ?)',
      [req.userId, text, false]
    )

    const [rows] = await connection.execute('SELECT * FROM todos WHERE id = ?', [result.insertId])
    connection.release()

    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create todo' })
  }
})

app.put('/api/todos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { text, completed } = req.body

    const connection = await pool.getConnection()

    // Verify ownership
    const [checkRows] = await connection.execute('SELECT user_id FROM todos WHERE id = ?', [id])
    if (checkRows.length === 0 || checkRows[0].user_id !== req.userId) {
      connection.release()
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (text !== undefined) {
      await connection.execute('UPDATE todos SET text = ? WHERE id = ?', [text, id])
    }
    if (completed !== undefined) {
      await connection.execute('UPDATE todos SET completed = ? WHERE id = ?', [completed, id])
    }

    const [rows] = await connection.execute('SELECT * FROM todos WHERE id = ?', [id])
    connection.release()

    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update todo' })
  }
})

app.delete('/api/todos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params

    const connection = await pool.getConnection()

    // Verify ownership
    const [checkRows] = await connection.execute('SELECT user_id FROM todos WHERE id = ?', [id])
    if (checkRows.length === 0 || checkRows[0].user_id !== req.userId) {
      connection.release()
      return res.status(403).json({ error: 'Unauthorized' })
    }

    await connection.execute('DELETE FROM todos WHERE id = ?', [id])
    connection.release()

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete todo' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
