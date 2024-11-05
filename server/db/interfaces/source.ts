import { type Document } from "mongodb";

export const ServiceNames = {
    suno: 'suno',
}

export class Source implements Document {
    public _id: string | undefined;
    public serviceName: string | undefined;
    public email: string | undefined;
    public key: string | undefined;
    public secret: string | undefined;
    public cookies: string | undefined;
}
