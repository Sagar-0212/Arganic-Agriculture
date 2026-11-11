import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import app from './src/app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}/api`);
  });
}).catch(err => {
  console.error('Failed to start server due to database connection error:', err);
});
