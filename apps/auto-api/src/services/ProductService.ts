import { getDbClient } from '../config/db';

export class ProductService {
  static async createProduct(productData: any) {
    const { sku, productName, description, price, metadata = {} } = productData;
    const { data, error } = await getDbClient()
      .from('sv_app_titles')
      .insert({
        title: String(productName || sku || 'Untitled'),
        synopsis: description ? String(description) : null,
        description: description ? String(description) : null,
        content_type: 'service',
        commercial_profile: { sku: sku || null, price: Number(price || 0) },
        metadata,
      })
      .select('id,title,status,commercial_profile,metadata,created_at')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async seedCatalog() {
    console.log('[ProductService] Canonical service catalog is managed through StreamVista titles.');
    return [];
  }

  static async getProducts(filters: any = {}) {
    let query = getDbClient()
      .from('sv_app_titles')
      .select('id,title,synopsis,description,content_type,primary_language,status,commercial_profile,metadata,created_at,updated_at')
      .order('created_at', { ascending: false });

    if (filters.search) {
      const search = String(filters.search).trim();
      if (search) query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  static async getProductById(productId: string) {
    const { data, error } = await getDbClient()
      .from('sv_app_titles')
      .select('id,title,synopsis,description,content_type,primary_language,status,commercial_profile,metadata,created_at,updated_at')
      .eq('id', productId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  static async getCompatibility(productId: string) {
    const { data, error } = await getDbClient()
      .from('sv_app_titles')
      .select('id,title,content_type,metadata')
      .eq('id', productId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? [data] : [];
  }
}
