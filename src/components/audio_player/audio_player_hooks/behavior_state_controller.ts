import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider"
import { use_bible_infos } from "@components/providers/BibleInfoProvider"
import { use_bible_reader } from "@components/providers/BibleReaderProvider"
import { use_view_history } from "@components/providers/ViewHistoryProvider"
import { contains_chapter, contains_verse, VerseId } from "@interop/bible"
import { RefIdInner } from "@interop/bible/ref_id"
import { BibleReaderBehavior, get_backend_reader_queue, get_reader_behavior_time_data, ReaderQueue, ReaderReading } from "@interop/reader"
import { duration } from "@mui/material"
import { use_deep_copy } from "@utils/index"
import { TimerStatus, use_timer, UseTimerReturn } from "@utils/timer"
import stringify from "fast-json-stable-stringify"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const QUEUE_SIZE = 5;
const KJV_ID = "kjv_eng";

export type BehaviorState = |{
    behavior: BibleReaderBehavior,
    play_index: number,
    current_reading: ReaderReading | null
}

export type TimerData = {
    duration: number,
    elapsed: number,
    status: TimerStatus,

    play(): void,
    pause(): void,
    reset(): void,
}

export type BehaviorStateController = {
    readonly queue: ReaderQueue,

    readonly index: number,
    set_index(index: number): void,

    readonly behavior: BibleReaderBehavior
    set_behavior(behavior: BibleReaderBehavior): void,

    readonly current_reading: ReaderReading,
    readonly reading_behavior_finished: boolean,
    start_reading_behavior(): void,
    readonly timer_data: TimerData | null,
}

export default function use_behavior_state_controller(): BehaviorStateController
{
    const [queue, set_queue] = useState<ReaderQueue>({
        queue: [],
        queue_offset: 0,
        relative_index: 0,
    }); 
    const [index, set_index] = useState(0);
    const [reading_behavior_finished, set_reading_behavior_finished] = useState(false);

    const { reader_behavior, set_reader_behavior, next_reading } = use_bible_reader();
    const { bible_display_settings } = use_bible_display_settings();

    const [current_reading, set_current_reading] = useState<ReaderReading>({
        type: "chapter",
        bible: KJV_ID,
        chapter: {
            book: "Gen",
            chapter: 1,
        }
    });

    const timer_data = use_readings_timer(reader_behavior);

    useEffect(() => {
        let mounted = true;
        
        next_reading(bible_display_settings.bible_version, index, timer_data?.elapsed ?? 0).then(r => {
            if (mounted)
            {
                if (r.type === "none" || r.type === "stop")
                {
                    set_reading_behavior_finished(true);
                    set_index(0);
                }
                else 
                {
                    set_current_reading(r.reading);
                }
            }
        });

        get_backend_reader_queue(bible_display_settings.bible_version, index, QUEUE_SIZE).then(q => {
            if (mounted)
            {
                set_queue(q);
            }
        });

        () => {
            mounted = false;
        };
    }, [stringify(reader_behavior), index]);

    const current_section_reading = use_current_section_reading();
    const deep_copy = use_deep_copy();
    const view_history = use_view_history();
    useEffect(() => {
        if (reader_behavior.type === "current")
        {
            const copy = deep_copy(reader_behavior);
            copy.ref_id = current_section_reading;
            if (stringify(reader_behavior.ref_id) !== stringify(copy.ref_id))
            {
                set_reader_behavior(copy);
            }
        }
    }, [stringify(view_history.get_current()), set_reader_behavior, reader_behavior])

    const set_behavior = useCallback((behavior: BibleReaderBehavior) => {
        set_index(0);
        set_reader_behavior(behavior);
        set_reading_behavior_finished(false);
    }, [set_reader_behavior, set_index]);

    const start_reading_behavior = useCallback(() => {
        set_reading_behavior_finished(false);
        set_index(0);
    }, [])

    return {
        queue,
        index,
        set_index,
        behavior: reader_behavior,
        set_behavior,
        current_reading,
        reading_behavior_finished,
        start_reading_behavior,
        timer_data,
    }
}

function use_readings_timer(reader_behavior: BibleReaderBehavior): TimerData | null
{
    const timer = use_timer(get_reader_behavior_time_data(reader_behavior)?.seconds ?? 0);

    const timer_ref = useRef(timer);
    useEffect(() => {
        timer_ref.current = timer;
    }, [timer])

    const play_timer = useCallback(() => timer_ref.current.start(), []);
    const pause_timer = useCallback(() => timer_ref.current.pause(), []);
    const reset_timer = useCallback(() => timer_ref.current.reset(), []);

    const timer_data: TimerData | null = useMemo(() => {
        if (timer.duration === 0)
            return null;

        return {
            duration: timer.duration,
            elapsed: timer.elapsed,
            status: timer.status,
            play: play_timer,
            pause: pause_timer,
            reset: reset_timer,
        }
    }, [timer]);

    return timer_data;
}

function use_current_section_reading(): RefIdInner
{
    const view_history = use_view_history();
    const { bible_infos } = use_bible_infos();
    const { bible_display_settings } = use_bible_display_settings();
    const bible = bible_infos[bible_display_settings.bible_version];

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