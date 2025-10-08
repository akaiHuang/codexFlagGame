/**
 * Firebase 管理模組 - 處理所有 Firebase 相關操作
 */
const FirebaseManager = {
  /**
   * 儲存使用者個人資料名稱
   * @param {Object} ctx - Firebase 上下文
   * @param {string} uid - 使用者 ID
   * @param {string} name - 使用者名稱
   */
  async saveProfileName(ctx, uid, name) {
    if (!name) return;
    
    try {
      const now = ctx.serverTimestamp();
      await ctx.setDoc(
        ctx.doc(ctx.db, 'profiles', uid),
        {
          uid,
          name,
          createdAt: now,
          updatedAt: now
        },
        { merge: true }
      );
    } catch (error) {
      console.error('儲存使用者名稱失敗:', error);
      throw new Error('無法儲存使用者資料，請稍後再試');
    }
  },

  /**
   * 增強排行榜資料，加入使用者名稱
   * @param {Object} ctx - Firebase 上下文
   * @param {Array} rows - 排行榜資料陣列
   * @returns {Promise<Array>} 包含名稱的排行榜資料
   */
  async augmentWithNames(ctx, rows) {
    const uids = [...new Set(rows.map(r => r.uid).filter(Boolean))];
    if (!uids.length) return rows;

    try {
      const entries = await Promise.all(
        uids.map(async (uid) => {
          try {
            const snap = await ctx.getDoc(ctx.doc(ctx.db, 'profiles', uid));
            return [uid, snap.exists() ? (snap.data().name || '') : ''];
          } catch (error) {
            console.error(`取得使用者 ${uid} 資料失敗:`, error);
            return [uid, ''];
          }
        })
      );
      
      const nameMap = Object.fromEntries(entries);
      return rows.map(r => ({ ...r, name: nameMap[r.uid] || '' }));
    } catch (error) {
      console.error('處理使用者名稱失敗:', error);
      return rows;
    }
  },

  /**
   * 取得使用者顯示標籤
   * @param {Object} user - Firebase 使用者物件
   * @returns {string} 使用者顯示名稱
   */
  getUserLabel(user) {
    if (!user) return '訪客';
    if (user.isAnonymous) return '訪客';
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return user.uid.slice(-6);
  }
};
