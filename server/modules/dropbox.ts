import {type async, Dropbox, DropboxAuth, DropboxResponse, type files} from "dropbox";
import * as fs from "node:fs";
import path from "path";
import type {
    users
} from "dropbox/types/dropbox_types";
import type FileMetadataReference = files.FileMetadataReference;
import type FolderMetadataReference = files.FolderMetadataReference;
import type DeletedMetadataReference = files.DeletedMetadataReference;

export type SpaceMetrics = {
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
        // var entries = {};
        // let fetch_files = function(_path, entries){
        //     await dbx.filesListFolder({path: _path})
        //         .then(function(response) {
        //             console.log('response', response);
        //             entries = response.result.entries;
        //             for (var i = 0; i < entries.length; i++) {
        //                 if(entries[i]['.tag'] == 'folder'){
        //                     entries[i]['subentries'] = {};
        //                     fetch_files(entries[i]['path_display'], entries[i]['subentries']);
        //                 }
        //             }
        //         })
        //         .catch(function(error) {
        //             console.error(error);
        //         });
        // };
        // fetch_files('', entries);
        // if(Object.keys(entries).length !== 0){
        //     displayFiles(entries);
        // }



        const res = {};
        let dropData: DropboxResponse<files.ListFolderResult> | undefined;
        let entries: Array<FileMetadataReference|FolderMetadataReference|DeletedMetadataReference>;

        try {
            do {
                if (dropData) {
                    dropData = await this.ctx.filesListFolderContinue({ cursor: dropData.result.cursor });
                    entries = dropData.result.entries;
                } else {
                    dropData = await this.ctx.filesListFolder({ path });
                    entries = dropData.result.entries;
                }

                entries.forEach((entry) => {
                    if (entry[".tag"] === 'folder') {

                    }
                });
            }
            while (dropData.result.has_more);
        }
        catch(e) {
            // TODO: do something
        }

        return res;
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