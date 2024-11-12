import {dropboxApi, type DropboxNode} from "../modules/dropbox";
import {Songs} from "../db/connection";
import {CreateSong, type Song} from "../db/interfaces/song";

class DropboxExporter {
    private icoFolder = '/!ico';
    private musicFolder = '/!music';

    public async exportMusic() {
        const res = await dropboxApi.list();
        const newSongs: CreateSong[] = [];

        const music = res[this.musicFolder as keyof DropboxNode];

        for(let k in music) {

        }


        await Songs.insertMany(newSongs, );
    }
}

export const dropboxExporter = new DropboxExporter();