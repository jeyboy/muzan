import { type Document } from "mongodb";
import {Timeable} from "./_timeable";

export const audiosCollectionName = 'audios';



export enum Language {
    None,
    English = 1,
    Russian = 2,
    Ukraine = 3,
}

export class Audio extends Timeable implements Document {
    public _id?: string;
    public parentInnerId?: string;
    public serviceInnerId?: string;
    public serviceUrl?: string;
    public serviceAudioUrl?: string;
    public serviceVideoUrl?: string;
    public servicePresetLevel: number;
    public coverImageUrl?: string;
    public songId: string;
    public sourceId: string;
    public name: string;
    public lang: number;
    public playedCount: number;
    public likedCount: number;
    public styles: string;
    public isPublic: boolean;
    public isCompleted: boolean;
    public prompt?: string;
    public concatStory: string[];
    public createdAt: number;

    constructor(data: (Partial<Audio> & { name: string, songId: string, sourceId: string, servicePresetLevel: number })) {
        super(data);

        this._id = data._id;
        this.parentInnerId = data.parentInnerId;
        this.serviceInnerId = data.serviceInnerId;
        this.serviceUrl = data.serviceUrl;
        this.serviceAudioUrl = data.serviceAudioUrl;
        this.serviceVideoUrl = data.serviceVideoUrl;
        this.coverImageUrl = data.coverImageUrl;
        this.songId = data.songId;
        this.sourceId = data.sourceId;
        this.name = data.name;
        this.lang = data.lang || Language.None;
        this.likedCount = Number(data.likedCount);
        this.playedCount = Number(data.playedCount);
        this.styles = data.styles || '';
        this.isPublic = data.isPublic || true;
        this.isCompleted = data.isCompleted || false;
        this.servicePresetLevel = data.servicePresetLevel;
        this.prompt = data.prompt;
        this.concatStory = data.concatStory || [];
        this.createdAt = data.createdAt || Date.now();
    }
}
