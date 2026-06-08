import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import { use_voices } from "@components/providers/TtsVoiceProvider";
import { __tv } from "@fisharmy100/react-auto-i18n";
import { ChapterId, OsisBook } from "@interop/bible";
import { useCallback } from "react";

const GOSPELS: OsisBook[] = [ "Matt", "Mark", "Luke", "John" ]

const NAMER_MAP: Partial<Record<string, (book_id: OsisBook, book: string, chapter: number) => string>> = {
    "eng": (book_id, book, chapter) => {
        if (GOSPELS.includes(book_id) && chapter === 1)
        {
            return `The Gospel of ${book} chapter ${chapter}`
        }
        else if (chapter === 1)
        {
            return `The Book of ${book} chapter ${chapter}`
        }
        else 
        {
            return `${book} chapter ${chapter}`
        }
    },
    "spa": (book_id, book, chapter) => {
        if (GOSPELS.includes(book_id) && chapter === 1)
        {
            return `El Evangelio de ${book} capítulo ${chapter}`
        }
        else if (chapter === 1)
        {
            return `El Libro de ${book} capítulo ${chapter}`
        }
        else 
        {
            return `${book} capítulo ${chapter}`
        }
    },
    "swa": (book_id, book, chapter) => {
        if (GOSPELS.includes(book_id) && chapter === 1)
        {
            return `Injili ya ${book} sura ${chapter}`
        }
        else if (chapter === 1)
        {
            return `Kitabu cha ${book} sura ${chapter}`
        }
        else 
        {
            return `${book} sura ${chapter}`
        }
    }
}

export function use_audio_section_labeler(): (voice_id: string, bible_id: string, chapter: ChapterId) => string 
{
    const { bible_infos } = use_bible_infos();
    const { voices } = use_voices()
    const i18n = use_app_i18n();

    return useCallback((voice_id: string, bible_id: string, section: ChapterId): string => {
        const book_id = section.book;
        const book = bible_infos[bible_id].books
            .find(b => b.osis_book === section.book)!
            .name;

        const chapter = section.chapter;

        const language = voices[voice_id]?.language?.alpha_3 ?? "";
        const namer = NAMER_MAP[language];
        console.log(language);
        if (namer)
        {
            return namer(book_id, book, chapter);
        }
        else 
        {
            return `${book} ${chapter}`;
        }

    }, [i18n, bible_infos])
}