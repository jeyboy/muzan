import { type Document } from "mongodb";
import {Timeable} from "./_timeable";

export const audioSamplesCollectionName = 'audio_samples';

export class AudioSample extends Timeable implements Document {
    public _id?: string;
    public serviceInnerId: string;
    public serviceUrl: string;
    public serviceAudioUrl: string;
    public serviceId?: string;
    public sourceId?: string;
    public name: string;

    constructor(data: (Partial<AudioSample> & { name: string, serviceInnerId: string, serviceUrl: string, serviceAudioUrl: string })) {
        super(data);

        this._id = data._id;
        this.serviceInnerId = data.serviceInnerId;
        this.serviceUrl = data.serviceUrl;
        this.serviceAudioUrl = data.serviceAudioUrl;
        this.serviceId = data.serviceId;
        this.sourceId = data.sourceId;
        this.name = data.name;
    }
}
