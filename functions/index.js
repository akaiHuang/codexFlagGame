const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * 國家資料 - 與前端保持一致
 */
const COUNTRIES_DATA = {
  asia: 'JP CN TW HK MO KR KP VN TH MY SG ID PH IN PK BD LK NP KH LA MM MN AE SA QA KW OM BH JO IL TR IR IQ SY LB',
  europe: 'FR DE IT ES PT NL BE LU IE GB NO SE FI DK IS PL CZ SK HU AT CH LI SI HR BA RS ME MK AL GR BG RO MD UA BY LT LV EE',
  africa: 'EG MA DZ TN LY ET KE UG TZ RW BI GH NG CI SN CM CD ZA NA BW ZM ZW AO MZ MG',
  americas: 'US CA MX CU DO HT JM PA CR NI SV GT HN CO VE PE EC BO PY UY AR CL BR',
  oceania: 'AU NZ PG FJ WS TO'
};

const ALL_COUNTRIES = Object.entries(COUNTRIES_DATA)
  .flatMap(([region, codes]) => 
    codes.split(' ').map(code => ({ code, region }))
  );

/**
 * 驗證國家代碼是否有效
 */
function isValidCountryCode(code) {
  return ALL_COUNTRIES.some(c => c.code === code);
}

/**
 * 驗證地區是否有效
 */
function isValidRegion(region) {
  return ['global', 'asia', 'europe', 'africa', 'americas', 'oceania'].includes(region);
}

/**
 * 提交答案 Cloud Function
 * 接收：flagCode（國旗代碼），answer（使用者選擇），region（當前地區）
 * 驗證答案並更新分數
 */
