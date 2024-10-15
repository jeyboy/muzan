import { MongoClient } from "mongodb";

const connectionString = process.env.DB_URI || "";
const dbName = process.env.DB_NAME || "";
const client = new MongoClient(connectionString);
let db;

try {
  const conn = await client.connect();
  db = conn.db(dbName);

} catch(e) {
  console.error(e);
  throw e;
}

export default db;

export const getDbEntity = async (collectionName: string) => {
    return db.collection(collectionName);
}