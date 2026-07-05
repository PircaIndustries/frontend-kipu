const DB_NAME = 'kipu-local-storage';
const STORE_NAME = 'documents';
const DB_VERSION = 1;

export const LocalFileStorageService = {
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  },

  async saveFile(id, file) {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id, file, name: file.name, type: file.type, size: file.size });

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  },

  async getFile(id) {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = (event) => {
        if (event.target.result) {
          resolve(event.target.result.file);
        } else {
          resolve(null);
        }
      };
      request.onerror = (event) => reject(event.target.error);
    });
  },

  async deleteFile(id) {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }
};
