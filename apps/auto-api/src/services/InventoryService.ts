import { executeQuery } from '../config/db';

export class InventoryService {
  static async updateStock(inventoryId: number, quantity: number, movementType: string, referenceId?: number) {
    const connection = await executeQuery('BEGIN NULL; END;'); // Dummy to ensure pool is used if needed, though executeQuery handles it.
    
    // Update inventory quantity
    const updateSql = `
      UPDATE inventory 
      SET quantity = quantity + :quantity 
      WHERE inventory_id = :inventoryId
    `;
    await executeQuery(updateSql, { quantity, inventoryId });

    // Log movement
    const logSql = `
      INSERT INTO stock_movements (inventory_id, movement_type, quantity, reference_id)
      VALUES (:inventoryId, :movementType, :quantity, :referenceId)
    `;
    await executeQuery(logSql, { inventoryId, movementType, quantity, referenceId });
  }

  static async getInventoryByProduct(productId: number) {
    const sql = `
      SELECT i.*, w.warehouse_name, w.location 
      FROM inventory i 
      JOIN warehouses w ON i.warehouse_id = w.warehouse_id 
      WHERE i.product_id = :productId
    `;
    const result: any = await executeQuery(sql, { productId });
    return result.rows;
  }

  static async getLowStockAlerts(threshold: number = 10) {
    const sql = `
      SELECT i.*, p.product_name, p.sku, w.warehouse_name 
      FROM inventory i 
      JOIN products p ON i.product_id = p.product_id 
      JOIN warehouses w ON i.warehouse_id = w.warehouse_id 
      WHERE i.quantity <= :threshold
    `;
    const result: any = await executeQuery(sql, { threshold });
    return result.rows;
  }
}