exports.submitAnswer = functions.https.onCall(async (data, context) => {
  // 驗證使用者已登入
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      '必須登入才能提交答案'
    );
  }

  const uid = context.auth.uid;
  const { flagCode, answer, region } = data;

  console.log('📥 submitAnswer 被呼叫:', { uid, flagCode, answer, region });

  // 驗證輸入參數
  if (!flagCode || !answer || !region) {
    console.error('❌ 缺少必要參數');
    throw new functions.https.HttpsError(
      'invalid-argument',
      '缺少必要參數：flagCode, answer, region'
    );
  }

  if (!isValidCountryCode(flagCode) || !isValidCountryCode(answer)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      '無效的國家代碼'
    );
  }

  if (!isValidRegion(region)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      '無效的地區'
    );
  }

  // 計算是否答對
  const correct = (flagCode === answer);

  try {
    // 使用 Firestore Transaction 確保資料一致性
    const result = await db.runTransaction(async (transaction) => {
      // 讀取當前分數文件
      const scoreRef = db.collection('scores').doc(uid);
      const regionScoreRef = db.collection('scores_region').doc(uid);
      
      const scoreDoc = await transaction.get(scoreRef);
      const regionScoreDoc = await transaction.get(regionScoreRef);
      
      // 取得現有資料
      let scoreData = scoreDoc.exists ? scoreDoc.data() : {
        uid,
        total: 0,
        correct: 0,
        streak: 0,
        bestStreak: 0,
        by: {},
        correctFlags: [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      let regionScoreData = regionScoreDoc.exists ? regionScoreDoc.data() : {
        uid,
        regions: {}
      };

      // 更新總分數
      scoreData.total = (scoreData.total || 0) + 1;

      // 確保 by 物件存在
      if (!scoreData.by) scoreData.by = {};
      
      // 更新國旗細節
      if (!scoreData.by[flagCode]) {
        scoreData.by[flagCode] = { seen: 0, wrong: 0, streak: 0, score: 0 };
      }
      const flagStats = scoreData.by[flagCode];
      flagStats.seen += 1;

      if (correct) {
        // 答對的處理
        scoreData.correct = (scoreData.correct || 0) + 1;
        scoreData.streak = (scoreData.streak || 0) + 1;
        scoreData.bestStreak = Math.max(scoreData.bestStreak || 0, scoreData.streak);
        flagStats.streak = (flagStats.streak || 0) + 1;
        flagStats.score = (flagStats.score || 0) + 1;

        // 記錄答對的國旗
        if (!scoreData.correctFlags) scoreData.correctFlags = [];
        if (!scoreData.correctFlags.includes(flagCode)) {
          scoreData.correctFlags.push(flagCode);
        }
      } else {
        // 答錯的處理
        scoreData.streak = 0;
        flagStats.wrong = (flagStats.wrong || 0) + 1;
        flagStats.streak = 0;
        flagStats.score = Math.max(0, (flagStats.score || 0) - 1);
      }

      scoreData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      // 更新地區分數（全球 + 當前地區）
      const regionsToUpdate = ['global'];
      if (region !== 'global') regionsToUpdate.push(region);

      console.log('🌍 需要更新的地區:', regionsToUpdate);

      // 為每個地區創建獨立的文件（方便查詢排行榜）
      const regionWrites = [];
      regionsToUpdate.forEach(r => {
        const regionDocRef = db.collection('scores_region').doc(`${uid}_${r}`);
        
        // 從 regionScoreData.regions[r] 獲取或創建統計
        if (!regionScoreData.regions[r]) {
          regionScoreData.regions[r] = { total: 0, correct: 0, streak: 0, bestStreak: 0 };
        }
        const rs = regionScoreData.regions[r];
        
        rs.total = (rs.total || 0) + 1;
        if (correct) {
          rs.correct = (rs.correct || 0) + 1;
          rs.streak = (rs.streak || 0) + 1;
          rs.bestStreak = Math.max(rs.bestStreak || 0, rs.streak);
        } else {
          rs.streak = 0;
        }
        
        // 計算準確率
        const accuracy = rs.total > 0 ? Math.round((rs.correct / rs.total) * 100) : 0;
        
        const regionScoreData = {
          uid,
          region: r,
          total: rs.total,
          bestStreak: rs.bestStreak,
          accuracy: accuracy,
          ts: admin.firestore.FieldValue.serverTimestamp()
        };
        
        console.log(`📝 準備寫入 scores_region/${uid}_${r}:`, regionScoreData);
        
        // 寫入獨立的地區排行榜文件（格式與原本前端一致）
        transaction.set(regionDocRef, regionScoreData);
      });

      regionScoreData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      // 寫入資料
      transaction.set(scoreRef, scoreData, { merge: false });
      transaction.set(regionScoreRef, regionScoreData, { merge: false });

      return {
        correct,
        scoreData,
        regionScoreData
      };
    });

    console.log('✅ Transaction 完成，準備返回結果');
    console.log('📊 最終統計:', {
      correct: result.correct,
      total: result.scoreData.total,
      bestStreak: result.scoreData.bestStreak
    });

    // 返回結果
    return {
      success: true,
      correct: result.correct,
      stats: {
        total: result.scoreData.total,
        correct: result.scoreData.correct,
        streak: result.scoreData.streak,
        bestStreak: result.scoreData.bestStreak,
        correctFlags: result.scoreData.correctFlags,
        by: result.scoreData.by
      },
      regionStats: result.regionScoreData.regions
    };

  } catch (error) {
    console.error('❌ 提交答案時發生錯誤:', error);
    throw new functions.https.HttpsError(
      'internal',
      '伺服器錯誤，請稍後再試'
    );
  }
});

/**
 * 取得使用者統計資料 Cloud Function
 * 用於同步伺服器端的資料到前端
 */
exports.getUserStats = functions.https.onCall(async (data, context) => {
  // 驗證使用者已登入
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      '必須登入才能取得統計資料'
    );
  }

  const uid = context.auth.uid;

  try {
    const scoreDoc = await db.collection('scores').doc(uid).get();
    const regionScoreDoc = await db.collection('scores_region').doc(uid).get();

    return {
      success: true,
      stats: scoreDoc.exists ? scoreDoc.data() : null,
      regionStats: regionScoreDoc.exists ? regionScoreDoc.data() : null
    };
  } catch (error) {
    console.error('取得使用者統計資料時發生錯誤:', error);
    throw new functions.https.HttpsError(
      'internal',
      '無法取得統計資料'
    );
  }
});
