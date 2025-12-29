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
 * 从响应数据中提取最新的 ingested_at 或 cached_date
 * 支持多种数据格式
 */
export const extractLatestIngestedAt = (data: unknown): string | null => {
    if (!data || typeof data !== 'object') return null;

    const obj = data as Record<string, unknown>;

    console.log('🔍 [DEBUG] extractLatestIngestedAt 输入:', JSON.stringify(obj).slice(0, 300));

    // 1. 优先使用 cached_date（后端明确返回的数据日期）
    if ('cached_date' in obj && obj.cached_date) {
        console.log('✅ [DEBUG] 从 cached_date 提取:', obj.cached_date);
        return String(obj.cached_date);
    }

    // 2. 尝试从 date_filter 提取
    if ('date_filter' in obj && obj.date_filter) {
        console.log('✅ [DEBUG] 从 date_filter 提取:', obj.date_filter);
        return String(obj.date_filter);
    }

    // 3. 处理 { items: [...] } 格式，提取第一个 item 的 ingested_at
    if ('items' in obj) {
        const items = obj.items as unknown[];
        if (Array.isArray(items) && items.length > 0) {
            const firstItem = items[0] as Record<string, unknown>;
            if (firstItem?.ingested_at) {
                console.log('✅ [DEBUG] 从 items[0].ingested_at 提取:', firstItem.ingested_at);
                return String(firstItem.ingested_at);
            }
        }
    }

    // 4. 处理 { cards: [...] } 格式
    if ('cards' in obj) {
        const cards = obj.cards as unknown[];
        console.log('🔍 [DEBUG] 检测到 cards 数组，长度:', Array.isArray(cards) ? cards.length : 'N/A');
        if (Array.isArray(cards) && cards.length > 0) {
            const firstCard = cards[0] as Record<string, unknown>;
            console.log('🔍 [DEBUG] cards[0] 内容:', JSON.stringify(firstCard).slice(0, 300));
            console.log('🔍 [DEBUG] cards[0].ingested_at =', firstCard?.ingested_at);
            if (firstCard?.ingested_at) {
                console.log('✅ [DEBUG] 从 cards[0].ingested_at 提取:', firstCard.ingested_at);
                return String(firstCard.ingested_at);
            } else {
                console.warn('⚠️ [DEBUG] cards[0] 不包含有效的 ingested_at，可用字段:', Object.keys(firstCard));
            }
        }
    }

    // 5. 处理直接数组格式
    if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0] as Record<string, unknown>;
        if (firstItem?.ingested_at) {
            console.log('✅ [DEBUG] 从数组[0].ingested_at 提取:', firstItem.ingested_at);
            return String(firstItem.ingested_at);
        }
    }

    console.warn('⚠️ [DEBUG] 未找到任何日期字段');
    return null;
};

/**
 * 检查缓存是否有效
 * 核心逻辑：接受今天和昨天的数据（渐进式降级策略）
 */
const isCacheValid = (entry: CacheEntry): boolean => {
    const today = getDateString();
    const yesterday = getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const dataDate = extractDateFromISO(entry.dataIngestedAt);

    // 接受今天或昨天的数据
    if (dataDate === today || dataDate === yesterday) {
        const freshness = dataDate === today ? '今日数据' : '昨日数据（降级）';
        console.log(`📦 缓存有效: ${entry.key} (${freshness}: ${dataDate})`);
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
 * 检查缓存数据是否为今日最新
 */
const isCacheFresh = (entry: CacheEntry): boolean => {
    const today = getDateString();
    const dataDate = extractDateFromISO(entry.dataIngestedAt);
    return dataDate === today;
};

/**
 * 带缓存的 API 请求（SWR 轻量实现）
 * @param cacheKey 缓存键
 * @param fetcher 实际的 API 请求函数
 * @param forceRefresh 是否强制刷新（跳过缓存）
 */
export const fetchWithCache = async <T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    forceRefresh: boolean = false
): Promise<T> => {
    // 1. 强制刷新模式：跳过缓存直接请求
    if (forceRefresh) {
        const data = await fetcher();
        await setCache(cacheKey, data);
        return data;
    }

    // 2. SWR 模式：先返回缓存（如果有效），然后后台重新验证
    const cached = await getCache<T>(cacheKey);

    if (cached !== null) {
        // 2.1 有缓存：立即返回
        // 2.2 后台检查：如果缓存是昨天的，后台静默更新
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(cacheKey);

        request.onsuccess = () => {
            const entry = request.result as CacheEntry<T> | undefined;
            if (entry && !isCacheFresh(entry)) {
                // 缓存是昨天的数据，后台静默更新
                console.log(`🔄 后台更新中: ${cacheKey} (当前缓存为昨日数据)`);
                fetcher().then(newData => {
                    setCache(cacheKey, newData);
                    console.log(`✅ 后台更新完成: ${cacheKey}`);
                }).catch(err => {
                    console.warn(`⚠️ 后台更新失败: ${cacheKey}`, err);
                });
            }
        };

        return cached;
    }

    // 3. 无缓存：正常请求并缓存
    const data = await fetcher();
    await setCache(cacheKey, data);
    return data;
};
