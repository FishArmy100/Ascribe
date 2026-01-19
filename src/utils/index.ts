import { useMemo } from "react";
import rfdc from "rfdc";

export function* range(start: number, end: number): Generator<number>
{
    for(let i = start; i < end; i++)
    {
        yield i;
    }
}

export function range_array(start: number, end: number): number[]
{
    return Array.from(range(start, end));
}

export function* range_inclusive(start: number, end: number): Generator<number>
{
    for(let i = start; i <= end; i++)
    {
        yield i;
    }
}

export function range_inclusive_array(start: number, end: number): number[]
{
    return Array.from(range_inclusive(start, end));
}

export function shorten_string(s: string, max_len: number)
{
    if (s.length > max_len)
    {
        return s.substring(0, max_len - 3) + "..."
    }
    else 
    {
        return s;
    }
}

export function pretty_print_json(obj: any, indent: number = 2): string {
    try 
    {
        return JSON.stringify(obj, null, indent);
    } 
    catch (error) 
    {
        console.error("Failed to stringify object:", error);
        return "";
    }
}

export function use_deep_copy(): <T>(input: T) => T 
{
    return useMemo(() => rfdc(), [])
}

/**
 * Normalizes, and checks to see if each string part of the term is contained in the searched
 * @param term The string being used for searching
 * @param searched The string being searched
 * @returns 
 */
export function search_string(term: string, searched: string): boolean
{
    const term_parts = normalize_string(term).split(/\s/).sort((a, b) => a.length - b.length);
    const searched_parts = normalize_string(searched).split(/\s/).sort((a, b) => a.length - b.length);

    for (const part of term_parts) 
    {
        let found = searched_parts.find(s => s.startsWith(part));
        if (found === undefined)
        {
            return false;
        }
        else 
        {
            searched_parts.remove(found);
        }
    }

    return true;
}

export function normalize_string(str: string): string 
{
    return str
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();
}

