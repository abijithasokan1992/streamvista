import { executeQuery } from '../config/db';

export class OrderService {
  static async createOrder(orderData: any) {
    const { customerId, totalAmount, items, paymentId } = orderData;
    
    // Create Order
    const orderSql = `
      INSERT INTO orders (customer_id, total_amount, status)
      VALUES (:customerId, :totalAmount, 'CONFIRMED')
      RETURNING order_id INTO :orderId
    `;
    const orderResult: any = await executeQuery(orderSql, {
      customerId, totalAmount,
      orderId: { type: 2002, dir: 3003 }
    });
    const orderId = orderResult.outBinds.orderId[0];

    // Create Order Items
    for (const item of items) {
      const itemSql = `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES (:orderId, :productId, :quantity, :unitPrice)
      `;
      await executeQuery(itemSql, {
        orderId,
        productId: item.PRODUCT_ID,
        quantity: item.quantity,
        unitPrice: item.PRICE
      });

      // Update Inventory (Reserve/Reduce)
      const inventorySql = `
        UPDATE inventory 
        SET quantity = quantity - :quantity 
        WHERE product_id = :productId AND quantity >= :quantity
      `;
      await executeQuery(inventorySql, { quantity: item.quantity, productId: item.PRODUCT_ID });
    }

    // Record Payment
    if (paymentId) {
      const paymentSql = `
        INSERT INTO payments (order_id, transaction_id, payment_method, amount, status)
        VALUES (:orderId, :transactionId, 'Razorpay', :amount, 'SUCCESS')
      `;
      await executeQuery(paymentSql, {
        orderId,
        transactionId: paymentId,
        amount: totalAmount
      });
    }

    return orderId;
  }

  static async getOrdersByCustomer(customerId: number) {
    const sql = `SELECT * FROM orders WHERE customer_id = :customerId ORDER BY created_at DESC`;
    const result: any = await executeQuery(sql, { customerId });
    return result.rows;
  }

  static async getOrderDetails(orderId: number) {
    const orderSql = `SELECT * FROM orders WHERE order_id = :orderId`;
    const itemsSql = `
      SELECT oi.*, p.product_name, p.sku 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.product_id 
      WHERE oi.order_id = :orderId
    `;
    
    const [orderRes, itemsRes]: any = await Promise.all([
      executeQuery(orderSql, { orderId }),
      executeQuery(itemsSql, { orderId })
    ]);

    return { ...orderRes.rows[0], items: itemsRes.rows };
  }
}
