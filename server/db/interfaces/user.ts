import { type Document } from "mongodb";
import {Timeable} from "./_timeable";

export const usersCollectionName = 'users';

export class User extends Timeable implements Document {
    public _id?: string;
    public firstName?: string;
    public email: string;
    public passwordHash?: string;
    public roles: Array<string>;

    constructor(data: (Partial<User> & { email: string })) {
        super(data);

        this.firstName = data.firstName;
        this._id = data._id;
        this.email = data.email;
        this.roles = data.roles || [];

        if (data.passwordHash) {
            this.passwordHash = data.passwordHash;
        }
    }
}
