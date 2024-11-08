import { type Document } from "mongodb";
import {Timeable} from "./_timeable.ts";

export const playlistsCollectionName = 'playlists';

export class Playlist extends Timeable implements Document {
    public _id?: string;
    public userId?: string;
    public name: string;
    public audios: Array<string>;

    constructor(data: (Partial<Playlist> & { name: string })) {
        super(data);

        this.name = data.name;
        this._id = data._id;
        this.userId = data.userId;
        this.audios = data.audios || [];
    }
}
