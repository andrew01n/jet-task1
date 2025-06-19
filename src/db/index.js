import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Initialize database with test data
export async function initializeDatabase() {
  try {
    console.log('Initializing database with test data...');
    
    // Insert test categories
    const [electronicsCategory] = await db.insert(schema.shopItemCategories).values({
      title: 'Electronics',
      description: 'Electronic devices and gadgets'
    }).returning();
    
    const [clothingCategory] = await db.insert(schema.shopItemCategories).values({
      title: 'Clothing',
      description: 'Fashion and apparel'
    }).returning();
    
    const [booksCategory] = await db.insert(schema.shopItemCategories).values({
      title: 'Books',
      description: 'Books and literature'
    }).returning();
    
    // Insert test customers
    const [customer1] = await db.insert(schema.customers).values({
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com'
    }).returning();
    
    const [customer2] = await db.insert(schema.customers).values({
      name: 'Jane',
      surname: 'Smith',
      email: 'jane.smith@example.com'
    }).returning();
    
    // Insert test shop items
    const [laptop] = await db.insert(schema.shopItems).values({
      title: 'Laptop',
      description: 'High-performance laptop',
      price: 999.99,
      categoryId: electronicsCategory.id
    }).returning();
    
    const [smartphone] = await db.insert(schema.shopItems).values({
      title: 'Smartphone',
      description: 'Latest smartphone model',
      price: 699.99,
      categoryId: electronicsCategory.id
    }).returning();
    
    const [tshirt] = await db.insert(schema.shopItems).values({
      title: 'T-Shirt',
      description: 'Cotton t-shirt',
      price: 29.99,
      categoryId: clothingCategory.id
    }).returning();
    
    const [book] = await db.insert(schema.shopItems).values({
      title: 'Programming Book',
      description: 'Learn programming fundamentals',
      price: 49.99,
      categoryId: booksCategory.id
    }).returning();
    
    // Insert test orders
    const [order1] = await db.insert(schema.orders).values({
      customerId: customer1.id
    }).returning();
    
    const [order2] = await db.insert(schema.orders).values({
      customerId: customer2.id
    }).returning();
    
    // Insert test order items
    await db.insert(schema.orderItems).values([
      {
        orderId: order1.id,
        shopItemId: laptop.id,
        quantity: 1
      },
      {
        orderId: order1.id,
        shopItemId: tshirt.id,
        quantity: 2
      },
      {
        orderId: order2.id,
        shopItemId: smartphone.id,
        quantity: 1
      },
      {
        orderId: order2.id,
        shopItemId: book.id,
        quantity: 3
      }
    ]);
    
    console.log('Database initialized successfully with test data!');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Don't throw error if data already exists
    if (!error.message.includes('duplicate key')) {
      throw error;
    }
  }
} 