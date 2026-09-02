import { getDbClient } from '../config/db';

export class InventoryService {
  static async updateStock(inventoryId: string, quantity: number, movementType: string, referenceId?: string) {
    const client = getDbClient();
    const { data, error } = await client
      .from('assets')
      .select('id,project_id,metadata')
      .eq('id', inventoryId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Inventory item not found in canonical StreamVista storage');

    const metadata = (data.metadata || {}) as Record<string, unknown>;
    const currentQuantity = Number(metadata.inventory_quantity ?? 0);
    const nextQuantity = currentQuantity + quantity;
    const nextMetadata = {
      ...metadata,
      inventory_quantity: nextQuantity,
      last_movement_type: movementType,
      last_reference_id: referenceId || null,
    };

    const { error: updateError } = await client
      .from('assets')
      .update({ metadata: nextMetadata })
      .eq('id', inventoryId);
    if (updateError) throw new Error(updateError.message);

    return { inventoryId, quantity: nextQuantity };
  }

  static async getInventoryByProduct(productId: string) {
    const { data, error } = await getDbClient()
      .from('assets')
      .select('id,project_id,asset_type,storage_path,approval_state,metadata,created_at')
      .eq('project_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  static async getLowStockAlerts(threshold: number = 10) {
    const { data, error } = await getDbClient()
      .from('assets')
      .select('id,project_id,asset_type,storage_path,approval_state,metadata,created_at')
      .lte('metadata->>inventory_quantity', String(threshold))
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }
}
