import { type Document } from "mongodb";

export const lyricsCollectionName = 'lyrics';

export class Lyric implements Document {
    public _id: string | undefined;
    public songId: string | undefined;
    public text: string | undefined;
}
