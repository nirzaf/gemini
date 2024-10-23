import { Message, Settings } from './types';

const DB_NAME = 'chatApp';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };
  });
}

export async function saveMessage(message: Message): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction('messages', 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.put(message);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getMessages(): Promise<Message[]> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction('messages', 'readonly');
    const store = transaction.objectStore('messages');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result.sort((a, b) => a.timestamp - b.timestamp));
    };
  });
}

export async function saveSettings(settings: Settings): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const serializedSettings = JSON.parse(JSON.stringify(settings)); // Ensure serializable
    const transaction = db.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ id: 'user-settings', ...serializedSettings });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}


export async function getSettings(): Promise<Settings> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('user-settings');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result || { theme: 'system' });
    };
  });
}