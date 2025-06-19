const { db } = require('./index');
const { customers, shopItemCategories, shopItems, shopItemsToCategories, orders, orderItems } = require('./schema');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Insert customers
    const seedCustomers = await db.insert(customers).values([
      { name: 'John', surname: 'Doe', email: 'john.doe@example.com' },
      { name: 'Jane', surname: 'Smith', email: 'jane.smith@example.com' },
      { name: 'Bob', surname: 'Johnson', email: 'bob.johnson@example.com' },
    ]).returning();

    console.log('✅ Customers seeded');

    // Insert categories
    const seedCategories = await db.insert(shopItemCategories).values([
      { title: 'Electronics', description: 'Electronic devices and gadgets' },
      { title: 'Clothing', description: 'Apparel and fashion items' },
      { title: 'Books', description: 'Books and educational materials' },
      { title: 'Home & Garden', description: 'Home improvement and gardening supplies' },
    ]).returning();

    console.log('✅ Categories seeded');

    // Insert shop items
    const seedItems = await db.insert(shopItems).values([
      { title: 'Smartphone', description: 'Latest model smartphone with advanced features', price: 699.99 },
      { title: 'Laptop', description: 'High-performance laptop for work and gaming', price: 1299.99 },
      { title: 'T-Shirt', description: 'Comfortable cotton t-shirt', price: 19.99 },
      { title: 'Jeans', description: 'Classic blue jeans', price: 49.99 },
      { title: 'Programming Book', description: 'Learn programming fundamentals', price: 39.99 },
      { title: 'Garden Tools Set', description: 'Complete set of garden tools', price: 89.99 },
    ]).returning();

    console.log('✅ Shop items seeded');

    // Link items to categories
    await db.insert(shopItemsToCategories).values([
      { shopItemId: seedItems[0].id, categoryId: seedCategories[0].id }, // Smartphone -> Electronics
      { shopItemId: seedItems[1].id, categoryId: seedCategories[0].id }, // Laptop -> Electronics
      { shopItemId: seedItems[2].id, categoryId: seedCategories[1].id }, // T-Shirt -> Clothing
      { shopItemId: seedItems[3].id, categoryId: seedCategories[1].id }, // Jeans -> Clothing
      { shopItemId: seedItems[4].id, categoryId: seedCategories[2].id }, // Book -> Books
      { shopItemId: seedItems[5].id, categoryId: seedCategories[3].id }, // Garden Tools -> Home & Garden
    ]);

    console.log('✅ Item-category relationships seeded');

    // Insert orders
    const seedOrders = await db.insert(orders).values([
      { customerId: seedCustomers[0].id },
      { customerId: seedCustomers[1].id },
    ]).returning();

    console.log('✅ Orders seeded');

    // Insert order items
    await db.insert(orderItems).values([
      { orderId: seedOrders[0].id, shopItemId: seedItems[0].id, quantity: 1 }, // John orders Smartphone
      { orderId: seedOrders[0].id, shopItemId: seedItems[2].id, quantity: 2 }, // John orders 2 T-Shirts
      { orderId: seedOrders[1].id, shopItemId: seedItems[1].id, quantity: 1 }, // Jane orders Laptop
      { orderId: seedOrders[1].id, shopItemId: seedItems[4].id, quantity: 1 }, // Jane orders Book
    ]);

    console.log('✅ Order items seeded');
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

module.exports = { seedDatabase };