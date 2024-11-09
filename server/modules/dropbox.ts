import {type async, Dropbox, DropboxAuth, DropboxResponse, type files} from "dropbox";
import * as fs from "node:fs";
import path from "path";
import type {
    users
} from "dropbox/types/dropbox_types";

export type SpaceMetrics = {
    used: number;
    allocated: number;
};

export type DropboxNode = {
    files: { [U: string]: string };
    folders: { [U: string]: DropboxNode };
};

export const concatPathParts = ([...args]) => args.join('/');

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

    public async spaceLeft(): Promise<SpaceMetrics> {
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

    public async list(path: string = '', res: DropboxNode = {files: {}, folders: {}}) {
        let dropData: DropboxResponse<files.ListFolderResult> | undefined;
        let entries: Array<files.FileMetadataReference|files.FolderMetadataReference|files.DeletedMetadataReference>;

        try {
            do {
                if (dropData) {
                    dropData = await this.ctx.filesListFolderContinue({ cursor: dropData.result.cursor });
                    entries = dropData.result.entries;
                } else {
                    dropData = await this.ctx.filesListFolder({ path });
                    entries = dropData.result.entries;
                }

                for (const entry of entries) {
                    if (entry[".tag"] === 'folder') {
                        if (entry.path_lower) {
                            res.folders[entry.name] = {files: {}, folders: {}};
                            await this.list(entry.path_lower, res.folders[entry.name]);
                        }
                    } else {
                        res.files[entry.name] = entry.path_lower || '';
                    }
                }
            }
            while (dropData.result.has_more);
        }
        catch(e) {
            // TODO: do something
        }

        return res;
    }

    // public uploadFile() {
    //     fs.readFile(path.join(__dirname, '/basic.js'), 'utf8', (err, contents) => {
    //         if (err) {
    //             console.log('Error: ', err);
    //         }
    //
    //         // This uploads basic.js to the root of your dropbox
    //         this.ctx.filesUpload({ path: '/basic.js', contents })
    //             .then((response: any) => {
    //                 console.log(response);
    //             })
    //             .catch((uploadErr: Error) => {
    //                 console.log(uploadErr);
    //             });
    //     });
    // }

    public async uploadUrl(path: string, url: string): Promise<string|undefined> {
        try {
            const res: DropboxResponse<files.SaveUrlResult> = await this.ctx.filesSaveUrl({ path, url });

            if (res.result[".tag"] === 'complete') {
                return '';
            } else {
                return (res.result as async.LaunchResultBase).async_job_id;
            }
        }
        catch(e) {
            console.error(e);
        }
    }

    public async uploadUrlStatus(jobId: async.AsyncJobId): Promise<string> {
        try {
            const res = await this.ctx.filesSaveUrlCheckJobStatus({
                async_job_id: jobId
            });

            const tag = res.result[".tag"];

            switch(tag) {
                case 'complete':
                case 'failed':
                case 'in_progress': return tag;
                default: return 'unknown';
            }
        }
        catch(e) {
            console.error(e);
            return 'failed';
        }
    }

    public downloadUrl() {

    }

    // public downloadFile(sharedLink: string) {
    //     this.ctx.sharingGetSharedLinkFile({ url: sharedLink })
    //         .then((data: any) => {
    //             // Note: The fileBinary field is not part of the Dropbox SDK
    //             // specification, so it is not included in the TypeScript type.
    //             // It is injected by the SDK.
    //             fs.writeFile(data.result.name, (<any> data).result.fileBinary, { encoding: 'binary' }, (err) => {
    //                 if (err) { throw err; }
    //                 console.log(`File: ${data.result.name} saved.`);
    //             });
    //         })
    //         .catch((err: Error) => {
    //             throw err;
    //         });
    // }

    public async createFolder(path: string): Promise<boolean> {
        try {
            await this.ctx.filesCreateFolderV2({ path });
            return true;
        }
        catch(e) {
            console.error(e);
        }

        return false;
    }

    public async deleteFile(path: string): Promise<boolean>  {
        const res = await this.ctx.filesDeleteV2({ path })
        return res.result.metadata[".tag"] === 'file';
    }

    public async deleteFolder(path: string) {
        const res = await this.ctx.filesDeleteV2({ path })
        return res.result.metadata[".tag"] === 'folder';
    }
}

export default new DropBox();