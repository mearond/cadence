import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { requireAuth } from './middleware/authMiddleware.js';
import eventRoutes from './routes/eventRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/vendors', vendorRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cadence backend is running' });
});
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});
app.get('/api/protected-test', requireAuth, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});