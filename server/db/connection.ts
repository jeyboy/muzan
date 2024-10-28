import { Db, MongoClient} from "mongodb";

let db: Db | undefined = undefined;

export const usersCollectionName = 'users';
export const songsCollectionName = 'songs';
export const lyricsCollectionName = 'lyrics';
export const audiosCollectionName = 'audios';
export const sourcesCollectionName = 'sources';

export async function connectToDB() {
    const connectionString = process.env.DB_URI || "";
    const dbName = process.env.DB_NAME || "";
    const client = new MongoClient(connectionString);

    try {
        const conn = await client.connect();
        db = conn.db(dbName);

    } catch(e) {
        console.error(e);
        throw e;
    }
}

export const getDbEntity = async (collectionName: string) => {
    if (!db) {
        throw new Error('The db is not initiated');
    }

    return db.collection(collectionName);
}