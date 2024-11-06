import { type Document } from "mongodb";

export const audiosCollectionName = 'audios';

export enum Status {
    Initialized = 0,
    Failed = 1,
    Completed = 2,
    InProgress = 3,
}

export enum Language {
    English = 0,
    Russian = 1,
    Ukraine = 2,
}

export class Audio implements Document {
    public _id: string | undefined;
    public innerId: string | undefined;
    public innerUrl: string | undefined;
    public songId: string | undefined;
    public sourceId: string | undefined;
    public name: string | undefined;
    public lang: number = Language.English;
    public playedCount: number = 0;
    public likedCount: number = 0;
    public styles: string = '';
    public status: Status = Status.Initialized;
    public isPublic: boolean = true;
}
