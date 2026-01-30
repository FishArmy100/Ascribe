import { invoke } from "@tauri-apps/api/core";
import { RefId } from "./ref_id";

export type ReadingsDate = {
    year: number,
    month: number,
    day: number,
}

export function to_readings_date(date: Date): ReadingsDate
{
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
    }
}

export async function backend_fetch_reading(module: string, start_date: ReadingsDate, selected_date: ReadingsDate): Promise<RefId[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            module: module,
            start_date: start_date,
            selected_date: selected_date,
        }
    }).then(s => {
        return JSON.parse(s);
    })
}