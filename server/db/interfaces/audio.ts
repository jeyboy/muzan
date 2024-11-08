import { type Document } from "mongodb";
import {Timeable} from "./_timeable.ts";

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

export class Audio extends Timeable implements Document {
    public _id?: string;
    public parentInnerId?: string;
    public innerId?: string;
    public serviceUrl?: string;
    public serviceAudioUrl?: string;
    public songId: string;
    public sourceId: string;
    public name: string;
    public lang: number;
    public playedCount: number;
    public likedCount: number;
    public styles: string;
    public status: Status;
    public isPublic: boolean;
    public isCompleted: boolean;

    constructor(data: (Partial<Audio> & { name: string, songId: string, sourceId: string })) {
        super(data);

        this._id = data._id;
        this.parentInnerId = data.parentInnerId;
        this.innerId = data.innerId;
        this.serviceUrl = data.serviceUrl;
        this.serviceAudioUrl = data.serviceAudioUrl;
        this.songId = data.songId;
        this.sourceId = data.sourceId;
        this.name = data.name;
        this.lang = data.lang = Language.English;
        this.likedCount = Number(data.likedCount);
        this.playedCount = Number(data.playedCount);
        this.styles = data.styles = '';
        this.status = data.status = Status.Initialized;
        this.isPublic = data.isPublic || true;
        this.isCompleted = data.isCompleted || false;
    }
}
