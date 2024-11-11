import {Db, type Document, MongoClient} from "mongodb";
import {type Source, sourcesCollectionName} from "./interfaces/source";
import {type User, usersCollectionName} from "./interfaces/user";
import {type Service, servicesCollectionName} from "./interfaces/service";
import {type Song, songsCollectionName} from "./interfaces/song";
import {type Lyric, lyricsCollectionName} from "./interfaces/lyric";
import {type Audio, audiosCollectionName} from "./interfaces/audio";
import {type Playlist, playlistsCollectionName} from "./interfaces/playlist";
import {type AudioSample, audioSamplesCollectionName} from "./interfaces/audioSample";
import {type GenRequest, genRequestCollectionName} from "./interfaces/genRequest";
import {type MusicStyle, musicStylesCollectionName} from "./interfaces/musicStyles";
import {type MusicStylePreset, musicStylePresetsCollectionName} from "./interfaces/musicStylePresets";

let db: Db | undefined = undefined;
let dbConnection = undefined;

export async function connectToDB() {
    const connectionString = process.env.DB_URI || "";
    const dbName = process.env.DB_NAME || "";
    const client = new MongoClient(connectionString);

    try {
        dbConnection = await client.connect();
        db = dbConnection.db(dbName);

    } catch(e) {
        console.error(e);
        throw e;
    }
}

export async function getDbEntity<T extends Document>(collectionName: string){
    if (!db) {
        await connectToDB();
    }

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

export const MusicStyles = await getDbEntity<MusicStyle>(musicStylesCollectionName);
export const MusicStylePresets = await getDbEntity<MusicStylePreset>(musicStylePresetsCollectionName);

export const GenRequests = await getDbEntity<GenRequest>(genRequestCollectionName);
export const AudioSamples = await getDbEntity<AudioSample>(audioSamplesCollectionName);
