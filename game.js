/**
 * 遊戲核心邏輯模組
 */
const GameLogic = {
  /**
   * 國家代碼轉換為旗幟 Emoji
   * @param {string} code - 國家代碼（如 'TW', 'JP'）
   * @returns {string} 旗幟 Emoji
   */
  codeToFlagEmoji(code) {
    return code
      .toUpperCase()
      .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
  },

  /**
   * 隨機數產生器
   * @param {number} n - 範圍上限（不包含）
   * @returns {number} 0 到 n-1 之間的隨機整數
   */
  random(n) {
    return Math.floor(Math.random() * n);
  },

  /**
   * Fisher-Yates 洗牌演算法
   * @param {Array} array - 要洗牌的陣列
   * @returns {Array} 洗牌後的陣列
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.random(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  /**
   * 從地區篩選中取得國家池
   * @param {Array} countries - 所有國家陣列
   * @param {string} region - 地區名稱 ('global', 'asia', 'europe', 等)
   * @returns {Array} 符合地區的國家陣列
   */
  getCountryPool(countries, region) {
    if (region === 'global') return countries;
    return countries.filter(c => c.region === region);
  },

  /**
   * 產生題目選項
   * @param {Object} correctCountry - 正確答案的國家物件
   * @param {Array} pool - 國家池
   * @param {number} optionCount - 選項數量（預設 4）
   * @returns {Array} 包含正確答案的選項陣列
   */
  generateOptions(correctCountry, pool, optionCount = 4) {
    const options = [correctCountry];
    const available = pool.filter(c => c.code !== correctCountry.code);

    while (options.length < optionCount && available.length > 0) {
      const idx = this.random(available.length);
      options.push(available[idx]);
      available.splice(idx, 1);
    }

    return this.shuffle(options);
  },

  /**
   * 取得國家的顯示名稱
   * @param {string} code - 國家代碼
   * @param {Object} intlNames - Intl.DisplayNames 實例
   * @returns {string} 國家名稱
   */
  getCountryName(code, intlNames) {
    try {
      return intlNames.of(code);
    } catch (error) {
      console.error(`無法取得國家名稱: ${code}`, error);
      return code;
    }
  }
};
