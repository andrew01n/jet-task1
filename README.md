## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database for the application:
```sql
CREATE DATABASE shopdb;
CREATE DATABASE shopdb_test; -- For testing
```

#### Option B: Neon DB (Cloud PostgreSQL)
1. [Neon](https://www.instagres.com/)
2. Click Try it in browser
3. Get your connection string

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/shopdb
PORT=3000
NODE_ENV=development
```

For testing, also configure `.env.test`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/shopdb_test
PORT=3001
NODE_ENV=test
```

### 4. Database Schema

Generate and push the database schema:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Seed Test Data

Start the server and seed the database:

```bash
npm run dev
```

Then make a POST request to seed the database:

```bash
curl -X POST http://localhost:3000/api/seed
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Server will start on http://localhost:3000 with auto-reload.

### Production Mode
```bash
npm start
```

### Database Studio (Optional)
```bash
npm run db:studio
```
Opens Drizzle Studio for database management.

## API Endpoints

### Base URL: `http://localhost:3000`

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Shop Items
- `GET /api/shop-items` - Get all shop items
- `GET /api/shop-items/:id` - Get shop item by ID
- `POST /api/shop-items` - Create new shop item
- `PUT /api/shop-items/:id` - Update shop item
- `DELETE /api/shop-items/:id` - Delete shop item

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Utility
- `GET /health` - Health check endpoint
- `POST /api/seed` - Seed database with test data

## API Examples

### Create a Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "surname": "Doe",
    "email": "john.doe@example.com"
  }'
```

### Create a Category
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Electronics",
    "description": "Electronic devices and gadgets"
  }'
```

### Create a Shop Item
```bash
curl -X POST http://localhost:3000/api/shop-items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smartphone",
    "description": "Latest model smartphone",
    "price": 699.99,
    "categoryIds": [1]
  }'
```

### Create an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {
        "shopItemId": 1,
        "quantity": 2
      }
    ]
  }'
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Test Coverage
```bash
npm test -- --coverage
```

## Test Structure

The test suite includes comprehensive endpoint testing for:
- **Customer CRUD operations**
- **Category CRUD operations**
- **Shop Item CRUD operations** (including category relationships)
- **Order CRUD operations** (including complex relationships)
- **Error handling** and validation
- **Data integrity** and constraints

Tests are located in the `tests/` directory:
- `customers.test.js` - Customer endpoint tests
- `categories.test.js` - Category endpoint tests
- `shopItems.test.js` - Shop item endpoint tests
- `orders.test.js` - Order endpoint tests

## Database Schema Details

The application uses PostgreSQL with the following key relationships:

1. **ShopItems ↔ Categories**: Many-to-many via `shop_items_to_categories` junction table
2. **Orders ↔ Customers**: Many-to-one (each order belongs to one customer)
3. **Orders ↔ OrderItems**: One-to-many (each order can have multiple items)
4. **OrderItems ↔ ShopItems**: Many-to-one (each order item references one shop item)

All tables include `created_at` and `updated_at` timestamps for audit trails.

## Error Handling

The API includes comprehensive error handling:
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate data (e.g., email already exists)
- **500 Internal Server Error**: Server-side errors

## Development Notes

- The application uses Drizzle ORM for type-safe database operations
- All sensitive data should be stored in environment variables
- The seeding endpoint is available for development/testing purposes
- Database migrations are handled via Drizzle Kit
- CORS is enabled for cross-origin requests
- Security headers are applied via Helmet middleware

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a production PostgreSQL database
3. Configure proper environment variables
4. Run database migrations: `npm run db:push`
5. Start the application: `npm start`

For cloud deployment, consider platforms like:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

With database hosting on:
- Neon
- Supabase
- Railway PostgreSQL
- AWS RDS