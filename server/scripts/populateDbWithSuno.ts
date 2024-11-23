import {Source} from "../db/interfaces/source.ts";
import {Audios, Services, Sources} from "../db/connection.ts";
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
        let page = 0;
        let attempts = 0;
        let recordsProcessed = 0;
        const attemptsLimit = 10;

        while(!isBlocked)
        try {
            res = await sunoApi.getV2('' + page);
            page += 1;
            attempts = 0;

            res.clips.forEach((clip) => {
                Audios.updateOne(
                    {serviceInnerId: clip.id},
                    {
                        parentInnerId: clip.concat_history?[0],
                        serviceInnerId: clip.id,
                        serviceUrl: `https://suno.com/song/#{clip.id}`,
                        serviceAudioUrl: clip.audio_url,
                        coverImageUrl: clip.image_large_url,
                        songId: '', // placeholder
                        sourceId: sunoAccount._id,
                        name: clip.title,
                        // lang: ,
                        playedCount: clip.,
                        //     public likedCount: number; +
                        //     public styles: string; +
                        //     public isPublic: boolean; +
                        //     public isCompleted: boolean; -
                        createdAt: clip.created_at,
                    },
                    { upsert: true }
                )
            })


            // id: audio.id,
            //     title: audio.title,
            //     image_url: audio.image_url,
            //     lyric: audio.metadata.prompt
            //     ? this.parseLyrics(audio.metadata.prompt)
            //     : '',
            //     audio_url: audio.audio_url,
            //     video_url: audio.video_url,
            //     created_at: audio.created_at,
            //     model_name: audio.model_name,
            //     status: audio.status,
            //     gpt_description_prompt: audio.metadata.gpt_description_prompt,
            //     prompt: audio.metadata.prompt,
            //     type: audio.metadata.type,
            //     tags: audio.metadata.tags,
            //     duration: audio.metadata.duration,
            //     error_message: audio.metadata.error_message,
            //     is_trashed: audio.is_trashed,
            //     is_public: audio.is_public,
            //     concat_history: audio.metadata.concat_history,
            //     has_vocal: audio.metadata.has_vocal,


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