import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import { use_voices } from "@components/providers/TtsVoiceProvider";
import { __tv } from "@fisharmy100/react-auto-i18n";
import { ChapterId, OsisBook } from "@interop/bible";
import { ReaderReading } from "@interop/reader";
import { useCallback } from "react";

const GOSPELS: OsisBook[] = [ "Matt", "Mark", "Luke", "John" ]

const CHAPTER_NAMER_MAP: Partial<Record<string, (book_id: OsisBook, book: string, chapter: number) => string>> = {
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

const VERSE_RANGE_NAMER_MAP: Partial<
    Record<string, (book: string, chapter: number, start: number, end: number) => string>
> = {
    eng: (book, chapter, start, end) =>
    `${book} chapter ${chapter} verses ${start} to ${end}`,

    spa: (book, chapter, start, end) =>
        `${book} capítulo ${chapter} versículos ${start} al ${end}`,

    swa: (book, chapter, start, end) =>
        `${book} sura ya ${chapter} mistari ya ${start} hadi ${end}`,
}

const SINGLE_VERSE_NAMER_MAP: Partial<
    Record<string, (book: string, chapter: number, verse: number) => string>
> = {
    eng: (book, chapter, verse) =>
        `${book} chapter ${chapter} verse ${verse}`,

    spa: (book, chapter, verse) =>
        `${book} capítulo ${chapter} versículo ${verse}`,

    swa: (book, chapter, verse) =>
        `${book} sura ya ${chapter} mstari wa ${verse}`,
};

export function use_audio_section_labeler(): (voice_id: string, reading: ReaderReading) => string 
{
    const { bible_infos } = use_bible_infos();
    const { voices } = use_voices()
    const i18n = use_app_i18n();

    return useCallback((voice_id: string, reading: ReaderReading): string => {
        const book_id = reading.chapter.book;
        const book = bible_infos[reading.bible].books
            .find(b => b.osis_book === reading.chapter.book)!
            .name;
        const chapter = reading.chapter.chapter;

        const language = voices[voice_id]?.language?.alpha_3 ?? "";

        if (reading.type === "verses")
        {
            if (reading.start === reading.end)
            {
                const namer = SINGLE_VERSE_NAMER_MAP[language];
                if (namer)
                {
                    namer(book, chapter, reading.start)
                }
                else 
                {
                    return `${book} ${chapter} ${reading.start}`
                }
            }
            else 
            {
                const namer = VERSE_RANGE_NAMER_MAP[language];
                if (namer)
                {
                    namer(book, chapter, reading.start, reading.end);
                }
                else 
                {
                    return `${book} ${chapter} ${reading.start}-${reading.end}` 
                }
            }
        }

        const namer = CHAPTER_NAMER_MAP[language];
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