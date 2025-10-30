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

export {}