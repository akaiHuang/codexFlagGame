/**
 * 儲存管理模組 - 處理 localStorage 的資料存取
 */
const StorageManager = {
  STORAGE_KEY: 'fg_stats',

  /**
   * 取得儲存的統計資料
   * @returns {Object} 統計資料物件
   */
  get() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch (error) {
      console.error('讀取統計資料失敗:', error);
      return {};
    }
  },

  /**
   * 儲存統計資料
   * @param {Object} data - 要儲存的資料
   */
  set(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('儲存統計資料失敗:', error);
    }
  },

  /**
   * 重置統計資料
   */
  reset() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('重置統計資料失敗:', error);
    }
  },

  /**
   * 確保統計資料結構完整
   * @returns {Object} 完整的統計資料物件
   */
  ensureStats() {
    const stats = this.get();
    stats.total ??= 0;
    stats.correct ??= 0;
    stats.streak ??= 0;
    stats.bestStreak ??= 0;
    stats.by ??= {};
    this.set(stats);
    return stats;
  }
};
