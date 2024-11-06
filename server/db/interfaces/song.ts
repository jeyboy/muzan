import { type Document } from "mongodb";

export const songsCollectionName = 'songs';

export class Song implements Document {
    public _id: string | undefined;
    public name: string | undefined;
    public cloudPath: string | undefined;
    public isPublic: boolean = true;
}
