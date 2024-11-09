import { type Document } from "mongodb";
import {Language} from "./audio";

export const lyricsCollectionName = 'lyrics';

export class Lyric implements Document {
    public _id?: string;
    public songId: string;
    public text: string;
    public lang: number;

    constructor(data: (Partial<Lyric> & { songId: string, text: string })) {
        this.songId = data.songId;
        this._id = data._id;
        this.text = data.text;
        this.lang = data.lang || Language.English;
    }
}
