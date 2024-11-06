import { type Document } from "mongodb";
import {Language} from "./audio.ts";

export const lyricsCollectionName = 'lyrics';

export class Lyric implements Document {
    public _id: string | undefined;
    public songId: string | undefined;
    public text: string | undefined;
    public lang: number = Language.English;
}
