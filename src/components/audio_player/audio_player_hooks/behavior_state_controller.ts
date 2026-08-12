import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider"
import { use_bible_infos } from "@components/providers/BibleInfoProvider"
import { use_view_history } from "@components/providers/ViewHistoryProvider"
import { BibleInfo } from "@interop/bible"
import { RefIdInner } from "@interop/bible/ref_id"
import { BibleReaderBehavior, ReaderReading } from "@interop/reader"

export type BehaviorState = |{
    behavior: BibleReaderBehavior,
    play_index: number,
    current_reading: ReaderReading | null
}

export type BehaviorStateController = {
    readonly queue: readonly ReaderReading[],

    readonly index: number,
    set_index(index: number): void,

    readonly behavior: BibleReaderBehavior
    set_behavior(behavior: BibleReaderBehavior): void,

    readonly current_reading: ReaderReading | null,
}

export default function use_behavior_state_controller(): BehaviorStateController
{

}


function user_current_section(): RefIdInner
{
    const view_history = use_view_history();

    let inner: RefIdInner | null = null;
    let index = view_history.get_index();
    do 
    {
        const entry = view_history.at(index);
        if (entry.type === "chapter") 
        {
            inner = {
                type: "single",
                atom: {
                    type: "chapter",
                    ...entry.chapter
                }
            };
        }
        else if (entry.type === "verse") 
        {
            inner = {
                type: "range",
                from: {
                    type: "verse",
                    ...entry.chapter,
                    verse: entry.start,
                },
                to: {
                    type: "verse",
                    ...entry.chapter,
                    verse: entry.end ?? entry.start,
                }
            };
        }

        index -= 1;
    }
    while (inner === null && index > 0);

    if (inner === null) 
    {
        inner = {
            type: "single",
            atom: {
                type: "chapter",
                book: "Gen",
                chapter: 1
            }
        }
    }
    
    return inner;
}