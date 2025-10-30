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

