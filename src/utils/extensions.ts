declare global
{
    export interface Array<T>
    {
        group_py<R>(f: (e: T) => R): [R, T[]][];
        remove_at(index: number): T;
        remove(value: T): boolean;
    }
} 

Array.prototype.group_py = function<T, R>(this: T[], p: (v: T) => R): [R, T[]][] {
    let ret = new Map<R, T[] | undefined>();
    this.forEach(v => {
        let key = p(v);
        if (!ret.has(key))
            ret.set(key, []);

        ret.get(key)!.push(v);
    })
    
    return Array.from(ret.entries()) as any;
}

Array.prototype.remove_at = function<T>(index: number): T | undefined
{
    if (index > -1 && index < this.length) 
    {
        let element = this[index];
        this.splice(index, 1);
        return element
    }

    return undefined;
}

Array.prototype.remove = function<T>(value: T): T | undefined
{
    let index = this.indexOf(value);
    if(index === -1)
    {
        return undefined;
    }

    return this.remove_at(index);
}

declare global {
    interface Math {
        lerp(min: number, max: number, v: number): number;
        clamp(min: number, max: number, v: number): number;
        inv_lerp(min: number, max: number, v: number): number;
        approx_eq(a: number, b: number, epsilon?: number): boolean;
    }
}

Math.lerp = (min: number, max: number, v: number): number => {
    let diff = max - min;
    return min + diff * Math.clamp(0, 1, v);
}

Math.clamp = (min: number, max: number, v: number): number => {
    if (v > max) return max;
    if (v < min) return min;
    return v;
}

Math.inv_lerp = (min: number, max: number, v: number): number => {
    v = Math.clamp(min, max, v);
    return (v - min) / (max - min);
}

Math.approx_eq = (a: number, b: number, epsilon?: number): boolean => {
    return Math.abs(a - b) < (epsilon ?? 0.01);
}

export {}