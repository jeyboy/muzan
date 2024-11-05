
import { type Document } from "mongodb";

export class Song implements Document {
    public _id: string | undefined;
    public lang: string | undefined;
    public name: string | undefined;
    public path: string | undefined;
}
