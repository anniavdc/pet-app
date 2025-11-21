import { AppDataSource } from '@infrastructure/database/data-source';
import petController from '@presentation/controllers/pet.controller';
import weightControllers from '@presentation/controllers/weight.controller';
import { errorHandler } from '@presentation/middlewares/error.middleware';
import * as dotenv from 'dotenv';
import express from 'express';
import 'reflect-metadata';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', petController);
app.use('/api', weightControllers);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
    process.exit(1);
  });

export default app;
