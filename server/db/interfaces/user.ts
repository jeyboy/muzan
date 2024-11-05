import { type Document } from "mongodb";

export class User implements Document {
    public _id: string | undefined;
    public firstName: string | undefined;
    public email: string | undefined;
    public passwordHash: string | undefined;
    public createdAt: Date | undefined;
    public updatedAt: Date | undefined;
}
