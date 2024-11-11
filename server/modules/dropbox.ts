import {type async, Dropbox, DropboxAuth, DropboxResponse, type files} from "dropbox";
import * as fs from "node:fs";

export type SpaceMetrics = {
    used: number;
    allocated: number;
};

export type DropboxNode = {
    files: { [U: string]: string };
    folders: { [U: string]: DropboxNode };
};

const DELIMITER = '/';

export const concatPathParts = ([...args]) => args.join(DELIMITER);

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

    public async list(path: string = '') {
        let entries: Array<files.FileMetadataReference|files.FolderMetadataReference|files.DeletedMetadataReference>;
        let dropData: DropboxResponse<files.ListFolderResult> | undefined;
        const res: DropboxNode = {files: {}, folders: {}};
        const cache: {[S:string]: DropboxNode} = {};

        try {
            do {
                if (dropData) {
                    dropData = await this.ctx.filesListFolderContinue({cursor: dropData.result.cursor});
                } else {
                    dropData = await this.ctx.filesListFolder({path, recursive: true});
                }

                entries = dropData.result.entries;

                for (const entry of entries) {
                    if (entry.path_lower) {
                        const path = entry.path_lower.slice(0, - entry.name.length);

                        if (entry[".tag"] === 'folder') {
                            cache[entry.path_lower] = cache[path].folders[path] = {files: {}, folders: {}};
                        } else {
                            cache[path].files[entry.name] = entry.path_lower;
                        }
                    }
                }
            }
            while (dropData.result.has_more);
        } catch (e) {
            const y = 0;
            // TODO: do something
        }

        return res;
    }

    // public async list(path: string = '', res: DropboxNode = {files: {}, folders: {}}) {
    //     let dropData: DropboxResponse<files.ListFolderResult> | undefined;
    //     let entries: Array<files.FileMetadataReference|files.FolderMetadataReference|files.DeletedMetadataReference> = [];
    //
    //     try {
    //         do {
    //             let status = false;
    //             let retryAmount = 10;
    //             do {
    //                 try {
    //                     if (dropData) {
    //                         dropData = await this.ctx.filesListFolderContinue({cursor: dropData.result.cursor});
    //                         entries = dropData.result.entries;
    //                     } else {
    //                         dropData = await this.ctx.filesListFolder({path});
    //                         entries = dropData.result.entries;
    //                     }
    //
    //                     status = true;
    //                 }
    //                 catch(e: any) {
    //                     retryAmount -= 1;
    //
    //                     if (retryAmount === 0) {
    //                         console.error("Can't parse list of entities", e.message);
    //                         return res;
    //                     }
    //                 }
    //             }
    //             while (!status)
    //
    //             for (const entry of entries) {
    //                 if (entry[".tag"] === 'folder') {
    //                     if (entry.path_lower) {
    //                         res.folders[entry.name] = {files: {}, folders: {}};
    //                         await this.list(entry.path_lower, res.folders[entry.name]);
    //                     }
    //                 } else {
    //                     res.files[entry.name] = entry.path_lower || '';
    //                 }
    //             }
    //         }
    //         while (dropData && dropData.result.has_more);
    //     }
    //     catch(e) {
    //         const y = 0;
    //         // TODO: do something
    //     }
    //
    //     return res;
    // }

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

    public async downloadUrl(path: string) {
        let url;

        try {
            const res = await this.ctx.sharingCreateSharedLinkWithSettings(
                {
                    path,
                    settings: {
                        require_password: false,
                        allow_download: true,
                    }
                });

           url = res.result.url;
        }
        catch(e: any) {
            if (e.status === 409) {
                try {
                    const res = await this.ctx.sharingListSharedLinks({path});
                    url = res.result.links[0].url;
                }
                catch(e: any) {
                    return undefined;
                }
            } else {
                console.error(e);
                return undefined;
            }
        }

        return url.replace('dl=0', 'raw=1');
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

export const dropboxApi = new DropBox();