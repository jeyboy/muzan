import { type Document } from "mongodb";

export const musicStylesCollectionName = 'music_styles';

export class MusicStyle implements Document {
    public _id?: string;
    public name: string;

    constructor(data: (Partial<MusicStyle> & { name: string })) {
        this.name = data.name;
        this._id = data._id;
    }
}
