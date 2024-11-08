export class Timeable {
    public createdAt: number;
    public updatedAt: number;

    constructor(public date: Partial<Timeable>) {
        this.createdAt = date.createdAt || Date.now();
        this.updatedAt = date.updatedAt || Date.now();
    }
}