import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { VerseId } from ".";
import { OsisBook } from "./book";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";

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


export type RefIdFormatter = (id: RefId, bible: string | null) => string;

export function use_format_ref_id(): (id: RefId, bible: string | null) => string 
{
    const { get_bible_display_name, get_book_display_name } = use_bible_infos();
    const { bible_version_state } = use_bible_display_settings();

    return (id: RefId, bible: string | null): string => {
        const display_bible_id = id.bible ?? bible ?? bible_version_state.bible_version;
        const inner = format_ref_id_inner(id.id, b => get_book_display_name(display_bible_id, b));
        if (id.bible)
        {
            return `${inner} (${get_bible_display_name(id.bible)})`
        }
        else 
        {
            return inner;
        }
    }
}

function format_ref_id_inner(id: RefIdInner, name_mapper: (osis: OsisBook) => string): string
{
    if (id.type === "range")
    {
        const to = id.to;
        const from = id.from;
        if (to.type === "verse" && from.type === "verse")
        {
            if (to.book === from.book && to.chapter === from.chapter && to.verse !== from.verse)
            {
                return `${name_mapper(to.book)} ${to.chapter}:${from.verse}-${to.verse}`;
            }
        }
        else if (to.type === "chapter" && from.type === "chapter" && to.chapter !== from.chapter)
        {
            if (to.book === from.book)
            {
                return `${name_mapper(to.book)} ${from.chapter}-${to.chapter}`
            }
        }
        
        return `${format_atom(id.from, name_mapper)}-${format_atom(id.to, name_mapper)}`;
    }
    else if (id.type === "single")
    {
        return format_atom(id.atom, name_mapper);
    }
    else
    {
        return "";
    }
}

function format_atom(atom: Atom, name_mapper: (osis: OsisBook) => string): string 
{
    if (atom.type === "book")
    {
        return `${name_mapper(atom.book)}`
    }
    else if (atom.type === "chapter")
    {
        return `${name_mapper(atom.book)} ${atom.chapter}`
    }
    else if (atom.type === "verse")
    {
        return `${name_mapper(atom.book)} ${atom.chapter}:${atom.verse}`
    }
    else if (atom.type === "word")
    {
        return `${name_mapper(atom.book)} ${atom.chapter}:${atom.verse}#${atom.word}`
    }
    else 
    {
        return "";
    }
}

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

