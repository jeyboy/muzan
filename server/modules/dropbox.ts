import {Dropbox, DropboxResponse} from "dropbox";
import * as fs from "node:fs";
import path from "path";
import {files} from "dropbox/types/dropbox_types";

class DropBox {
    public spaceLeft() {

    }

    public list() {
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

    // filesListFolder
    // filesListFolderContinue

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

    public createFolder() {

    }

    private ctx() {
        return new Dropbox({ accessToken: process.env.DROP_KEY })
    }
}

export default new DropBox();