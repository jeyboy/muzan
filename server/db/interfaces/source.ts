import { type Document } from "mongodb";

export class Source implements Document {
    public _id: string | undefined;
    public serviceId: string | undefined;
    public email: string | undefined;
    public key: string | undefined;
    public secret: string | undefined;
    public cookies: string | undefined;
}
