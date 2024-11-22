import {Source} from "../db/interfaces/source.ts";
import {Services, Sources} from "../db/connection.ts";
import {AvailableServices} from "../db/interfaces/service.ts";
import {type AudioIndex, newSunoApi} from "../modules/suno.ts";
import {Timeable} from "../db/interfaces/_timeable.ts";
import type {Document} from "mongodb";

class SunoExporter {
    public async run(sunoAccount?: Source): Promise<void> {
        const targetAccounts: Source[] = [];

        if (sunoAccount) {
            targetAccounts.push(sunoAccount);
        } else {
            const sunoService = await Services.findOne({name: AvailableServices.suno})

            if (!sunoService) {
                throw new Error('Cant find the target service');
            }

            targetAccounts.concat((await Sources.find({serviceId: sunoService._id}).toArray()));
        }

        for (const account of targetAccounts) {
            await this.parseAccount(account);
        }
    }

    private async parseAccount(sunoAccount: Source) {
        if (!sunoAccount.cookies) { return; }

        const sunoApi = await newSunoApi(sunoAccount.cookies);
        let isBlocked = false;
        let res: AudioIndex;
        let page = 1;
        let attempts = 0;
        let recordsProcessed = 0;
        const attemptsLimit = 10;

        while(!isBlocked)
        try {
            res = await sunoApi.getV2('' + page);
            page += 1;
            attempts = 0;

            res.clips.forEach((clip) => {

                // export class Lyric implements Document {
                //     public _id?: string;
                //     public songId: string;
                //     public text: string;
                //     public lang: number;

                // export class Audio extends Timeable implements Document {
                //     public _id?: string;
                //     public parentInnerId?: string; ?
                //     public serviceInnerId?: string; +
                //     public serviceUrl?: string; ?
                //     public serviceAudioUrl?: string; +
                //     public coverImageUrl?: string; +
                //     public songId: string; -
                //     public sourceId: string; +
                //     public name: string; +
                //     public lang: number; -
                //     public playedCount: number; +
                //     public likedCount: number; +
                //     public styles: string; +
                //     public isPublic: boolean; +
                //     public isCompleted: boolean; -

            })

            recordsProcessed += res.clips.length;
            isBlocked = recordsProcessed >= res.total;
        }
        catch(e) {
            attempts += 1;

            if (attempts > attemptsLimit) {
                isBlocked = true;
            }
        }
    }
}
export const sunoExporter = new SunoExporter();