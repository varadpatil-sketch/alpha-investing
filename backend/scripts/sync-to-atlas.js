import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.join(__dirname, '..', 'data_backup');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const LOCAL_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/alpha_investing';
const TARGET_ATLAS_URI = process.argv[2] || process.env.ATLAS_URI;

async function syncDatabase() {
  console.log('📦 Starting MongoDB Local Data Export & Atlas Sync...');
  
  // 1. Connect to Local MongoDB and Export Collections to JSON
  let localConn;
  let exportedData = {};

  try {
    console.log(`🔌 Connecting to Local MongoDB: ${LOCAL_URI}`);
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to Local MongoDB');

    const collections = await localConn.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} local collections:`, collections.map(c => c.name));

    for (const col of collections) {
      const colName = col.name;
      const docs = await localConn.db.collection(colName).find({}).toArray();
      exportedData[colName] = docs;

      // Save to JSON file
      const filePath = path.join(backupDir, `${colName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
      console.log(`💾 Dumped ${docs.length} documents from '${colName}' -> ${filePath}`);
    }

  } catch (err) {
    console.error('⚠️ Local MongoDB read error:', err.message);
  } finally {
    if (localConn) await localConn.close();
  }

  // 2. Sync to Atlas if Target URI is provided
  if (!TARGET_ATLAS_URI) {
    console.log('\n💡 Local export complete!');
    console.log('To push this data directly to your MongoDB Atlas cluster, run:');
    console.log('  npm run sync-db "<YOUR_MONGODB_ATLAS_CONNECTION_STRING>"');
    process.exit(0);
  }

  console.log(`\n🚀 Migrating local data to MongoDB Atlas...`);
  let atlasConn;
  try {
    atlasConn = await mongoose.createConnection(TARGET_ATLAS_URI).asPromise();
    console.log('✅ Connected to MongoDB Atlas Cluster!');

    for (const [colName, docs] of Object.entries(exportedData)) {
      if (!docs || docs.length === 0) {
        console.log(`⏩ Skipping empty collection '${colName}'`);
        continue;
      }

      const atlasCol = atlasConn.db.collection(colName);
      // Clean target collection or upsert documents
      for (const doc of docs) {
        await atlasCol.replaceOne({ _id: doc._id }, doc, { upsert: true });
      }
      console.log(`✨ Successfully synced ${docs.length} documents into Atlas collection '${colName}'!`);
    }

    console.log('\n🎉 ALL DATA SUCCESSFULLY MIGRATED TO MONGODB ATLAS!');

  } catch (err) {
    console.error('❌ Atlas sync failed:', err.message);
    process.exit(1);
  } finally {
    if (atlasConn) await atlasConn.close();
  }
}

syncDatabase();
