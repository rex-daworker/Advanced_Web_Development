# EcoRide - E-Bike Rental System (Final Project)

A full-stack web application for managing e-bike rentals with user authentication, booking system, and admin management features.

## Project Structure

```
├── server.js                      # Express server entry point
├── package.json                   # Node dependencies
├── Dockerfile                     # Docker image configuration
├── docker-compose.yml             # Docker Compose setup
├── .env                          # Environment variables
├── middleware/
│   └── auth.middleware.js        # JWT authentication & role-based access
├── src/
│   ├── app.js                    # Express app configuration
│   ├── db/
│   │   └── pool.js              # PostgreSQL connection pool
│   ├── routes/
│   │   ├── auth.routes.js       # Authentication endpoints
│   │   ├── bikes.routes.js      # Bike catalog endpoints
│   │   └── orders.routes.js     # Order/booking endpoints
│   ├── services/
│   │   └── log.service.js       # Activity logging
│   └── validators/
│       └── user.validators.js   # Input validation
├── db/
│   └── init/
│       ├── 000_create_users.sql
│       ├── 001_create_bikes.sql
│       ├── 002_create_orders.sql
│       └── 003_create_logs.sql
└── public/                       # Frontend assets
    ├── index.html               # Home page
    ├── catalog.html             # Bikes catalog
    ├── order.html               # Booking form
    ├── login.html               # Login page
    ├── signup.html              # Registration page
    └── success.html             # Order confirmation
```

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Frontend**: HTML5 + Tailwind CSS + Vanilla JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Containerization**: Docker & Docker Compose

## Features

### User Features
- ✅ User registration & login with JWT authentication
- ✅ Browse e-bike catalog with prices & availability
- ✅ Create bike rental orders with date selection
- ✅ View order history
- ✅ Cancel pending orders
- ✅ Responsive design (mobile & desktop)

### Admin Features
- ✅ Manage bike inventory
- ✅ View all user orders
- ✅ Update order status (pending → confirmed → active → completed)
- ✅ Activity logging & audit trail

### Security
- ✅ Password hashing with bcryptjs
- ✅ JWT authentication with expiry
- ✅ Role-based access control (customer, manager, administrator)
- ✅ Input validation & error handling
- ✅ HTTPS-ready infrastructure

## Quick Start

### Prerequisites
- Docker & Docker Compose
- OR Node.js 20+ and PostgreSQL 13+

### Option 1: Using Docker (Recommended)

```bash
# 1. Clone/navigate to the project
cd Final-Project

# 2. Start everything with Docker Compose
docker compose up -d --build

# 3. Application will be available at:
#    Frontend: http://localhost:8080
#    API: http://localhost:8080/api
```

**Docker Compose Commands**:
```bash
# View logs
docker logs ecoride-web -f
docker logs ecoride-db -f

# Connect to web container
docker exec -it ecoride-web /bin/sh

# Access database directly
docker exec -it ecoride-db psql -U ecoride_user -d ecoride_db

# Stop services
docker compose down

# Remove volumes (reset database)
docker compose down --volumes
```

### Option 2: Local Development

```bash
# 1. Install dependencies
npm install

# 2. Make sure PostgreSQL is running locally
# Edit .env with your local database credentials

# 3. Create database and tables manually
psql -U your_user -d your_db -f db/init/000_create_users.sql
psql -U your_user -d your_db -f db/init/001_create_bikes.sql
psql -U your_user -d your_db -f db/init/002_create_orders.sql
psql -U your_user -d your_db -f db/init/003_create_logs.sql

# 4. Start the server
npm start

# 5. Or use watch mode for development
npm run dev
```

## API Endpoints

### Authentication
```
POST   /api/auth/register        - Create new account
POST   /api/auth/login           - Login (returns JWT token)
POST   /api/auth/logout          - Logout
GET    /api/auth/me              - Get current user (protected)
```

### Bikes (Public Read, Admin Write)
```
GET    /api/bikes                - List all bikes
GET    /api/bikes/:id            - Get bike details
POST   /api/bikes                - Create bike (admin only)
PUT    /api/bikes/:id            - Update bike (admin only)
```

### Orders (Protected)
```
GET    /api/orders               - List user's orders (admin sees all)
GET    /api/orders/:id           - Get order details
POST   /api/orders               - Create new order
PUT    /api/orders/:id           - Update order status (admin only)
POST   /api/orders/:id/cancel    - Cancel pending order
```

## Testing Workflow

### 1. Create an Account
```bash
# Visit http://localhost:8080/signup.html
# Fill in the form and submit
```

### 2. Browse Bikes
```bash
# Visit http://localhost:8080/catalog.html
# See list of available e-bikes with pricing
```

### 3. Create an Order
```bash
# Click "Order Now" on any bike
# Select:
#   - Bike type
#   - Quantity
#   - Rental dates
#   - Any special requests
# Submit order
```

