import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { schema } from './graphql/schema';
import { createContext } from './utils/context';
import { pubsub } from './graphql/pubsub';

dotenv.config();

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  // Connect to MongoDB
  await connectDatabase();

  // Create Express app
  const app = express();

  // CORS configuration - allow Apollo Studio in development
  const allowedOrigins = NODE_ENV === 'development' 
    ? [
        ...CORS_ORIGIN.split(','),
        'https://studio.apollographql.com',
        'https://studio.apollographql.com/sandbox',
      ]
    : CORS_ORIGIN.split(',');

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman, Apollo Sandbox)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin) || NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    schema,
    context: createContext,
    introspection: true, // Enable introspection for Apollo Sandbox
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        extensions: error.extensions,
      };
    },
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app as any, path: '/graphql', cors: false });

  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  useServer(
    {
      schema,
      context: async (ctx) => {
        // Extract token from connection params
        const token = ctx.connectionParams?.authorization as string | undefined;
        if (token) {
          const { verifyToken } = await import('./utils/auth');
          try {
            const payload = verifyToken(token.replace('Bearer ', ''));
            return {
              userId: payload.userId,
              userRole: payload.role,
              isAuthenticated: true,
            };
          } catch {
            return { isAuthenticated: false };
          }
        }
        return { isAuthenticated: false };
      },
    },
    wsServer
  );

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

