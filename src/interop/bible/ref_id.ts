import { VerseId } from ".";
import { OsisBook } from "./book";

export type RefId = {
    bible: string | null,
    id: RefIdInner,
}

export type RefIdInner = 
    | { type: "single", atom: Atom }
    | { type: "range", from: Atom, to: Atom, }

export type Atom = 
    | { type: "book", book: OsisBook }
    | { type: "chapter", book: OsisBook, chapter: number }
    | { type: "verse", book: OsisBook, chapter: number, verse: number }
    | { type: "word", book: OsisBook, chapter: number, verse: number, word: number }

export function pretty_print_atom(atom: Atom, namer?: (book: OsisBook) => string): string 
{
    namer = namer ?? (b => b)
    let book = namer(atom.book);
    if (atom.type === "book")
    {
        return book;
    }
    else if (atom.type === "chapter")
    {
        return `${book} ${atom.chapter}`;
    }
    else if (atom.type === "verse")
    {
        return `${book} ${atom.chapter}:${atom.verse}`
    }
    else 
    {
        return `${book} ${atom.chapter}:${atom.verse}#${atom.word}`
    }
}

export function pretty_print_ref_id(id: RefId, namer: (book: OsisBook) => string): string 
{
    let bible = id.bible ? ` ${id.bible}` : "";
    if (id.id.type === "single")
    {
        let atom = pretty_print_atom(id.id.atom, namer);
        return `${atom}${bible}`
    }
    else 
    {
        let from = pretty_print_atom(id.id.from, namer);
        let to = pretty_print_atom(id.id.to, namer);
        return `${from}-${to}${bible}`;
    }
}

export function get_first_verse(id: RefId): VerseId
{
    let atom = undefined;
    if (id.id.type === "range")
    {
        atom = id.id.from;
    }
    else 
    {
        atom = id.id.atom;
    }

    if (atom.type === "book")
    {
        return {
            book: atom.book,
            chapter: 1,
            verse: 1,
        }
    }
    else if (atom.type === "chapter")
    {
        return {
            book: atom.book,
            chapter: atom.chapter,
            verse: 1,
        }
    }
    else
    {
        return {
            book: atom.book,
            chapter: atom.chapter,
            verse: atom.verse,
        }
    }
}