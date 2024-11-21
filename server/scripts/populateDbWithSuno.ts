import {Source} from "../db/interfaces/source.ts";
import {Services, Sources} from "../db/connection.ts";
import {AvailableServices} from "../db/interfaces/service.ts";
import {newSunoApi} from "../modules/suno.ts";

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


        sunoApi.get()
    }
}
export const sunoExporter = new SunoExporter();