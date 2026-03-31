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

/**
 * Returns true if `a` comes strictly before `b`.
 */
export function is_date_before(a: ReadingsDate, b: ReadingsDate): boolean {
    if (a.year !== b.year) return a.year < b.year;
    if (a.month !== b.month) return a.month < b.month;
    return a.day < b.day;
}

export async function backend_fetch_reading(module: string, start_date: ReadingsDate, selected_date: ReadingsDate): Promise<RefId[]>
{
    // makes sure backend does not crash
    if (!is_date_before(start_date, selected_date))
    {
        console.error("Error: `start_date` is after `selected_date`", start_date, selected_date);
        return [];
    }

    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_reading",
            module: module,
            start_date: start_date,
            selected_date: selected_date,
        }
    }).then(s => {
        return JSON.parse(s);
    })
}