### 4. Login & View Orders
```bash
# Create account, then generate a token via login
# This token is stored in localStorage
# Use it to access protected endpoints
```

### 5. Admin Testing
```bash
# Manually insert admin user into database:
INSERT INTO users (first_name, last_name, email, password_hash, role) 
VALUES ('Admin', 'User', 'admin@ecoride.com', 
        '$2a$10/hashed_password_here', 'administrator');
```

## Database Schema

### Users Table
- Stores user accounts with hashed passwords
- Roles: customer, manager, administrator
- Timestamps: created_at, updated_at, deleted_at (soft delete)

### Bikes Table
- Bike inventory with pricing (daily & weekly rates)
- Tracks availability (available_units / total_units)
- Soft deletion support

### Orders Table
- Customer rental bookings
- Links users to bikes
- Status tracking: pending → confirmed → active → completed → cancelled
- Rental period dates

### Logs Table
- Audit trail of all system activities
- Tracks: action, entity_type, user_id, status, timestamp

## Environment Variables

```env
# Database
PGHOST=database          # PostgreSQL host
PGPORT=5432             # PostgreSQL port
PGDATABASE=ecoride_db   # Database name
PGUSER=ecoride_user     # Database user
PGPASSWORD=password     # Database password

# Server
IPORT=3000              # Internal port
EPORT=8080              # External port (mapped)
EPGPORT=5432            # External DB port

# Security
JWT_SECRET=your_secret  # Change in production!

# Environment
NODE_ENV=development    # or production
```

## Common Tasks

### Add Sample Bikes to Database

```bash
# Connect to database
docker exec -it ecoride-db psql -U ecoride_user -d ecoride_db

# Insert bikes
INSERT INTO bikes (name, description, price_per_day, price_per_week, bike_type, total_units, available_units) 
VALUES 
('Prime City E-Bike', 'Stylish and efficient', 39, 199, 'city', 5, 5),
('Mountain Explorer', 'Durable and powerful', 49, 249, 'mountain', 3, 3),
('Family Cargo Bike', 'Spacious design', 59, 299, 'cargo', 2, 2);
```

### Production Deployment

```bash
# 1. Update .env with production values
JWT_SECRET=your-very-long-random-secret
NODE_ENV=production

# 2. Build and push to container registry
docker build -t your-registry/ecoride:1.0 .
docker push your-registry/ecoride:1.0

# 3. Deploy to your hosting platform (AWS, Azure, DigitalOcean, etc.)
# Using docker-compose.yml on your server
docker compose -f docker-compose.yml up -d
```

## Troubleshooting

### Database Connection Error
```
Solution: Check .env variables match docker-compose.yml
Make sure database container is running: docker logs ecoride-db
```

### Port Already in Use
```
Solution: Change EPORT or EPGPORT in .env
docker compose down  # Stop current containers
Update .env, then docker compose up -d --build
```

### JWT Token Invalid
```
Solution: Token may be expired (7-day expiry)
Clear localStorage and login again
```

### Videos/Images Not Loading
```
Solution: Ensure files are in public/images and public/videos
Update image paths in HTML if needed
```

## Security Best Practices

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Set strong database passwords**
4. **Validate all inputs** on backend
5. **Use environment variables** for secrets
6. **Keep dependencies updated**: `npm audit`, `npm update`
7. **Enable CORS** only for trusted domains
8. **Implement rate limiting** for API endpoints

## Performance Optimization

- ✅ Database indexes on frequently queried fields
- ✅ Static file caching (Tailwind CDN)
- ✅ JWT token validation at middleware
- ✅ Connection pooling for database
- ✅ Lazy loading of images

## Future Enhancements

- [ ] Payment processing (Stripe/PayPal integration)
- [ ] Email notifications for orders
- [ ] Real-time inventory updates (WebSockets)
- [ ] User profile & order history dashboard
- [ ] Admin analytics dashboard
- [ ] Two-factor authentication (2FA)
- [ ] Mobile app (React Native)
- [ ] GPS tracking for bikes
- [ ] Insurance add-ons
- [ ] Subscription plans

## Learning Outcomes

This project demonstrates:
- ✅ Full-stack web development (Node.js + React principles)
- ✅ REST API design & implementation
- ✅ Database design with PostgreSQL
- ✅ User authentication & authorization
- ✅ Docker containerization
- ✅ Frontend interactivity with vanilla JavaScript
- ✅ Security best practices
- ✅ Error handling & logging

## Support & Contact

- **Author**: Rex Odomero Oghenerobo
- **Instructor**: Advanced Web Development Course
- **Date**: 2025-2026

## License

MIT License - See LICENSE file for details

---

**Happy coding! 🚴‍♂️ 🌱**
