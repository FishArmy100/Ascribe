import { BibleInfo } from ".";

export type OsisBook =
  | "Gen"
  | "Exod"
  | "Lev"
  | "Num"
  | "Deut"
  | "Josh"
  | "Judg"
  | "Ruth"
  | "1Sam"
  | "2Sam"
  | "1Kgs"
  | "2Kgs"
  | "1Chr"
  | "2Chr"
  | "Ezra"
  | "Neh"
  | "Esth"
  | "Job"
  | "Ps"
  | "Prov"
  | "Eccl"
  | "Song"
  | "Isa"
  | "Jer"
  | "Lam"
  | "Ezek"
  | "Dan"
  | "Hos"
  | "Joel"
  | "Amos"
  | "Obad"
  | "Jonah"
  | "Mic"
  | "Nah"
  | "Hab"
  | "Zeph"
  | "Hag"
  | "Zech"
  | "Mal"
  | "Matt"
  | "Mark"
  | "Luke"
  | "John"
  | "Acts"
  | "Rom"
  | "1Cor"
  | "2Cor"
  | "Gal"
  | "Eph"
  | "Phil"
  | "Col"
  | "1Thess"
  | "2Thess"
  | "1Tim"
  | "2Tim"
  | "Titus"
  | "Phlm"
  | "Heb"
  | "Jas"
  | "1Pet"
  | "2Pet"
  | "1John"
  | "2John"
  | "3John"
  | "Jude"
  | "Rev"

export const OSIS_BOOKS: OsisBook[] = [
    "Gen",
    "Exod",
    "Lev",
    "Num",
    "Deut",
    "Josh",
    "Judg",
    "Ruth",
    "1Sam",
    "2Sam",
    "1Kgs",
    "2Kgs",
    "1Chr",
    "2Chr",
    "Ezra",
    "Neh",
    "Esth",
    "Job",
    "Ps",
    "Prov",
    "Eccl",
    "Song",
    "Isa",
    "Jer",
    "Lam",
    "Ezek",
    "Dan",
    "Hos",
    "Joel",
    "Amos",
    "Obad",
    "Jonah",
    "Mic",
    "Nah",
    "Hab",
    "Zeph",
    "Hag",
    "Zech",
    "Mal",
    "Matt",
    "Mark",
    "Luke",
    "John",
    "Acts",
    "Rom",
    "1Cor",
    "2Cor",
    "Gal",
    "Eph",
    "Phil",
    "Col",
    "1Thess",
    "2Thess",
    "1Tim",
    "2Tim",
    "Titus",
    "Phlm",
    "Heb",
    "Jas",
    "1Pet",
    "2Pet",
    "1John",
    "2John",
    "3John",
    "Jude",
    "Rev",
]

export function is_old_testament(book: OsisBook): boolean
{
    return OSIS_BOOKS.indexOf(book) < 39;
}

export function is_new_testament(book: OsisBook): boolean
{
    return !is_old_testament(book);
}

export function get_book_display_name(book: OsisBook, bible: BibleInfo): string 
{
    return bible.books.find(b => b.osis_book === book)?.abbreviation ?? book;
}