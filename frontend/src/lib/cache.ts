/**
 * IndexedDB 缓存 Hook
 * 用于缓存 API 数据，支持按日期过期
 */

const DB_NAME = 'contentrss-cache';
const DB_VERSION = 1;
const STORE_NAME = 'api-cache';

interface CacheEntry {
    key: string;
    data: unknown;
    date: string; // YYYY-MM-DD 格式
}

// 获取今天的日期字符串
const getTodayString = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// 打开数据库
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
    });
};

// 获取缓存
export const getCache = async <T>(key: string): Promise<T | null> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const entry = request.result as CacheEntry | undefined;
                if (entry && entry.date === getTodayString()) {
                    console.log(`📦 缓存命中: ${key}`);
                    resolve(entry.data as T);
                } else {
                    if (entry) {
                        console.log(`⏰ 缓存过期: ${key} (${entry.date} vs ${getTodayString()})`);
                    }
                    resolve(null);
                }
            };
        });
    } catch (error) {
        console.warn('IndexedDB 读取失败:', error);
        return null;
    }
};

// 设置缓存
export const setCache = async <T>(key: string, data: T): Promise<void> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const entry: CacheEntry = {
                key,
                data,
                date: getTodayString(),
            };
            const request = store.put(entry);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                console.log(`💾 已缓存: ${key}`);
                resolve();
            };
        });
    } catch (error) {
        console.warn('IndexedDB 写入失败:', error);
    }
};

// 清除所有缓存
export const clearAllCache = async (): Promise<void> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                console.log('🗑️ 缓存已清除');
                resolve();
            };
        });
    } catch (error) {
        console.warn('IndexedDB 清除失败:', error);
    }
};

// 清除过期缓存
export const clearExpiredCache = async (): Promise<void> => {
    try {
        const db = await openDB();
        const today = getTodayString();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.openCursor();

            request.onerror = () => reject(request.error);
            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    const entry = cursor.value as CacheEntry;
                    if (entry.date !== today) {
                        cursor.delete();
                        console.log(`🗑️ 删除过期缓存: ${entry.key}`);
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };
        });
    } catch (error) {
        console.warn('IndexedDB 清理过期缓存失败:', error);
    }
};

/**
 * 带缓存的 API 请求
 * @param cacheKey 缓存键
 * @param fetcher 实际的 API 请求函数
 * @param forceRefresh 是否强制刷新（跳过缓存）
 */
export const fetchWithCache = async <T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    forceRefresh: boolean = false
): Promise<T> => {
    // 1. 检查缓存
    if (!forceRefresh) {
        const cached = await getCache<T>(cacheKey);
        if (cached !== null) {
            return cached;
        }
    }

    // 2. 调用 API
    const data = await fetcher();

    // 3. 存入缓存
    await setCache(cacheKey, data);

    return data;
};
