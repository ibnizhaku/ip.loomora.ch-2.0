import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import productRoutes from './routes/products.js';
import quoteRoutes from './routes/quotes.js';
import orderRoutes from './routes/orders.js';
import invoiceRoutes from './routes/invoices.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const prisma = new PrismaClient();

const fastify = Fastify({
  logger: true,
});

// Plugins
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
});

// Decorate with Prisma
fastify.decorate('prisma', prisma);

// Auth decorator
fastify.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(customerRoutes, { prefix: '/api/customers' });
fastify.register(productRoutes, { prefix: '/api/products' });
fastify.register(quoteRoutes, { prefix: '/api/quotes' });
fastify.register(orderRoutes, { prefix: '/api/orders' });
fastify.register(invoiceRoutes, { prefix: '/api/invoices' });
fastify.register(dashboardRoutes, { prefix: '/api/dashboard' });

// Health check
fastify.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`🚀 Server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await fastify.close();
});

start();

// Type declarations
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: any;
  }
}
