import { type Document } from "mongodb";
import {Timeable} from "./_timeable.ts";

export const musicStylePresetsCollectionName = 'music_style_presets';

export class MusicStylePreset extends Timeable implements Document {
    public _id?: string;
    public musicStyles: Array<string>;

    constructor(data: (Partial<MusicStylePreset> & { musicStyles: Array<string> })) {
        super(data);

        this.musicStyles = data.musicStyles;
        this._id = data._id;
    }
}
