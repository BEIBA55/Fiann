# Event Management System

A full-stack MERN application for managing and discovering events, built with TypeScript, GraphQL, Next.js, and MongoDB.

## 🎯 Project Overview

EventHub is a comprehensive event management platform that allows users to:
- **Discover Events**: Browse published events by category and status
- **Create Events**: Organizers can create and manage their events
- **Register**: Users can register for events they're interested in
- **Comment & Rate**: Share feedback and rate events
- **Real-time Updates**: Get instant notifications about new registrations and comments

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express.js
- GraphQL (Apollo Server)
- MongoDB + Mongoose
- TypeScript
- JWT Authentication
- GraphQL Subscriptions (WebSocket)

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Apollo Client
- Zustand (State Management)
- React Hook Form + Zod (Form Validation)

**DevOps:**
- Docker & Docker Compose
- Jest (Testing)

## 📊 Data Models

### User
- `name` (String, required)
- `email` (String, unique, required)
- `password` (String, hashed, required)
- `role` (Enum: USER, ORGANIZER, ADMIN)
- `avatar` (String, optional)
- `isDeleted` (Boolean, soft delete)

### Event
- `title` (String, required)
- `description` (String, required)
- `date` (Date, required, future date)
- `location` (String, required)
- `capacity` (Number, required)
- `organizerId` (ObjectId, ref: User)
- `status` (Enum: DRAFT, PUBLISHED, CANCELLED, COMPLETED)
- `category` (Enum: CONFERENCE, WORKSHOP, SEMINAR, NETWORKING, CONCERT, SPORTS, OTHER)
- `imageUrl` (String, optional)
- `isDeleted` (Boolean, soft delete)

### Registration
- `userId` (ObjectId, ref: User)
- `eventId` (ObjectId, ref: Event)
- `status` (Enum: PENDING, CONFIRMED, CANCELLED, ATTENDED)
- `registeredAt` (Date)
- `notes` (String, optional)
- `isDeleted` (Boolean, soft delete)

### Comment
- `userId` (ObjectId, ref: User)
- `eventId` (ObjectId, ref: Event)
- `content` (String, required)
- `rating` (Number, 1-5, optional)
- `isDeleted` (Boolean, soft delete)

### Relationships
- User 1:N Event (organizer)
- User N:M Event (through Registration)
- Event 1:N Comment
- Event 1:N Registration

## 🔌 GraphQL API

### Queries (6+)
- `me` - Get current user
- `users` - List all users
- `user(id)` - Get user by ID
- `events(status, category, limit, offset)` - List events with filters
- `event(id)` - Get event by ID
- `myEvents` - Get current user's events
- `registrations(eventId, userId)` - List registrations
- `registration(id)` - Get registration by ID
- `myRegistrations` - Get current user's registrations
- `comments(eventId)` - List comments for an event
- `comment(id)` - Get comment by ID

### Mutations (6+)
- `register(input)` - Register new user
- `login(input)` - Authenticate user
- `createEvent(input)` - Create new event
- `updateEvent(id, input)` - Update event
- `deleteEvent(id)` - Soft delete event
- `createRegistration(input)` - Register for event
- `updateRegistration(id, input)` - Update registration status
- `cancelRegistration(id)` - Cancel registration
- `createComment(input)` - Add comment
- `updateComment(id, input)` - Update comment
- `deleteComment(id)` - Delete comment

### Subscriptions (3+)
- `eventCreated` - New event created
- `eventUpdated` - Event updated
- `registrationCreated(eventId)` - New registration for event
- `registrationUpdated(eventId)` - Registration updated
- `commentAdded(eventId)` - New comment on event

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd Final
```

2. **Start all services**
```bash
docker-compose up
```

This will start:
- MongoDB on port 27017
- GraphQL API on http://localhost:4000
- Next.js Client on http://localhost:3000

3. **Seed the database** (optional)
```bash
# In a new terminal
docker exec -it event-management-api npm run seed
```

### Local Development

#### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend Setup
```bash
cd client
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

## 🧪 Testing

### Run Tests
```bash
cd server
npm test
```

### Test Coverage
```bash
cd server
npm run test:coverage
```

**Test Suite:**
- 10+ Unit tests for resolvers
- 1+ Integration test for event flow
- Tests cover authentication, events, registrations, and comments

## 📱 Key Screens

1. **Home Page** (`/`) - Landing page with navigation
2. **Login** (`/login`) - User authentication
3. **Register** (`/register`) - New user registration
4. **Events List** (`/events`) - Browse all published events
5. **Event Details** (`/events/[id]`) - View event, register, comment
6. **Create Event** (`/events/create`) - Organizers create events
7. **Profile** (`/profile`) - User profile and registrations

## 🔄 Real-time Features

### Testing Subscriptions

1. **Open Event Details Page**
   - Navigate to any published event
   - Open browser console to see subscription logs

2. **Test Comment Subscription**
   - Open event page in two browser windows
   - In window 1: Add a comment
   - In window 2: See the comment appear in real-time

3. **Test Registration Subscription**
   - Open event page in two windows
   - In window 1: Register for the event
   - In window 2: See registration count update

### WebSocket Endpoint
- **Development**: `ws://localhost:4000/graphql`
- **Production**: `wss://your-domain.com/graphql`

## 🔐 Authentication

### Test Credentials (after seeding)
- **Admin**: `admin@example.com` / `password123`
- **Organizer**: `organizer@example.com` / `password123`
- **User**: `jane@example.com` / `password123`

### JWT Token
- Stored in localStorage after login
- Sent in Authorization header: `Bearer <token>`
- Expires in 7 days (configurable)

## 📝 Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://mongo:27017/event-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Client (.env.local)
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4000/graphql
```

## 🐳 Docker

### Build Images
```bash
docker-compose build
```

### Start Services
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

### Clean Volumes
```bash
docker-compose down -v
```

## 📦 Project Structure

```
Final/
├── server/
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   ├── graphql/          # GraphQL schema & resolvers
│   │   ├── utils/            # Auth, errors, validation
│   │   ├── config/           # Database config
│   │   ├── scripts/          # Seed script
│   │   ├── __tests__/        # Jest tests
│   │   └── index.ts          # Entry point
│   ├── Dockerfile
│   └── package.json
├── client/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # React components
│   ├── lib/                  # Apollo Client, GraphQL queries
│   ├── store/                # Zustand stores
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 🛠️ Scripts

### Server
- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run seed` - Seed database

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Features

- ✅ TypeScript strict mode
- ✅ GraphQL with Subscriptions
- ✅ JWT Authentication & Authorization
- ✅ Form Validation (Zod + React Hook Form)
- ✅ Real-time Updates (WebSocket)
- ✅ Responsive Design (TailwindCSS)
- ✅ State Management (Zustand)
- ✅ Soft Delete
- ✅ Error Handling
- ✅ Docker Support
- ✅ Comprehensive Tests

## 📄 License

ISC

## 👥 Team

**Contributors:**
- [Your Name] - Backend, GraphQL, Testing
- [Partner Name] - Frontend, UI/UX, Subscriptions

## 🔗 Production Demo

**Frontend**: [Add your production URL]
**GraphQL Endpoint**: [Add your GraphQL endpoint]
**WebSocket**: [Add your WS endpoint]

## 📚 Additional Resources

- [GraphQL Documentation](https://graphql.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [MongoDB](https://www.mongodb.com/docs/)

---

**Note**: Remember to change JWT_SECRET and other sensitive values in production!

