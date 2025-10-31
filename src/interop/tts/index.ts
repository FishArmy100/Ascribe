import { invoke } from "@tauri-apps/api/core"
import { ChapterId } from "../bible"
import { listen, UnlistenFn } from "@tauri-apps/api/event"

export type PassageAudioKey = {
    bible: string,
    chapter: ChapterId,
    verse_range: [number, number] | null,
}

export type TtsRequest = {
    id: string,
    generating: boolean,
}

export type TtsSettings = {
    volume: number,
    playback_speed: number,
}

export async function backend_request_tts(key: PassageAudioKey): Promise<TtsRequest>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "request",
            key
        }
    }).then(s => {
        return JSON.parse(s);
    });
}

export async function backend_set_tts_id(id: string): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "set",
            id
        }
    }).then(_ => {})
}

export async function backend_play_tts(): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "play"
        }
    }).then(_ => {})
}

export async function backend_pause_tts(): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "pause"
        }
    }).then(_ => {})
}

export async function backend_stop_tts(): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "stop"
        }
    }).then(_ => {})
}

export async function backend_get_tts_is_playing(): Promise<boolean>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "get_is_playing"
        }
    }).then(v => JSON.parse(v))
}

export async function backend_set_tts_time(time: number): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "set_time",
            time
        }
    }).then(_ => {})
}

export async function backend_get_tts_duration(): Promise<number>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "get_duration"
        }
    }).then(v => JSON.parse(v))
}

export async function backend_get_tts_settings(): Promise<TtsSettings>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "get_settings"
        }
    }).then(v => JSON.parse(v))
}

export async function backend_set_tts_settings(settings: TtsSettings): Promise<void>
{
    return invoke<string>("run_tts_command", {
        command: {
            type: "set_settings",
            settings
        }
    }).then(_ => {})
}

export type TtsGenerationProgressEvent =
{
    id: string,
    progress: number,
}

export type TtsGeneratedEvent = {
    id: string,
}

export type TtsSetEvent = {
    id: string
}

export type TtsPlayedEvent = {
    id: string 
}

export type TtsPlayingEvent = {
    id: string,
    elapsed: number,
    duration: number,
    verse_index: number | null,
}

export type TtsPausedEvent = {
    id: string 
}

export type TtsStoppedEvent = {
    id: string,
}

export type TtsEvent = {
    type: "generated" | "set" | "played" | "playing" | "paused" | "stopped" | "finished" | "generation_progress",
    data: TtsGeneratedEvent | TtsSetEvent | TtsPlayedEvent | TtsPlayingEvent | TtsPausedEvent | TtsStoppedEvent | TtsGenerationProgressEvent,
}

export type TtsFrontendEvent = {
    type: "generating" | "ready" | "playing" | "finished" | "generation_progress",
    data: TtsPlayingEvent | TtsGenerationProgressEvent | null,
}

export async function listen_tts_event(callback: (e: TtsEvent) => void): Promise<UnlistenFn>
{
    return listen<TtsEvent>("tts_event", e => {
        callback(e.payload);
    })
}

export class TtsPlayer
{
    private playing_id: string | null = null;
    private ready: boolean = false;
    private finished: boolean = false;
    private callback: (e: TtsFrontendEvent) => void;

    public constructor(callback: (e: TtsFrontendEvent) => void) 
    {
        this.callback = callback;
        listen_tts_event(e => this.on_event(e));
    }

    public async request(text: PassageAudioKey)
    {
        let request = await backend_request_tts(text);
        this.playing_id = request.id;
        this.ready = !request.generating; // if we are generating, we are not ready
        if(this.ready)
        {
            backend_set_tts_id(this.playing_id);
        }
        else 
        {
            this.callback({
                type: "generating",
                data: null,
            });
        }
    }

    public is_ready(): boolean
    {
        return this.ready;
    }

    public is_finished(): boolean
    {
        return this.finished;
    }

    public async get_settings(): Promise<TtsSettings>
    {
        return await backend_get_tts_settings();
    }

    public async set_settings(settings: TtsSettings): Promise<void>
    {
        return await backend_set_tts_settings(settings);
    }

    public async play()
    {
        if (this.ready)
        {
            this.finished = false;
            return await backend_play_tts();
        }
        else 
        {
            console.error('error: player not ready');
        }
    }

    public async pause()
    {
        if (this.ready)
        {
            return await backend_pause_tts();
        }
        else 
        {
            console.error('error: player not ready');
        }
    }

    public async stop()
    {
        if (this.ready)
        {
            this.ready = false;
            this.playing_id = null;
            return await backend_stop_tts();
        }
        else 
        {
            console.error('error: player not ready');
        }
    }

    public async is_playing(): Promise<boolean>
    {
        return await backend_get_tts_is_playing();
    }

    public async get_duration(): Promise<number>
    {
        let duration = await backend_get_tts_duration();

        if(!duration) return 0;

        return duration;
    }

    public async set_time(time: number)
    {
        if(this.ready)
        {
            time = Math.clamp(0, 1, time);
            backend_set_tts_time(time)
        }
        else 
        {
            console.error('error: player not ready');
        }
    }

    private on_event(e: TtsEvent)
    {
        switch(e.type)
        {
            case "generation_progress": {
                let data = e.data as TtsGenerationProgressEvent;
                if(data.id == this.playing_id)
                {
                    this.callback({
                        type: "generation_progress",
                        data: data
                    });
                }
                break;
            }
            case "generated": {
                let data = e.data as TtsGeneratedEvent;
                // console.error(`got here, ${this.playing_id} == ${e.payload.data.id}`);
                if(data.id == this.playing_id)
                {
                    this.ready = true;
                    backend_set_tts_id(data.id); // this will set off the 'set' event when finished
                }
                break;
            }
            case "set": {
                this.callback({
                    type: "ready",
                    data: null,
                })
                break;
            }
            case "played": {
                break;
            }
            case "playing": {
                this.callback({
                    type: 'playing',
                    data: e.data as TtsPlayingEvent
                })
                break;
            }
            case "paused": {
                break;
            }
            case "stopped": {
                break;
            }
            case "finished": {
                this.finished = true;
                this.callback({
                    type: 'finished',
                    data: null,
                })
                break;
            }
        }
    }
}

