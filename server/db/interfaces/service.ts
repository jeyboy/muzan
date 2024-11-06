import { type Document } from "mongodb";

export class ServicePreset {
    public name: string;
    public identifier: string;
    public description: string | undefined;

    constructor(data: (Partial<ServicePreset> & { name: string, identifier: string })) {
        this.name = data.name;
        this.identifier = data.identifier;
        this.description = data.description;
    }
}

export class Service implements Document {
    public _id: string | undefined;
    public name: string;
    public presets: ServicePreset[];

    constructor(data: (Partial<Service> & { name: string })) {
        this.name = data.name;
        this._id = data._id;
        this.presets = data.presets || [];
    }
}
