import { type Document } from "mongodb";

export const genRequestCollectionName = 'gen_requests';

export class GenRequest implements Document {
    public _id: string | undefined;
    public serviceId: string;
    public audioId: string;
    public lyricId: string;


    // constructor(data: (Partial<GenRequest> & { name: string })) {
    //     this.name = data.name;
    //     this._id = data._id;
    //     this.presets = data.presets || [];
    // }
}
