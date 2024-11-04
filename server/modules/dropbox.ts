import {type async, Dropbox, DropboxAuth, DropboxResponse, type files} from "dropbox";
import * as fs from "node:fs";
import path from "path";
import type {users} from "dropbox/types/dropbox_types";

export type spaceMetrics = {
    used: number;
    allocated: number;
};

class DropBox {
    private ctx: Dropbox;

    constructor() {
        const dAuth = new DropboxAuth({
            accessToken: process.env.DROP_TOKEN,
            refreshToken: process.env.DROP_REFRESH_TOKEN,
            accessTokenExpiresAt: new Date(),
            clientId: process.env.DROP_APP_KEY,
            clientSecret: process.env.DROP_APP_SECRET,
        });


        this.ctx = new Dropbox({ auth: dAuth });
    }

    public async spaceLeft(): Promise<spaceMetrics> {
        // const res = await this.makeCall<Promise<DropboxResponse<users.SpaceUsage>>>(async () => { return await this.ctx.usersGetSpaceUsage() });

        const res = await this.ctx.usersGetSpaceUsage();

        let usedMem = 0;
        let allocatedMem = 0;

        if (res) {
            if ('allocated' in res.result.allocation) {
                allocatedMem = res.result.allocation.allocated;
            }

            usedMem = res.result.used;
        } else {
            console.error("Can't made the call: spaceLeft")
        }

        return {
            used: usedMem,
            allocated: allocatedMem,
        };
    }

    public list() {
        // filesListFolderContinue

        this.ctx.filesListFolder({ path: '' })
            .then((response: any) => {
                console.log(response);
            })
            .catch((err: any) => {
                console.log(err);
            });
    }

    public uploadFile() {
        fs.readFile(path.join(__dirname, '/basic.js'), 'utf8', (err, contents) => {
            if (err) {
                console.log('Error: ', err);
            }

            // This uploads basic.js to the root of your dropbox
            this.ctx.filesUpload({ path: '/basic.js', contents })
                .then((response: any) => {
                    console.log(response);
                })
                .catch((uploadErr: Error) => {
                    console.log(uploadErr);
                });
        });
    }

    public uploadUrl() {
        return this.ctx.filesSaveUrl({
            path: '',
            url: '',
        }).then((data: DropboxResponse<files.SaveUrlResult>) => {

        })
        .catch((err: Error) => {
            throw err;
        });
    }

    public uploadUrlStatus(jobId: async.AsyncJobId) {
        return this.ctx.filesSaveUrlCheckJobStatus({
            async_job_id: jobId
        }).then((data: DropboxResponse<files.SaveUrlJobStatus>) => {

        })
        .catch((err: Error) => {
            throw err;
        });
    }



    public downloadFile(sharedLink: string) {
        this.ctx.sharingGetSharedLinkFile({ url: sharedLink })
            .then((data: any) => {
                // Note: The fileBinary field is not part of the Dropbox SDK
                // specification, so it is not included in the TypeScript type.
                // It is injected by the SDK.
                fs.writeFile(data.result.name, (<any> data).result.fileBinary, { encoding: 'binary' }, (err) => {
                    if (err) { throw err; }
                    console.log(`File: ${data.result.name} saved.`);
                });
            })
            .catch((err: Error) => {
                throw err;
            });
    }

    public createFolder(path: string) {
        this.ctx.filesCreateFolderV2({ path })
            .then((data: any) => {

            })
            .catch((err: Error) => {
                throw err;
            });
    }

    public deleteFile(path: string) {
       return  this.deleteFolder(path);
    }

    public deleteFolder(path: string) {
        return this.ctx.filesDeleteV2({ path })
            .then((data: any) => {

            })
            .catch((err: Error) => {
                throw err;
            });
    }

    // private ctx() {
    //     return new Dropbox({ accessToken: process.env.DROP_TOKEN, refreshToken: process.env.DROP_REFRESH_TOKEN })
    // }
}

export default new DropBox();