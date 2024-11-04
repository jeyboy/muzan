export class Audio {
    public id: string | undefined;
    public url: string | undefined;
    public songId: string | undefined;
    public sourceId: string | undefined;
    public name: string | undefined;
    public playedCount: number = 0;
    public likedCount: number = 0;
    public styles: string = '';
}
