import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch,
  query,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

const COLLECTION_NAME = 'products';

// Helper to sanitize an object before Firestore write (removes undefined)
function sanitizeProduct(p: Product): Record<string, any> {
  const result: Record<string, any> = {
    id: p.id,
    code: p.code,
    description: p.description,
    price: Number(p.price) || 0,
    brand: p.brand || 'Multimarca',
    category: p.category || 'Otros',
    stockStatus: p.stockStatus || 'Disponible',
    imageUrl: p.imageUrl || '',
    vehicleCompatibility: p.vehicleCompatibility || '',
    updatedAt: new Date().toISOString(),
  };
  if (p.notes) result.notes = p.notes;
  return result;
}

/**
 * Subscribes in real-time to the products collection in Firestore.
 * When a change is made by admin or another device, all connected devices receive the updated catalog and photos immediately.
 */
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const colRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        try {
          if (snapshot.empty) {
            // If Firestore is empty, seed it with the default catalog
            console.log('Firestore products collection is empty. Auto-seeding catalog...');
            seedFirestoreCatalog(INITIAL_PRODUCTS)
              .then(() => onUpdate(INITIAL_PRODUCTS))
              .catch((err) => {
                console.error('Error auto-seeding Firestore:', err);
                onUpdate(INITIAL_PRODUCTS);
              });
            return;
          }

          const initialMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
          const remoteProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Product;
            if (data && data.id && data.code) {
              const initial = initialMap.get(data.id);
              // If remote image is empty, ensure we use the initial real photo
              const resolvedImageUrl = (data.imageUrl && data.imageUrl.trim().length > 0)
                ? data.imageUrl
                : (initial?.imageUrl || '');

              remoteProducts.push({
                ...data,
                id: docSnap.id || data.id,
                imageUrl: resolvedImageUrl,
              });
            }
          });

          if (remoteProducts.length > 0) {
            // Sort according to original order or code
            const initialIndexMap = new Map(INITIAL_PRODUCTS.map((p, idx) => [p.id, idx]));
            remoteProducts.sort((a, b) => {
              const idxA = initialIndexMap.has(a.id) ? initialIndexMap.get(a.id)! : 9999;
              const idxB = initialIndexMap.has(b.id) ? initialIndexMap.get(b.id)! : 9999;
              return idxA - idxB;
            });

            onUpdate(remoteProducts);
          } else {
            onUpdate(INITIAL_PRODUCTS);
          }
        } catch (innerErr) {
          console.warn('Error processing snapshot products:', innerErr);
          onUpdate(INITIAL_PRODUCTS);
        }
      },
      (err) => {
        console.warn('Firestore snapshot error (using offline fallback):', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Firestore initialization error (using offline fallback):', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Seeds or force-syncs an array of products to Firestore in batches (max 500 per batch).
 */
export async function seedFirestoreCatalog(products: Product[]): Promise<void> {
  const batchSize = 50;
  for (let i = 0; i < products.length; i += batchSize) {
    const chunk = products.slice(i, i + batchSize);
    const batch = writeBatch(db);

    for (const prod of chunk) {
      const docRef = doc(db, COLLECTION_NAME, prod.id);
      batch.set(docRef, sanitizeProduct(prod), { merge: true });
    }

    await batch.commit();
  }
  console.log(`Successfully synced ${products.length} products to Firestore!`);
}

/**
 * Saves or updates a single product in Firestore.
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, product.id);
    await setDoc(docRef, sanitizeProduct(product), { merge: true });
  } catch (err) {
    console.error(`Error saving product ${product.id} to Firestore:`, err);
    throw err;
  }
}

/**
 * Deletes a product from Firestore.
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Error deleting product ${productId} from Firestore:`, err);
    throw err;
  }
}

/**
 * Batch updates product images in Firestore when admin uploads photos.
 */
export async function batchUpdateImagesInFirestore(
  updates: { productId: string; imageUrl: string }[]
): Promise<void> {
  const batchSize = 50;
  for (let i = 0; i < updates.length; i += batchSize) {
    const chunk = updates.slice(i, i + batchSize);
    const batch = writeBatch(db);

    for (const item of chunk) {
      const docRef = doc(db, COLLECTION_NAME, item.productId);
      batch.set(docRef, {
        imageUrl: item.imageUrl,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    await batch.commit();
  }
}

/**
 * Checks if Firestore has products
 */
export async function checkFirestoreHasProducts(): Promise<boolean> {
  try {
    const q = query(collection(db, COLLECTION_NAME), limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    return false;
  }
}
