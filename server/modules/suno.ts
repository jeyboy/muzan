import axios, { type AxiosInstance } from 'axios';
import UserAgent from 'user-agents';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { sleep } from "../utils/utils";

// https://github.com/gcui-art/suno-api?tab=readme-ov-file

export const DEFAULT_MODEL = 'chirp-v3-5';

export interface AudioIndex {
    clips: AudioInfo[];
    total: number;
}

export interface AudioInfo {
    id: string; // Unique identifier for the audio
    title?: string; // Title of the audio
    image_url?: string; // URL of the image associated with the audio
    lyric?: string; // Lyrics of the audio
    audio_url?: string; // URL of the audio file
    video_url?: string; // URL of the video associated with the audio
    created_at: string; // Date and time when the audio was created
    model_name: string; // Name of the model used for audio generation
    gpt_description_prompt?: string; // Prompt for GPT description
    prompt?: string; // Prompt for audio generation
    status: string; // Status
    type?: string;
    tags?: string; // Genre of music.
    negative_tags?: string; // Negative tags of music.
    duration?: string; // Duration of the audio
    error_message?: string; // Error message if any
}

class SunoApi {
    private static BASE_URL: string = 'https://studio-api.prod.suno.com';
    private static CLERK_BASE_URL: string = 'https://clerk.suno.com';
    private static JSDELIVR_BASE_URL: string = 'https://data.jsdelivr.com';

    private readonly client: AxiosInstance;
    private clerkVersion?: string;
    private sid?: string;
    private currentToken?: string;

    constructor(cookie: string) {
        const cookieJar = new CookieJar();
        const randomUserAgent = new UserAgent(/Chrome/).random().toString();
        this.client = wrapper(
            axios.create({
                jar: cookieJar,
                withCredentials: true,
                headers: {
                    'User-Agent': randomUserAgent,
                    Cookie: cookie
                }
            })
        );
        this.client.interceptors.request.use((config) => {
            if (this.currentToken) {
                // Use the current token status
                config.headers['Authorization'] = `Bearer ${this.currentToken}`;
            }
            return config;
        });
    }

    public async init(): Promise<SunoApi> {
        await this.getClerkLatestVersion();
        await this.getAuthToken();
        await this.keepAlive();
        return this;
    }

    /** Get the clerk package latest version id. */
    private async getClerkLatestVersion() {
        // URL to get clerk version ID
        const getClerkVersionUrl = `${SunoApi.JSDELIVR_BASE_URL}/v1/package/npm/@clerk/clerk-js`;
        // Get clerk version ID
        const versionListResponse = await this.client.get(getClerkVersionUrl);
        if (!versionListResponse?.data?.['tags']['latest']) {
            throw new Error(
                'Failed to get clerk version info, Please try again later'
            );
        }
        // Save clerk version ID for auth
        this.clerkVersion = versionListResponse?.data?.['tags']['latest'];
    }

    /** Get the session ID and save it for later use. */
    private async getAuthToken() {
        // URL to get session ID
        const getSessionUrl = `${SunoApi.CLERK_BASE_URL}/v1/client?_clerk_js_version=${this.clerkVersion}`;
        // Get session ID
        const sessionResponse = await this.client.get(getSessionUrl);
        if (!sessionResponse?.data?.response?.['last_active_session_id']) {
            throw new Error(
                'Failed to get session id, you may need to update the SUNO_COOKIE'
            );
        }
        // Save session ID for later use
        this.sid = sessionResponse.data.response['last_active_session_id'];
    }

    /** Keep the session alive.
     * @param isWait Indicates if the method should wait for the session to be fully renewed before returning.
     */
    public async keepAlive(isWait?: boolean): Promise<void> {
        if (!this.sid) {
            throw new Error('Session ID is not set. Cannot renew token.');
        }
        // URL to renew session token
        const renewUrl = `${SunoApi.CLERK_BASE_URL}/v1/client/sessions/${this.sid}/tokens?_clerk_js_version==${this.clerkVersion}`;
        // Renew session token
        const renewResponse = await this.client.post(renewUrl);
        console.info('KeepAlive...\n');
        if (isWait) {
            await sleep(1, 2);
        }
        const newToken = renewResponse.data['jwt'];
        // Update Authorization field in request header with the new JWT token
        this.currentToken = newToken;
    }

