const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteCollection(collectionName) {
  console.log(`🗑️ 開始刪除 ${collectionName} 集合...`);
  
  const snapshot = await db.collection(collectionName).get();
  console.log(`📊 找到 ${snapshot.size} 個文件`);
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`✅ 已刪除 ${count} 個文件`);
  } else {
    console.log('⚠️ 集合為空，無需刪除');
  }
}

async function main() {
  try {
    await deleteCollection('scores');
    await deleteCollection('scores_region');
    console.log('🎉 所有排名已清空！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 刪除失敗:', error);
    process.exit(1);
  }
}

main();
