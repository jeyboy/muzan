export class Timeable {
    public createdAt: number;
    public updatedAt: number;

    constructor(public data: Partial<Timeable>) {
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }
}