    /** Generate a song based on the prompt.
     * @param prompt The text prompt to generate audio from.
     * @param make_instrumental Indicates if the generated audio should be instrumental.
     * @param model
     * @param wait_audio Indicates if the method should wait for the audio file to be fully generated before returning.
     * @returns
     */
    public async generate(
        prompt: string,
        make_instrumental: boolean = false,
        model?: string,
        wait_audio: boolean = false
    ): Promise<AudioInfo[]> {
        await this.keepAlive(false);

        const startTime = Date.now();
        const audios = this.generateSongs(
            prompt,
            false,
            undefined,
            undefined,
            make_instrumental,
            model,
            wait_audio
        );
        const costTime = Date.now() - startTime;
        console.info('Generate Response:\n' + JSON.stringify(audios, null, 2));
        console.info('Cost time: ' + costTime);
        return audios;
    }

    /** Calls the concatenate endpoint for a clip to generate the whole song.
     * @param clip_id The ID of the audio clip to concatenate.
     * @returns A promise that resolves to an AudioInfo object representing the concatenated audio.
     * @throws Error if the response status is not 200.
     */
    public async concatenate(clip_id: string): Promise<AudioInfo> {
        await this.keepAlive(false);
        const payload: any = { clip_id: clip_id };

        const response = await this.client.post(
            `${SunoApi.BASE_URL}/api/generate/concat/v2/`,
            payload,
            {
                timeout: 10000 // 10 seconds timeout
            }
        );
        if (response.status !== 200) {
            throw new Error('Error response:' + response.statusText);
        }
        return response.data;
    }

    /** Generates custom audio based on provided parameters.
     * @param prompt The text prompt to generate audio from.
     * @param tags Tags to categorize the generated audio.
     * @param title The title for the generated audio.
     * @param make_instrumental Indicates if the generated audio should be instrumental.
     * @param model
     * @param wait_audio Indicates if the method should wait for the audio file to be fully generated before returning.
     * @param negative_tags Negative tags that should not be included in the generated audio.
     * @returns A promise that resolves to an array of AudioInfo objects representing the generated audios.
     */
    public async customGenerate(
        prompt: string,
        tags: string,
        title: string,
        make_instrumental: boolean = false,
        model?: string,
        wait_audio: boolean = false,
        negative_tags?: string
    ): Promise<AudioInfo[]> {
        const startTime = Date.now();
        const audios = await this.generateSongs(
            prompt,
            true,
            tags,
            title,
            make_instrumental,
            model,
            wait_audio,
            negative_tags
        );
        const costTime = Date.now() - startTime;
        console.info(
            'Custom Generate Response:\n' + JSON.stringify(audios, null, 2)
        );
        console.info('Cost time: ' + costTime);
        return audios;
    }

