import { type Document } from "mongodb";
import {Timeable} from "./_timeable.ts";

export const genRequestCollectionName = 'gen_requests';

export class GenRequest extends Timeable implements Document {
    public _id?: string;
    public serviceId: string;
    public audioId: string;
    public lyricId?: string;

    constructor(data: (Partial<GenRequest> & { serviceId: string, audioId: string })) {
        super(data);

        this.serviceId = data.serviceId;
        this._id = data._id;
        this.audioId = data.audioId;
        this.lyricId = data.lyricId;
    }
}
