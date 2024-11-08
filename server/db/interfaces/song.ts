import { type Document } from "mongodb";
import {Timeable} from "./_timeable.ts";

export const songsCollectionName = 'songs';

export class Song extends Timeable implements Document {
    public _id?: string;
    public name: string;
    public cloudPath?: string;
    public isPublic: boolean;

    constructor(data: (Partial<Song> & { name: string })) {
        super(data);

        this.name = data.name;
        this._id = data._id;
        this.cloudPath = data.cloudPath;
        this.isPublic = data.isPublic || true;
    }
}