    /** Generates songs based on the provided parameters.
     * @param prompt The text prompt to generate songs from.
     * @param isCustom Indicates if the generation should consider custom parameters like tags and title.
     * @param tags Optional tags to categorize the song, used only if isCustom is true.
     * @param title Optional title for the song, used only if isCustom is true.
     * @param make_instrumental Indicates if the generated song should be instrumental.
     * @param model
     * @param wait_audio Indicates if the method should wait for the audio file to be fully generated before returning.
     * @param negative_tags Negative tags that should not be included in the generated audio.
     * @returns A promise that resolves to an array of AudioInfo objects representing the generated songs.
     */
    private async generateSongs(
        prompt: string,
        isCustom: boolean,
        tags?: string,
        title?: string,
        make_instrumental?: boolean,
        model?: string,
        wait_audio: boolean = false,
        negative_tags?: string
    ): Promise<AudioInfo[]> {
        await this.keepAlive(false);
        const payload: any = {
            make_instrumental: make_instrumental == true,
            mv: model || DEFAULT_MODEL,
            prompt: ''
        };
        if (isCustom) {
            payload.tags = tags;
            payload.title = title;
            payload.negative_tags = negative_tags;
            payload.prompt = prompt;
        } else {
            payload.gpt_description_prompt = prompt;
        }
        console.info(
            'generateSongs payload:\n' +
            JSON.stringify(
                {
                    prompt: prompt,
                    isCustom: isCustom,
                    tags: tags,
                    title: title,
                    make_instrumental: make_instrumental,
                    wait_audio: wait_audio,
                    negative_tags: negative_tags,
                    payload: payload
                },
                null,
                2
            )
        );
        const response = await this.client.post(
            `${SunoApi.BASE_URL}/api/generate/v2/`,
            payload,
            {
                timeout: 10000 // 10 seconds timeout
            }
        );
        console.info(
            'generateSongs Response:\n' + JSON.stringify(response.data, null, 2)
        );
        if (response.status !== 200) {
            throw new Error('Error response:' + response.statusText);
        }
        const songIds = response.data['clips'].map((audio: any) => audio.id);
        //Want to wait for music file generation
        if (wait_audio) {
            const startTime = Date.now();
            let lastResponse: AudioInfo[] = [];
            await sleep(5, 5);
            while (Date.now() - startTime < 100000) {
                const response = await this.get(songIds);
                const allCompleted = response.every(
                    (audio) => audio.status === 'streaming' || audio.status === 'complete'
                );
                const allError = response.every((audio) => audio.status === 'error');
                if (allCompleted || allError) {
                    return response;
                }
                lastResponse = response;
                await sleep(3, 6);
                await this.keepAlive(true);
            }
            return lastResponse;
        } else {
            await this.keepAlive(true);
            return response.data['clips'].map((audio: any) => ({
                id: audio.id,
                title: audio.title,
                image_url: audio.image_url,
                lyric: audio.metadata.prompt,
                audio_url: audio.audio_url,
                video_url: audio.video_url,
                created_at: audio.created_at,
                model_name: audio.model_name,
                status: audio.status,
                gpt_description_prompt: audio.metadata.gpt_description_prompt,
                prompt: audio.metadata.prompt,
                type: audio.metadata.type,
                tags: audio.metadata.tags,
                negative_tags: audio.metadata.negative_tags,
                duration: audio.metadata.duration
            }));
        }
    }

    /** Generates lyrics based on a given prompt.
     * @param prompt The prompt for generating lyrics.
     * @returns The generated lyrics text.
     */
    public async generateLyrics(prompt: string): Promise<string> {
        await this.keepAlive(false);

        let attempts = 100;
        const url = `${SunoApi.BASE_URL}/api/generate/lyrics/`;

        // Initiate lyrics generation
        const generateResponse = await this.client.post(
            url,
            { prompt }
        );
        const generateId = generateResponse.data.id;

        // Poll for lyrics completion
        let lyricsResponse = await this.client.get(
            `${url}${generateId}`
        );


        while (lyricsResponse?.data?.status !== 'complete' && (attempts -= 1) > 0) {
            await sleep(2); // Wait for 2 seconds before polling again
            lyricsResponse = await this.client.get(
                `${url}${generateId}`
            );
        }

        // Return the generated lyrics text
        return lyricsResponse.data;
    }

