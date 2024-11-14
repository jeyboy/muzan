import { type Document } from "mongodb";
import {Timeable} from "./_timeable";

export const songsCollectionName = 'songs';

export class Song extends Timeable implements Document {
    public _id?: string;
    public name: string;
    public displayName: string;
    public cloudPath?: string;
    public isPublic: boolean;

    constructor(data: (Partial<Song> & { name: string })) {
        super(data);

        this.name = data.name;
        this._id = data._id;
        this.cloudPath = data.cloudPath;
        this.isPublic = data.isPublic || true;
        this.displayName = data.displayName || this.name;
    }
}

export class CreateSong extends Timeable implements Document {
    public name: string;
    public displayName: string;
    public cloudPath?: string;
    public isPublic: boolean;

    constructor(data: (Partial<Song> & { name: string })) {
        super(data);

        this.name = data.name;
        this.cloudPath = data.cloudPath;
        this.isPublic = data.isPublic || true;
        this.displayName = data.displayName || this.name;
    }
}
