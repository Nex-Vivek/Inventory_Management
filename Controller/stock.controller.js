import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { products, inventorys, transactions } from "../db/schema.js";

export async function updateStock(req, res) {
  try {
    const { productName, operation, quantity, note } = req.body;

    //  Validate input
    if (!productName || !operation || !quantity || !note) {
      return res.status(400).json({
        success: false,
        message: "productName, operation and quantity are required",
      });
    }

    if (!["IN", "OUT"].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: "Operation must be IN or OUT",
      });
    }

    //  Find product
    const product = await db
      .select()
      .from(products)
      .where(eq(products.productName, productName));

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const productId = product[0].productId;

    //  Check inventory exists
    let inventory = await db
      .select()
      .from(inventorys)
      .where(eq(inventorys.itemId, productId));

    //  If not exists → create inventory row
    if (inventory.length === 0) {
      await db.insert(inventorys).values({
        itemId: productId,
        stockIn: 0,
        stockOut: 0,
      });

      inventory = await db
        .select()
        .from(inventorys)
        .where(eq(inventorys.itemId, productId));
    }

    const current = inventory[0];

    // Update stock
    let newStockIn = current.stockIn;
    let newStockOut = current.stockOut;

    if (operation === "IN") {
      newStockIn += quantity;
    } else {
      const availableStock = current.stockIn - current.stockOut;

      if (quantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: "Not enough stock available",
        });
      }

      newStockOut += quantity;
    }

    // Update inventory table
    await db
      .update(inventorys)
      .set({
        stockIn: newStockIn,
        stockOut: newStockOut,
      })
      .where(eq(inventorys.itemId, productId));

    // Insert transaction
    await db.insert(transactions).values({
      itemid: productId,
      operation,
      quantity,
      note,
    });

    // Final stock
    const finalStock = newStockIn - newStockOut;

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: {
        productName,
        operation,
        quantity,
        finalStock,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