    /** Extends an existing audio clip by generating additional content based on the provided prompt.
     * @param audioId The ID of the audio clip to extend.
     * @param prompt The prompt for generating additional content.
     * @param continueAt Extend a new clip from a song at mm:ss(e.g. 00:30). Default extends from the end of the song.
     * @param tags Style of Music.
     * @param title Title of the song.
     * @param model
     * @returns A promise that resolves to an AudioInfo object representing the extended audio clip.
     */
    public async extendAudio(
        audioId: string,
        prompt: string = '',
        continueAt: string = '0',
        tags: string = '',
        title: string = '',
        model?: string
    ): Promise<AudioInfo> {
        const response = await this.client.post(
            `${SunoApi.BASE_URL}/api/generate/v2/`,
            {
                continue_clip_id: audioId,
                continue_at: continueAt,
                mv: model || DEFAULT_MODEL,
                prompt: prompt,
                tags: tags,
                title: title
            }
        );
        console.log('response：\n', response);
        return response.data;
    }

    /** Processes the lyrics (prompt) from the audio metadata into a more readable format.
     * @param prompt The original lyrics text.
     * @returns The processed lyrics text.
     */
    private parseLyrics(prompt: string): string {
        // Assuming the original lyrics are separated by a specific delimiter (e.g., newline), we can convert it into a more readable format.
        // The implementation here can be adjusted according to the actual lyrics format.
        // For example, if the lyrics exist as continuous text, it might be necessary to split them based on specific markers (such as periods, commas, etc.).
        // The following implementation assumes that the lyrics are already separated by newlines.

        // Split the lyrics using newline and ensure to remove empty lines.
        const lines = prompt.split('\n').filter((line) => line.trim() !== '');

        // Reassemble the processed lyrics lines into a single string, separated by newlines between each line.
        // Additional formatting logic can be added here, such as adding specific markers or handling special lines.
        return lines.join('\n');
    }


    /** Retrieves audio information from the user library.
     * @param page An optional page number to retrieve audio information from.
     * @returns A promise that resolves to an array of AudioInfo objects.
     */
    public async getV2(
        page?: string | null
    ): Promise<AudioIndex> {
        await this.keepAlive(false);

        let url = new URL(`${SunoApi.BASE_URL}/api/feed/v2`);
        if (page) {
            url.searchParams.append('page', page);
        }

        console.info('Get audio status: ' + url.href);
        const response = await this.client.get(url.href, {
            // 3 seconds timeout
            timeout: 3000
        });

        const data = response.data;

        const clips = data.clips.map((audio: any) => ({
            id: audio.id,
            title: audio.title,
            image_url: audio.image_url,
            lyric: audio.metadata.prompt
                ? this.parseLyrics(audio.metadata.prompt)
                : '',
            audio_url: audio.audio_url,
            video_url: audio.video_url,
            created_at: audio.created_at,
            model_name: audio.model_name,
            status: audio.status,
            gpt_description_prompt: audio.metadata.gpt_description_prompt,
            prompt: audio.metadata.prompt,
            type: audio.metadata.type,
            tags: audio.metadata.tags,
            duration: audio.metadata.duration,
            error_message: audio.metadata.error_message
        }));

        return {
            clips,
            total: data.num_total_results
        }
    }


    /** Retrieves audio information for the given song IDs.
     * @param songIds An optional array of song IDs to retrieve information for.
     * @param page An optional page number to retrieve audio information from.
     * @returns A promise that resolves to an array of AudioInfo objects.
     */
    public async get(
        songIds?: string[],
        page?: string | null
    ): Promise<AudioInfo[]> {
        await this.keepAlive(false);

        let url = new URL(`${SunoApi.BASE_URL}/api/feed/`);
        if (songIds) {
            url.searchParams.append('ids', songIds.join(','));
        }
        if (page) {
            url.searchParams.append('page', page);
        }
        console.info('Get audio status: ' + url.href);
        const response = await this.client.get(url.href, {
            // 3 seconds timeout
            timeout: 3000
        });

        const audios = response.data;

        return audios.map((audio: any) => ({
            id: audio.id,
            title: audio.title,
            image_url: audio.image_url,
            lyric: audio.metadata.prompt
                ? this.parseLyrics(audio.metadata.prompt)
                : '',
            audio_url: audio.audio_url,
            video_url: audio.video_url,
            created_at: audio.created_at,
            model_name: audio.model_name,
            status: audio.status,
            gpt_description_prompt: audio.metadata.gpt_description_prompt,
            prompt: audio.metadata.prompt,
            type: audio.metadata.type,
            tags: audio.metadata.tags,
            duration: audio.metadata.duration,
            error_message: audio.metadata.error_message
        }));
    }

