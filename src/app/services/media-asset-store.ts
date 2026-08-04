/**
 * Pluggable blob storage for uploaded media.
 * Local IndexedDB today; an S3-backed store can implement the same contract later.
 */
export interface MediaAssetStore {
  put(id: string, blob: Blob): Promise<void>;
  get(id: string): Promise<Blob | null>;
  delete(id: string): Promise<void>;
}

const DB_NAME = 'tb-data-viewer-media';
const DB_VERSION = 1;
const STORE_NAME = 'assets';

export class IndexedDbMediaAssetStore implements MediaAssetStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  async put(id: string, blob: Blob): Promise<void> {
    const db = await this.open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Failed to store media asset'));
      tx.objectStore(STORE_NAME).put(blob, id);
    });
  }

  async get(id: string): Promise<Blob | null> {
    const db = await this.open();
    return new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(id);
      request.onsuccess = () => {
        const value = request.result;
        resolve(value instanceof Blob ? value : null);
      };
      request.onerror = () => reject(request.error ?? new Error('Failed to read media asset'));
    });
  }

  async delete(id: string): Promise<void> {
    const db = await this.open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Failed to delete media asset'));
      tx.objectStore(STORE_NAME).delete(id);
    });
  }

  private open(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(request.error ?? new Error('Failed to open media asset database'));
      });
    }
    return this.dbPromise;
  }
}
