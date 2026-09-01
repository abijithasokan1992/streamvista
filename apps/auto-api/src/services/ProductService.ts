import { executeQuery } from '../config/db';

export class ProductService {
  static async createProduct(productData: any) {
    const { brandId, categoryId, sku, partNumber, oemNumber, productName, description, price, taxRate } = productData;
    const sql = `
      INSERT INTO products (brand_id, category_id, sku, part_number, oem_number, product_name, description, price, tax_rate)
      VALUES (:brandId, :categoryId, :sku, :partNumber, :oemNumber, :productName, :description, :price, :taxRate)
      RETURNING product_id INTO :productId
    `;
    const result: any = await executeQuery(sql, {
      brandId, categoryId, sku, partNumber, oemNumber, productName, description, price, taxRate,
      productId: { type: 2002, dir: 3003 }
    });
    return result.outBinds.productId[0];
  }

  static async seedCatalog() {
    console.log('[ProductService] Seeding StreamVista Enterprise Service Catalog...');
    const services = [
      { sku: 'SV-RIGHTS-01', name: 'OTT Digital & Satellite Rights', desc: 'Global Licensing Bundle', price: 75000 },
      { sku: 'SV-LOOP-01', name: 'Crayons Loop Premium Publishing', desc: 'Direct-to-OTT Distribution', price: 25000 },
      { sku: 'SV-QC-01', name: 'Content QC Clearance Certificate', desc: 'Technical Compliance Report', price: 5000 },
      { sku: 'SV-AI-POST-01', name: 'AI Audio & 4K Post-Production', desc: 'Studio Grade Enhancement', price: 15000 },
      { sku: 'SV-AI-DUB-01', name: 'AI Multi-Language Dubbing', desc: 'Global Localisation Engine', price: 20000 },
      { sku: 'SV-DEL-01', name: 'Encrypted Master Delivery (DCP)', desc: 'Secure Asset Handoff', price: 10000 }
    ];

    for (const s of services) {
      try {
        await this.createProduct({
          brandId: 1, // Default StreamVista Brand
          categoryId: 1, // Service Category
          sku: s.sku,
          productName: s.name,
          description: s.desc,
          price: s.price,
          taxRate: 18,
          partNumber: s.sku,
          oemNumber: 'STV-2026'
        });
      } catch (err) {
        console.warn(`Catalog item ${s.sku} might already exist or DB is unavailable.`);
      }
    }
  }

  static async getProducts(filters: any = {}) {
    let sql = `SELECT p.*, b.brand_name, c.category_name FROM products p 
               JOIN brands b ON p.brand_id = b.brand_id 
               JOIN categories c ON p.category_id = c.category_id WHERE 1=1`;
    const params: any = {};

    if (filters.brandId) {
      sql += ` AND p.brand_id = :brandId`;
      params.brandId = filters.brandId;
    }
    if (filters.search) {
      sql += ` AND (LOWER(p.product_name) LIKE :search OR p.sku LIKE :search OR p.part_number LIKE :search OR p.oem_number LIKE :search)`;
      params.search = `%${filters.search.toLowerCase()}%`;
    }

    const result: any = await executeQuery(sql, params);
    return result.rows;
  }

  static async getProductById(productId: number) {
    const sql = `SELECT p.*, b.brand_name, c.category_name FROM products p 
                 JOIN brands b ON p.brand_id = b.brand_id 
                 JOIN categories c ON p.category_id = c.category_id 
                 WHERE p.product_id = :productId`;
    const result: any = await executeQuery(sql, { productId });
    return result.rows[0];
  }

  static async getCompatibility(productId: number) {
    const sql = `SELECT * FROM vehicle_compatibility WHERE product_id = :productId`;
    const result: any = await executeQuery(sql, { productId });
    return result.rows;
  }
}
