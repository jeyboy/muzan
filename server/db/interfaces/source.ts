import { type Document } from "mongodb";
import {Timeable} from "./_timeable";

export const sourcesCollectionName = 'sources';

export enum SourceAbility {
    generate = 1,
    upload = 2,
    download = 3,
    extend = 4,
    accumulate = 5,
}

export class Source extends Timeable implements Document {
    public _id?: string;
    public serviceId: string;
    public email: string;
    public key?: string;
    public secret?: string;
    public cookies?: string;
    public abilities: Array<number>;
    public maxPresetLevel: number;
    public quota: number;
    public quotaUpdatedAt: number;

    constructor(data: (Partial<Source> & { serviceId: string, email: string })) {
        super(data);

        this.serviceId = data.serviceId;
        this._id = data._id;
        this.email = data.email;
        this.key = data.key;

        this.secret = data.secret;
        this.cookies = data.cookies;
        this.abilities = data.abilities || [
            SourceAbility.generate,
            SourceAbility.download,
            SourceAbility.extend,
            SourceAbility.accumulate,
        ];

        this.maxPresetLevel = Number(data.maxPresetLevel);
        this.quota = Number(data.quota);
        this.quotaUpdatedAt = Number(data.quotaUpdatedAt);
    }
}
