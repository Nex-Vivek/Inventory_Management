import { eq, ilike, or, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  products,
  categorytable,
  inventorys,
  itemPrice,
} from "../db/schema.js";
// Get all products with optional filtering by category and search term
export async function getAllProducts(req, res) {
  // const { category, search } = req.query;

  try {
    const query = db.select().from(products);
    const result = await query; // conditions.length > 0 ? await query.where(and(...conditions)) : await query;
    /*conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;*/

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (err) {
    console.error("Get products error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products." });
  }
}
// Get a single product by ID
export async function getProductById(req, res) {
  const { id } = req.params;

  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.productId, id))
      .limit(1);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    console.error("Get product error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch product." });
  }
}

// Create a new product
export async function createProduct(req, res) {
  const { name, categorys, price, stock } = req.body;

  if (!name || !categorys || price === undefined || stock === undefined) {
    return res.status(400).json({
      success: false,
      message: "name, category, price, and stock are required.",
    });
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Insert into category
      const [newCategory] = await tx
        .insert(categorytable)
        .values({
          categoryName: categorys,
        })
        .returning();

      // 2. Insert into products
      const [newProduct] = await tx
        .insert(products)
        .values({
          productName: name,
          categoryId: newCategory.categoryId, // FK
        })
        .returning();

      // 3. Insert into itemprice
      await tx.insert(itemPrice).values({
        itemPrice: String(price),
        itemId: newProduct.productId,
      });

      // 4. Insert into inventory
      await tx.insert(inventorys).values({
        itemId: newProduct.productId,
        stockIn: Number(stock),
      });

      return newProduct;
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: result,
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create product.",
    });
  }
}

// Update  product

export async function updateProduct(req, res) {
  const { id } = req.params ; 
  const { name, price, stock } = req.body ;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  if (name === undefined || price === undefined || stock === undefined) {
    return res.status(400).json({
      success: false,
      message: "name,  price, and stock are required.",
    });
  }

  try {  
    const result = await db.transaction(async (tx) => {
      // Update product
      const [updatedProduct] = await tx
        .update(products)
        .set({ productName: name })
        .where(eq(products.productId, id))
        .returning();

      if (!updatedProduct) {
        throw new Error("Product not found");
      }

      // Update price
      await tx
        .update(itemPrice)
        .set({ itemPrice: String(price) })
        .where(eq(itemPrice.itemId, id));

      // Update inventory
      await tx
        .update(inventorys)
        .set({ stockIn: Number(stock) })
        .where(eq(inventorys.itemId, id));

      return updatedProduct;
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update product.",
    });
  }
}

/* export async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.productId, id)) 
      .returning();

    if (!deleted) {
      return res`
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({
      success: true,
      message: `Product "${deleted.productName}" deleted successfully.`,
      data: deleted,
    });
  } catch (err) {
    console.error("Delete product error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product." });
  }
} */
export async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    // delete inventory first (foreign key dependency)
    await db.delete(inventorys).where(eq(inventorys.itemId, id));

    // delete product
    const [deleted] = await db
      .delete(products)
      .where(eq(products.productId, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Product "${deleted.productName}" deleted successfully.`,
      data: deleted,
    });
  } catch (err) {
    console.error("Delete product error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
}
