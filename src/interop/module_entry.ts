import { invoke } from "@tauri-apps/api/core"
import { VerseId } from "./bible"
import { RefId } from "./bible/ref_id"
import { StrongsNumber } from "./bible/strongs"
import { HtmlText } from "./html_text"

export type ReferenceData = {
    preview_text: string,
    id: RefId,
}

export type StrongsWord = {
    strongs: StrongsNumber[],
    primary: StrongsNumber | null,
    start: number,
    end: number | null,
}

export type ModuleEntry = 
|{  
    type: "strongs_def",
    module: string,
    id: number,

    word: string,
    definition: HtmlText
}
|{  
    type: "strongs_link",
    module: string,
    id: number,
    
    verse_id: VerseId,
    words: StrongsWord[],
}
|{  
    type: "commentary",
    module: string,
    id: number,
    
    references: RefId[],
    comment: HtmlText,
}
|{  
    type: "dictionary",
    module: string,
    id: number,
    
    aliases: string[] | null,
    definition: HtmlText,
}
|{  
    type: "xref_directed",
    module: string,
    id: number,

    source: RefId,
    targets: ReferenceData[],
    note: HtmlText | null,
}
|{  
    type: "xref_mutual",
    module: string,
    id: number,

    refs: ReferenceData[],
    note: HtmlText | null,
}
|{  
    type: "notebook_note",
    module: string,
    id: number,

    name: string | null,
    content: HtmlText,
    references: RefId[],
}
|{  
    type: "notebook_highlight",
    module: string,
    id: number,

    description: HtmlText | null,
    priority: number,
    color: string,
    references: RefId[],
}|{
    type: "readings",
    module: string,
    id: number,

    index: number,
    readings: RefId[],
}

export async function fetch_backend_word_entries(bible: string, verse: VerseId, word: number): Promise<ModuleEntry[]>
{
    return await invoke<string>("run_bible_command", {
        command: {
            type: "fetch_word_entries",
            verse: verse,
            word: word,
            bible: bible,
        }
    }).then(s => {
        return JSON.parse(s);
    })
}