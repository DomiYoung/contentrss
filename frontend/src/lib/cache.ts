/**
 * IndexedDB 智能缓存
 * 基于后端 ingested_at 时间戳判断缓存有效性
 * 
 * 策略：
 * 1. 缓存时记录后端数据的 ingested_at（最新数据时间）
 * 2. 验证时检查 ingested_at 是否为今日
 * 3. 如果 ingested_at 是昨天或更早，视为过期，触发后端请求
 */

const DB_NAME = 'contentrss-cache';
const DB_VERSION = 2; // 升级版本号以触发 schema 更新
const STORE_NAME = 'api-cache';

interface CacheEntry<T = unknown> {
    key: string;
    data: T;
    cachedAt: string;      // 缓存写入时间（本地）
    dataIngestedAt: string | null; // 后端数据的 ingested_at（数据真实新鲜度）
}

// 获取日期字符串 (YYYY-MM-DD)
const getDateString = (date: Date = new Date()): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 从 ISO 时间字符串提取日期部分
const extractDateFromISO = (isoString: string | null | undefined): string | null => {
    if (!isoString) return null;
    try {
        // 支持 "2025-12-27T08:39:59.178586" 或 "2025-12-27 08:39:59"
        return isoString.split('T')[0].split(' ')[0];
    } catch {
        return null;
    }
};

// 打开数据库
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            // 删除旧 store 并创建新的
            if (db.objectStoreNames.contains(STORE_NAME)) {
                db.deleteObjectStore(STORE_NAME);
            }
            db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        };
    });
};

/**
 * 从响应数据中提取最新的 ingested_at
 * 支持数组格式和对象格式
 */
export const extractLatestIngestedAt = (data: unknown): string | null => {
    // 处理 { items: [...] } 格式
    if (data && typeof data === 'object' && 'items' in data) {
        const items = (data as { items: unknown[] }).items;
        if (Array.isArray(items) && items.length > 0) {
            const firstItem = items[0] as Record<string, unknown>;
            return (firstItem?.ingested_at as string) || null;
        }
    }

    // 处理 { cards: [...] } 格式
    if (data && typeof data === 'object' && 'cards' in data) {
        const cards = (data as { cards: unknown[] }).cards;
        if (Array.isArray(cards) && cards.length > 0) {
            const firstCard = cards[0] as Record<string, unknown>;
            return (firstCard?.ingested_at as string) || null;
        }
    }

    // 处理直接数组格式
    if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0] as Record<string, unknown>;
        return (firstItem?.ingested_at as string) || null;
    }

    return null;
};

/**
 * 检查缓存是否有效
 * 核心逻辑：数据的 ingested_at 必须是今天
 */
const isCacheValid = (entry: CacheEntry): boolean => {
    const today = getDateString();
    const dataDate = extractDateFromISO(entry.dataIngestedAt);

    if (dataDate === today) {
        console.log(`📦 缓存有效: ${entry.key} (数据日期: ${dataDate})`);
        return true;
    }

    console.log(`⏰ 缓存过期: ${entry.key} (数据日期: ${dataDate} vs 今天: ${today})`);
    return false;
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
                const entry = request.result as CacheEntry<T> | undefined;
                if (entry && isCacheValid(entry)) {
                    resolve(entry.data);
                } else {
                    resolve(null);
                }
            };
        });
    } catch (error) {
        console.warn('IndexedDB 读取失败:', error);
        return null;
    }
};

// 设置缓存（需要传入数据的 ingested_at）
export const setCache = async <T>(key: string, data: T, ingestedAt?: string | null): Promise<void> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // 如果没有传入 ingestedAt，尝试从数据中提取
            const dataIngestedAt = ingestedAt ?? extractLatestIngestedAt(data);

            const entry: CacheEntry<T> = {
                key,
                data,
                cachedAt: new Date().toISOString(),
                dataIngestedAt,
            };
            const request = store.put(entry);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                console.log(`💾 已缓存: ${key} (数据日期: ${extractDateFromISO(dataIngestedAt)})`);
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
        const today = getDateString();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.openCursor();

            request.onerror = () => reject(request.error);
            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    const entry = cursor.value as CacheEntry;
                    const dataDate = extractDateFromISO(entry.dataIngestedAt);
                    if (dataDate !== today) {
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
 * 带缓存的 API 请求（智能版）
 * @param cacheKey 缓存键
 * @param fetcher 实际的 API 请求函数
 * @param forceRefresh 是否强制刷新（跳过缓存）
 */
export const fetchWithCache = async <T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    forceRefresh: boolean = false
): Promise<T> => {
    // 1. 检查缓存（基于 ingested_at 验证）
    if (!forceRefresh) {
        const cached = await getCache<T>(cacheKey);
        if (cached !== null) {
            return cached;
        }
    }

    // 2. 调用 API
    const data = await fetcher();

    // 3. 存入缓存（自动提取 ingested_at）
    await setCache(cacheKey, data);

    return data;
};
