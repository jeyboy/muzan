import {type async, Dropbox, DropboxResponse, type files} from "dropbox";
import * as fs from "node:fs";
import path from "path";

export type spaceMetrics = {
    used: number;
    allocated: number;
};

// https://www.dropbox.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&token_access_type=offline

// curl https://api.dropbox.com/oauth2/token \
//     -d code=<AUTHORIZATION_CODE> \
//     -d grant_type=authorization_code \
//     -d redirect_uri=<REDIRECT_URI> \
//     -u <APP_KEY>:<APP_SECRET>


// curl https://api.dropbox.com/oauth2/token \
//     -d grant_type=refresh_token \
//     -d refresh_token=<YOUR_REFRESH_TOKEN> \
//     -u <YOUR_APP_KEY>:<YOUR_APP_SECRET>

// account_info.read
// files. metadata. read
// files. content. write
// sharing. read

class DropBox {
    public async spaceLeft(): Promise<spaceMetrics> {
        const res = await this.ctx().usersGetSpaceUsage();
        let allocatedMem = 0;

        if ('allocated' in res.result.allocation) {
            allocatedMem = res.result.allocation.allocated;
        }

        return {
            used: res.result.used,
            allocated: allocatedMem,
        };
    }

    public list() {
        // filesListFolderContinue

        this.ctx().filesListFolder({ path: '' })
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
            this.ctx().filesUpload({ path: '/basic.js', contents })
                .then((response: any) => {
                    console.log(response);
                })
                .catch((uploadErr: Error) => {
                    console.log(uploadErr);
                });
        });
    }

    public uploadUrl() {
        return this.ctx().filesSaveUrl({
            path: '',
            url: '',
        }).then((data: DropboxResponse<files.SaveUrlResult>) => {

        })
        .catch((err: Error) => {
            throw err;
        });
    }

    public uploadUrlStatus(jobId: async.AsyncJobId) {
        return this.ctx().filesSaveUrlCheckJobStatus({
            async_job_id: jobId
        }).then((data: DropboxResponse<files.SaveUrlJobStatus>) => {

        })
        .catch((err: Error) => {
            throw err;
        });
    }



    public downloadFile(sharedLink: string) {
        this.ctx().sharingGetSharedLinkFile({ url: sharedLink })
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
        this.ctx().filesCreateFolderV2({ path })
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
        return this.ctx().filesDeleteV2({ path })
            .then((data: any) => {

            })
            .catch((err: Error) => {
                throw err;
            });
    }

    private ctx() {
        return new Dropbox({ accessToken: process.env.DROP_KEY }) // refreshToken
    }
}

export default new DropBox();