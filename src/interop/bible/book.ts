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

export function pretty_print_book(book: OsisBook): string 
{
    switch (book) 
    {
        case "Gen": return "Genesis";
        case "Exod": return "Exodus";
        case "Lev": return "Leviticus";
        case "Num": return "Numbers";
        case "Deut": return "Deuteronomy";
        case "Josh": return "Joshua";
        case "Judg": return "Judges";
        case "Ruth": return "Ruth";
        case "1Sam": return "1 Samuel";
        case "2Sam": return "2 Samuel";
        case "1Kgs": return "1 Kings";
        case "2Kgs": return "2 Kings";
        case "1Chr": return "1 Chronicles";
        case "2Chr": return "2 Chronicles";
        case "Ezra": return "Ezra";
        case "Neh": return "Nehemiah";
        case "Esth": return "Esther";
        case "Job": return "Job";
        case "Ps": return "Psalms";
        case "Prov": return "Proverbs";
        case "Eccl": return "Ecclesiastes";
        case "Song": return "Song of Solomon";
        case "Isa": return "Isaiah";
        case "Jer": return "Jeremiah";
        case "Lam": return "Lamentations";
        case "Ezek": return "Ezekiel";
        case "Dan": return "Daniel";
        case "Hos": return "Hosea";
        case "Joel": return "Joel";
        case "Amos": return "Amos";
        case "Obad": return "Obadiah";
        case "Jonah": return "Jonah";
        case "Mic": return "Micah";
        case "Nah": return "Nahum";
        case "Hab": return "Habakkuk";
        case "Zeph": return "Zephaniah";
        case "Hag": return "Haggai";
        case "Zech": return "Zechariah";
        case "Mal": return "Malachi";
        case "Matt": return "Matthew";
        case "Mark": return "Mark";
        case "Luke": return "Luke";
        case "John": return "John";
        case "Acts": return "Acts";
        case "Rom": return "Romans";
        case "1Cor": return "1 Corinthians";
        case "2Cor": return "2 Corinthians";
        case "Gal": return "Galatians";
        case "Eph": return "Ephesians";
        case "Phil": return "Philippians";
        case "Col": return "Colossians";
        case "1Thess": return "1 Thessalonians";
        case "2Thess": return "2 Thessalonians";
        case "1Tim": return "1 Timothy";
        case "2Tim": return "2 Timothy";
        case "Titus": return "Titus";
        case "Phlm": return "Philemon";
        case "Heb": return "Hebrews";
        case "Jas": return "James";
        case "1Pet": return "1 Peter";
        case "2Pet": return "2 Peter";
        case "1John": return "1 John";
        case "2John": return "2 John";
        case "3John": return "3 John";
        case "Jude": return "Jude";
        case "Rev": return "Revelation";
        default: return book;
    }
}