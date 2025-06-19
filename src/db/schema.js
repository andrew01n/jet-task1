const { pgTable, serial, varchar, text, real, integer, timestamp } = require('drizzle-orm/pg-core');
const { relations } = require('drizzle-orm');

// Customer table
const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  surname: varchar('surname', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ShopItemCategory table
const shopItemCategories = pgTable('shop_item_categories', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ShopItem table
const shopItems = pgTable('shop_items', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  price: real('price').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Junction table for ShopItem and ShopItemCategory (many-to-many relationship)
const shopItemsToCategories = pgTable('shop_items_to_categories', {
  id: serial('id').primaryKey(),
  shopItemId: integer('shop_item_id').notNull().references(() => shopItems.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => shopItemCategories.id, { onDelete: 'cascade' }),
});

// Order table
const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// OrderItem table
const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  shopItemId: integer('shop_item_id').notNull().references(() => shopItems.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relations
const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

const shopItemCategoriesRelations = relations(shopItemCategories, ({ many }) => ({
  shopItemsToCategories: many(shopItemsToCategories),
}));

const shopItemsRelations = relations(shopItems, ({ many }) => ({
  shopItemsToCategories: many(shopItemsToCategories),
  orderItems: many(orderItems),
}));

const shopItemsToCategoriesRelations = relations(shopItemsToCategories, ({ one }) => ({
  shopItem: one(shopItems, {
    fields: [shopItemsToCategories.shopItemId],
    references: [shopItems.id],
  }),
  category: one(shopItemCategories, {
    fields: [shopItemsToCategories.categoryId],
    references: [shopItemCategories.id],
  }),
}));

const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  orderItems: many(orderItems),
}));

const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  shopItem: one(shopItems, {
    fields: [orderItems.shopItemId],
    references: [shopItems.id],
  }),
}));

module.exports = {
  customers,
  shopItemCategories,
  shopItems,
  shopItemsToCategories,
  orders,
  orderItems,
  customersRelations,
  shopItemCategoriesRelations,
  shopItemsRelations,
  shopItemsToCategoriesRelations,
  ordersRelations,
  orderItemsRelations,
};