    /** Retrieves information for a specific audio clip.
     * @param clipId The ID of the audio clip to retrieve information for.
     * @returns A promise that resolves to an object containing the audio clip information.
     */
    public async getClip(clipId: string): Promise<object> {
        await this.keepAlive(false);
        const response = await this.client.get(
            `${SunoApi.BASE_URL}/api/clip/${clipId}`
        );
        return response.data;
    }

    public async removeClip(clipId: string): Promise<void> {
        await this.keepAlive(false);
        const response = await this.client.post(
            `${SunoApi.BASE_URL}/api/clip/${clipId}`,

        );
        return response.data;


//         curl 'https://studio-api.prod.suno.com/api/gen/trash/' \
// -X 'POST' \
// -H 'Content-Type: text/plain;charset=UTF-8' \
// -H 'Pragma: no-cache' \
// -H 'Accept: */*' \
// -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MzIyMjg4OTYsImZ2YSI6Wy0xLC0xXSwiaHR0cHM6Ly9zdW5vLmFpL2NsYWltcy9jbGVya19pZCI6InVzZXJfMmdQWmRuTHBBTFdPVng0enZKTkJ0UXptWWV5IiwiaHR0cHM6Ly9zdW5vLmFpL2NsYWltcy9lbWFpbCI6ImVib3lrb0BnbGVuZmxvdy5jb20iLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL3Bob25lIjpudWxsLCJpYXQiOjE3MzIyMjg4MzYsImlzcyI6Imh0dHBzOi8vY2xlcmsuc3Vuby5jb20iLCJqdGkiOiJkNzcyYzE4YWMxZmVmOTg3MWMzNSIsIm5iZiI6MTczMjIyODgyNiwic2lkIjoic2Vzc18ybmN4dnBwVGV4TE1xNkQ4VlBQR1RPZGlrY1QiLCJzdWIiOiJ1c2VyXzJnUFpkbkxwQUxXT1Z4NHp2Sk5CdFF6bVlleSJ9.CfIiHYI-jcUaeahRDF_WZqNwjy16vr_5J5L4ChZxSUR1d_-NX6wMfKx9vjUWH-NBxuf48CBMLzCpWZp-zmaIOJQEz5-PwN2ORchJeEowhinr2LALQS7oqV8AVkvH_eCW7EmsevzYFkbBf-R913-BJvXCAaCSA6MmfNo1fQLNfnGoyeWUymS8l81IKbEQF2tYgMLyfFDH_8GLHoLHalNvpPHEhxWBju-dlEUCwfESH59qE1iveUqmYjYw_YuQLYOkjLqPtW2qSNn40BVlDSUJjN0waQ1mi4fPAa7C1IRbX_0_dYRtSf1t0DC9c5KzzWl28oNRUFqhhHKINAidAIJCrg' \
// -H 'Sec-Fetch-Site: same-site' \
// -H 'Accept-Language: en-GB,en;q=0.9' \
// -H 'Cache-Control: no-cache' \
// -H 'Sec-Fetch-Mode: cors' \
// -H 'Accept-Encoding: gzip, deflate, br' \
// -H 'Origin: https://suno.com' \
// -H 'Content-Length: 66' \
// -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Safari/605.1.15' \
// -H 'Referer: https://suno.com/' \
// -H 'Sec-Fetch-Dest: empty' \
// -H 'Priority: u=3, i' \
// -H 'Affiliate-Id: undefined' \
// --data-binary '{"trash":true,"clip_ids":["01648044-803c-4328-8cad-44dff47e6459"]}'

        //POST https://studio-api.prod.suno.com/api/gen/trash/

        // {
        //     "ids": [
        //     "01648044-803c-4328-8cad-44dff47e6459"
        // ],
        //     "is_trashed": true
        // }





//         curl 'https://studio-api.prod.suno.com/api/gen/trash/' \
// -X 'POST' \
// -H 'Content-Type: text/plain;charset=UTF-8' \
// -H 'Pragma: no-cache' \
// -H 'Accept: */*' \
// -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3MzIyMjkzNzgsImZ2YSI6Wy0xLC0xXSwiaHR0cHM6Ly9zdW5vLmFpL2NsYWltcy9jbGVya19pZCI6InVzZXJfMmdQWmRuTHBBTFdPVng0enZKTkJ0UXptWWV5IiwiaHR0cHM6Ly9zdW5vLmFpL2NsYWltcy9lbWFpbCI6ImVib3lrb0BnbGVuZmxvdy5jb20iLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL3Bob25lIjpudWxsLCJpYXQiOjE3MzIyMjkzMTgsImlzcyI6Imh0dHBzOi8vY2xlcmsuc3Vuby5jb20iLCJqdGkiOiJmMDYxN2MyNWQ2MTE3ZjhhZDQ4ZCIsIm5iZiI6MTczMjIyOTMwOCwic2lkIjoic2Vzc18ybmN4dnBwVGV4TE1xNkQ4VlBQR1RPZGlrY1QiLCJzdWIiOiJ1c2VyXzJnUFpkbkxwQUxXT1Z4NHp2Sk5CdFF6bVlleSJ9.vUXqYSeL0D1eaLJggfTsAOAgIgI7OdCpqKnihgHACxA7CrNfADHPs031iJZtMNqnzRXxdxccAE9e538bdvlvVZXXpMISLZOxl3Lp85CU-ZhhN55k26uYRJpp_LFWLg127sVjYCs_3J5t_LPWjhYIVLFqSJdfph7ETLUNdIAKLd3eaCpcKeuYSAa0HvsFJ3Uq39E8Dtu18FdnmqMpAxyuwn6QR2yVnh38fKOMt9O7AIjtI2BqmnrDC9Lc7K48kS4GRbAdLnlbKMSSaGNfKy6EJkqs9lpZzHnv_u1B8HQ66cMWoWrzYdHCZmvlolXKzNqB0vAFiuxtjVFj86PjTQ4dYA' \
// -H 'Sec-Fetch-Site: same-site' \
// -H 'Accept-Language: en-GB,en;q=0.9' \
// -H 'Cache-Control: no-cache' \
// -H 'Sec-Fetch-Mode: cors' \
// -H 'Accept-Encoding: gzip, deflate, br' \
// -H 'Origin: https://suno.com' \
// -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Safari/605.1.15' \
// -H 'Referer: https://suno.com/' \
// -H 'Content-Length: 67' \
// -H 'Sec-Fetch-Dest: empty' \
// -H 'Device-Id: "f8bccf7d-72aa-4bd2-b495-bfe84c05a2d7"' \
// -H 'Priority: u=3, i' \
// -H 'Affiliate-Id: undefined' \
// --data-binary '{"trash":false,"clip_ids":["31ab3cd9-81e4-4727-b0de-0b3983938f8c"]}'
    }

    public async getCredits(): Promise<object> {
        await this.keepAlive(false);
        const response = await this.client.get(
            `${SunoApi.BASE_URL}/api/billing/info/`
        );
        return {
            credits_left: response.data.total_credits_left,
            period: response.data.period,
            monthly_limit: response.data.monthly_limit,
            monthly_usage: response.data.monthly_usage
        };
    }
}

export const newSunoApi = async (cookie: string) => {
    const sunoApi = new SunoApi(cookie);
    return await sunoApi.init();
};

if (!process.env.SUNO_COOKIE) {
    console.log('Environment does not contain SUNO_COOKIE.', process.env);
}

export const sunoApi = newSunoApi(process.env.SUNO_COOKIE || '');