import { type Document } from "mongodb";
import {Timeable} from "./_timeable";

export const servicesCollectionName = 'services';

export class ServicePreset extends Timeable {
    public name: string;
    public identifier: string;
    public description?: string;
    public level: number;

    constructor(data: (Partial<ServicePreset> & { name: string, identifier: string })) {
        super(data);

        this.name = data.name;
        this.identifier = data.identifier;
        this.description = data.description;
        this.level = data.level || 0;
    }
}

export class Service implements Document {
    public _id?: string;
    public name: string;
    public presets: ServicePreset[];

    constructor(data: (Partial<Service> & { name: string })) {
        this.name = data.name;
        this._id = data._id;
        this.presets = data.presets || [];
    }
}
