'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  stockAdjustmentSchema,
  type StockAdjustmentInput,
} from '@/lib/validators/stock';

async function ensureStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin' && profile?.role !== 'staff') {
    throw new Error('Accès refusé');
  }
  return { supabase, user };
}

export async function adjustStock(input: StockAdjustmentInput) {
  const { supabase, user } = await ensureStaff();
  const parsed = stockAdjustmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: 'Données invalides' };
  }
  const data = parsed.data;

  const { data: product, error: pError } = await supabase
    .from('products')
    .select('id, stock_quantity')
    .eq('id', data.product_id)
    .single();
  if (pError || !product) {
    return { success: false as const, error: 'Produit introuvable' };
  }

  // Calcul du nouveau stock
  const isPositive = data.type === 'in';
  const isNegative = data.type === 'out' || data.type === 'loss';
  let newStock = product.stock_quantity;
  let signedQty = data.quantity;

  if (data.type === 'adjustment') {
    // Ajustement absolu : la quantité fournie EST le nouveau stock
    signedQty = data.quantity - product.stock_quantity;
    newStock = data.quantity;
  } else if (isPositive) {
    signedQty = Math.abs(data.quantity);
    newStock = product.stock_quantity + signedQty;
  } else if (isNegative) {
    signedQty = -Math.abs(data.quantity);
    newStock = product.stock_quantity + signedQty;
  }

  if (newStock < 0) {
    return { success: false as const, error: 'Stock négatif interdit' };
  }

  // Update produit
  const { error: uError } = await supabase
    .from('products')
    .update({ stock_quantity: newStock })
    .eq('id', data.product_id);
  if (uError) return { success: false as const, error: uError.message };

  // Insert mouvement
  const { error: mError } = await supabase.from('stock_movements').insert({
    product_id: data.product_id,
    type: data.type,
    quantity: signedQty,
    previous_stock: product.stock_quantity,
    new_stock: newStock,
    reason: data.reason,
    reference_type: 'manual',
    created_by: user.id,
  });
  if (mError) return { success: false as const, error: mError.message };

  revalidatePath('/admin/produits');
  revalidatePath('/admin/stocks');
  return { success: true as const, newStock };
}

export async function listStockMovements(opts?: {
  productId?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  let req = supabase
    .from('stock_movements')
    .select(
      '*, product:products(id, name, slug, cover_image_url), creator:profiles!stock_movements_created_by_fkey(first_name, last_name)'
    )
    .order('created_at', { ascending: false })
    .limit(opts?.limit || 100);

  if (opts?.productId) req = req.eq('product_id', opts.productId);

  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return data;
}