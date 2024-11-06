import { type Document } from "mongodb";

export class Service implements Document {
    public _id: string | undefined;
    public name: string | undefined;
    public presets: string[] | undefined;
}
