import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";

export const users = pgTable("logintable", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categorytable = pgTable("category", {
  categoryId: uuid("categoryid").primaryKey().defaultRandom(),
  categoryName: varchar("categoryname", { length: 100 }).notNull(),
});

export const products = pgTable("products", {
  productId: uuid("productid").primaryKey().defaultRandom(),
  productName: varchar("productname", { length: 100 }).notNull(),

  categoryId: uuid("categoryid")
    .notNull()
    .references(() => categorytable.categoryId),
});

export const itemPrice = pgTable("itemprice", {
  id: uuid("id").primaryKey().defaultRandom(),

  itemId: uuid("itemid")
    .notNull()
    .references(() => products.productId),

  itemPrice: numeric("itemprice", {
    precision: 10,
    scale: 2,
  }).notNull(),
});

export const inventorys = pgTable("inventorys", {
  inventoryId: uuid("inventoryid").primaryKey().defaultRandom(),

  itemId: uuid("itemid")
    .notNull()
    .references(() => products.productId),

  stockIn: integer("stockin").default(0),
  stockOut: integer("stockout").default(0),
  stockAlert: integer("stockalert").default(20),
});
