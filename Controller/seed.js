import { db } from "../db/index.js";
import { users } from "../db/schema.js";

async function insertUser() {
  try {
    await db.insert(users).values({
      name: "vivek",
      email: "vivek@gmail.com",
      password: "123",
      role: "manager",
    });

    console.log("User inserted ");
  } catch (err) {
    console.error(err);
  }
}

async function insertUser1() {
  try {
    await db.insert(users).values({
      name: "sumit",
      email: "sumit@gmail.com",
      password: "123",
      role: "admin",
    });

    console.log("User inserted ");
  } catch (err) {
    console.error(err);
  }
}

insertUser();
 





