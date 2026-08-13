import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);
