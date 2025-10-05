/*
  Migration script: Copy all collections from local MongoDB to Atlas
  - Reads from: mongodb://localhost:27017/travel-blog
  - Writes to: process.env.MONGODB_URI || process.env.MONGO_URI

  Usage:
    1) Ensure .env has MONGO_URI set to your Atlas URI
    2) Run: node scripts/migrate-local-to-atlas.js
*/
require('dotenv').config();
const { MongoClient } = require('mongodb');

const LOCAL_URI = 'mongodb://localhost:27017';
const LOCAL_DB = 'travel-blog';
const TARGET_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!TARGET_URI) {
  console.error('Missing MONGODB_URI or MONGO_URI in environment. Aborting.');
  process.exit(1);
}

async function copyCollection(srcDb, dstDb, collName) {
  const src = srcDb.collection(collName);
  const dst = dstDb.collection(collName);

  const count = await src.countDocuments();
  if (count === 0) {
    console.log(`- ${collName}: no documents to copy`);
    return;
  }

  // Attempt to drop unique index that may conflict, then restore after insert
  let indexes;
  try {
    indexes = await dst.indexes();
    const uniqueSlug = indexes.find(i => i.name === 'slug_1' && i.unique);
    if (uniqueSlug) {
      console.log(`  (temp) dropping unique index slug_1 on ${collName}`);
      await dst.dropIndex('slug_1');
    }
  } catch (e) {
    // ignore
  }

  // Clean destination collection to avoid duplicates
  await dst.deleteMany({});

  const batchSize = 1000;
  let copied = 0;
  const cursor = src.find({});
  while (await cursor.hasNext()) {
    const batch = [];
    for (let i = 0; i < batchSize && await cursor.hasNext(); i++) {
      batch.push(await cursor.next());
    }
    if (batch.length) {
      await dst.insertMany(batch, { ordered: false });
      copied += batch.length;
      process.stdout.write(`\r- ${collName}: ${copied}/${count}`);
    }
  }
  process.stdout.write('\n');

  // Recreate dropped index if needed
  if (indexes) {
    const uniqueSlug = indexes.find(i => i.name === 'slug_1' && i.unique);
    if (uniqueSlug) {
      try {
        console.log(`  (restore) recreating unique index slug_1 on ${collName}`);
        await dst.createIndex({ slug: 1 }, { unique: true, name: 'slug_1' });
      } catch (e) {
        console.warn(`  (warn) could not recreate slug_1 on ${collName}: ${e.message}`);
      }
    }
  }
}

(async () => {
  let localClient, targetClient;
  try {
    console.log('Connecting to local MongoDB...');
    localClient = await MongoClient.connect(LOCAL_URI, { useUnifiedTopology: true });
    const localDb = localClient.db(LOCAL_DB);

    console.log('Connecting to Atlas...');
    targetClient = await MongoClient.connect(TARGET_URI, { useUnifiedTopology: true });

    // Ensure DB name in Atlas is travel-blog if not provided in URI
    const urlForParse = TARGET_URI.includes('mongodb+srv://') ? TARGET_URI.replace('mongodb+srv://', 'http://') : TARGET_URI.replace('mongodb://', 'http://');
    const parsed = new URL(urlForParse);
    const pathDb = parsed.pathname.replace(/^\//, '');
    const targetDbName = pathDb || LOCAL_DB;
    const targetDb = targetClient.db(targetDbName);

    console.log(`Source: ${LOCAL_URI}/${LOCAL_DB}`);
    console.log(`Target: ${TARGET_URI} (${targetDb.databaseName})`);

    const collections = await localDb.listCollections().toArray();
    if (collections.length === 0) {
      console.log('No collections found in local DB. Nothing to migrate.');
      return;
    }

    for (const c of collections) {
      await copyCollection(localDb, targetDb, c.name);
    }

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exitCode = 1;
  } finally {
    if (localClient) await localClient.close();
    if (targetClient) await targetClient.close();
  }
})();