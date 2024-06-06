import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createServer } from 'node:http';
import { server as socketServer } from './sockets';
import log from './utils/logger';

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(cors(
  {
    // Allow requests from all origins
    origin: '*',
    credentials: true,
  }
));
app.use(helmet());
app.use(hpp());
app.use(express.json());
app.use(limiter);

// Routes
import routes from './routes';
app.use('/api', routes);

// Socket.io
socketServer(server);

server.listen(port, () => {
  log(`[server]: Server is running on http://localhost:${port} 🩷`, 'info');
});