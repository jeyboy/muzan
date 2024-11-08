import {Db, type Document, MongoClient} from "mongodb";
import {type Source, sourcesCollectionName} from "./interfaces/source.ts";
import {type User, usersCollectionName} from "./interfaces/user.ts";
import {type Service, servicesCollectionName} from "./interfaces/service.ts";
import {type Song, songsCollectionName} from "./interfaces/song.ts";
import {type Lyric, lyricsCollectionName} from "./interfaces/lyric.ts";
import {type Audio, audiosCollectionName} from "./interfaces/audio.ts";
import {type Playlist, playlistsCollectionName} from "./interfaces/playlist.ts";

let db: Db | undefined = undefined;

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

export async function getDbEntity<T extends Document>(collectionName: string){
    if (!db) {
        throw new Error('The db is not initiated');
    }
    return db.collection<T>(collectionName);
}

export const Sources = await getDbEntity<Source>(sourcesCollectionName);
export const Users = await getDbEntity<User>(usersCollectionName);
export const Services = await getDbEntity<Service>(servicesCollectionName);

export const Songs = await getDbEntity<Song>(songsCollectionName);
export const Lyrics = await getDbEntity<Lyric>(lyricsCollectionName);
export const Audios = await getDbEntity<Audio>(audiosCollectionName);
export const Playlists = await getDbEntity<Playlist>(playlistsCollectionName);


