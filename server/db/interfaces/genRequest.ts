import { type Document } from "mongodb";
import {Timeable} from "./_timeable";

export const genRequestCollectionName = 'gen_requests';

export enum Status {
    Initialized = 0,
    Failed = 1,
    Completed = 2,
    InProgress = 3,
}

export interface GenRequestConfig {
    [S:string]: string;
}

export class GenRequest extends Timeable implements Document {
    public _id: string;
    public serviceId: string;
    public config: GenRequestConfig = {};
    public audioId?: string;
    public lyricId?: string;
    public status: Status = Status.Initialized;

    constructor(data: (Partial<GenRequest> & { _id: string, serviceId: string})) {
        super(data);
        const {_id, serviceId, createdAt, updatedAt, ...rest} = data;

        this._id = _id;
        this.serviceId = serviceId;
        Object.assign(this, rest);
    }
}

export class GenRequestCreate extends Timeable {
    public serviceId: string;
    public config: GenRequestConfig;
    public lyricId?: string;

    constructor(data: GenRequestCreate) {
        super(data);

        this.serviceId = data.serviceId;
        this.config = data.config;
        this.lyricId = data.lyricId;
    }
}
