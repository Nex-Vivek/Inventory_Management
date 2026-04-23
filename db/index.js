/* import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "./schema.js";
// import { neon } from "@neondatabase/serverless";
const { Pool } = pkg;
dotenv.config();

//const DATABASE_URL =
//"postgresql://neondb_owner:npg_nE8lx5ZNTKkW@ep-floral-math-amw7n4wa-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log(process.env.DATABASE_URL);

pool
  .connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(" Database connection failed:", err.message);
  });

// Drizzle setup
export const db = drizzle({ schema }); */

import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "./schema.js";

const { Pool } = pkg;

// DB connection

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log("DB URL:", process.env.DATABASE_URL);

// test connection
pool
  .connect()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection failed:", err.message));

//
export const db = drizzle(pool, { schema });
