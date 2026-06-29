import { Box, Collapse, Stack, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImageButton from "../core/ImageButton";
import * as images from "@assets"
import Slider from "../core/Slider";
import { motion, AnimatePresence } from "framer-motion";
import { ITtsContextType, use_tts_player } from "../providers/TtsPlayerProvider";
import PlayButton, { PlayButtonType } from "./PlayButton";
import { use_bible_display_settings } from "../providers/BibleDisplaySettingsProvider";
import VolumeControl from "./VolumeControl";
import PlaybackControl from "./PlaybackControl";
import CorrectPitchCheckbox from "./CorrectPitchCheckbox";
import FollowTextCheckbox from "./FollowTextCheckbox";
import ExpandButton from "./ExpandButton";
import { get_chapter_verse_ids, VerseId } from "@interop/bible";
import use_audio_player_tooltips from "./audio_player_tooltips";
import { use_settings } from "@components/providers/SettingsProvider";
import VoiceSelectDropdown from "./VoiceSelectDropdown";
import { use_bible_infos } from "@components/providers/BibleInfoProvider";
import { TtsAudioKey } from "@interop/tts";
import { use_audio_section_labeler } from "./audio_section_labeler";
import BehaviorSelector from "./behavior_selector/BehaviorSelector";
import { use_bible_reader } from "@components/providers/BibleReaderProvider";
import { BibleReaderBehavior, get_reader_behavior_time_data, is_reader_behavior_timed, reader_reading_to_ref_id, ReaderReading } from "@interop/reader";
import { use_deep_copy } from "@utils/index";
import { use_view_history, ViewHistoryContextType } from "@components/providers/ViewHistoryProvider";
import QueuePopup from "./reader_queue/QueuePopup";

import stringify from "fast-json-stable-stringify";
import TimerDisplay from "./TimerDisplay";
import { use_timer } from "@utils/timer";
import { RefIdInner } from "@interop/bible/ref_id";

const FAST_FORWARD_TIME = 10;
const REWIND_TIME = 10;

export type AudioPlayerProps = {
    open: boolean,
}

export default function AudioPlayer({
    open,
}: AudioPlayerProps): React.ReactElement
{
    const theme = useTheme();
    const tts_player = use_tts_player();
    const { settings } = use_settings();
    const label_audio_section = use_audio_section_labeler();
    const { reader_behavior, set_reader_behavior, next_reading } = use_bible_reader();
    const { bible_display_settings } = use_bible_display_settings();
    const view_history = use_view_history();

    const view_history_ref = useRef<ViewHistoryContextType>(view_history);
    useEffect(() => {
        view_history_ref.current = view_history;
    }, [view_history])

    const [user_setting_time, set_user_setting_time] = useState(false);
    const [user_value, set_user_value] = useState(0);

    const [is_expanded, set_is_expanded] = useState(false);
    const [show_queue, set_show_queue] = useState(false);
    const current_version = use_bible_display_settings().bible_display_settings.bible_version;
    const { bible_infos } = use_bible_infos();
    const deep_copy = use_deep_copy();

    const [player_index, set_player_index] = useState<number>(0);
    const [current_reading, set_current_reading] = useState<ReaderReading | null>(null);
    
    const timer = use_timer(get_reader_behavior_time_data(reader_behavior)?.seconds ?? 0);

    const handle_change_reader_behavior = useCallback((updater: (behavior: BibleReaderBehavior) => BibleReaderBehavior) => {
        const copy = deep_copy(reader_behavior);
        const updated = updater(copy);
        set_reader_behavior(updated);
    }, [reader_behavior, set_reader_behavior]);

    useEffect(() => {
        if (reader_behavior.type === "current")
        {
            let inner: RefIdInner | null = null;
            let index = view_history.get_index();
            do {
                const entry = view_history.at(index);
                if (entry.type === "chapter") {
                    inner = {
                        type: "single",
                        atom: {
                            type: "chapter",
                            ...entry.chapter
                        }
                    };
                }
                else if (entry.type === "verse") {
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

            if (inner === null) {
                inner = {
                    type: "single",
                    atom: {
                        type: "chapter",
                        book: "Gen",
                        chapter: 1
                    }
                }
            }

            const copy = deep_copy(reader_behavior);
            copy.ref_id = inner;
            if (stringify(reader_behavior.ref_id) !== stringify(copy.ref_id))
            {
                set_reader_behavior(copy);
            }
        }
    }, [stringify(view_history.get_current()), set_reader_behavior, reader_behavior])

    const [is_playing, set_is_playing] = useState(false);
    const player_state = tts_player.state();
    const is_player_loaded = tts_player.is_loaded();
    const generated_keys_count = tts_player.get_generated_keys().length;
    
    const player_ref = useRef<ITtsContextType>(tts_player);
    useEffect(() => {
        player_ref.current = tts_player;
    }, [tts_player]);

    // Resets whenever a different bible is selected or the behavior is changed
    useEffect(() => {
        set_player_index(0);
        player_ref.current.stop();
        set_is_playing(false);
    }, [bible_display_settings.bible_version, bible_infos, reader_behavior, open])

    const player_index_ref = useRef(player_index);
    useEffect(() => {
        player_index_ref.current = player_index;
    }, [player_index])

    useEffect(() => {
        if (player_state?.finished)
        {
            set_player_index(player_index_ref.current + 1);
        }
    }, [player_state?.finished, set_player_index, next_reading]);

    useEffect(() => {
        if (is_reader_behavior_timed(reader_behavior))
        {
            if (is_playing)
            {
                timer.start()
            }
            else 
            {
                timer.pause();
            }
        }
    }, [is_playing, timer.start, timer.pause, reader_behavior]);

    useEffect(() => {
        const time_data = get_reader_behavior_time_data(reader_behavior);
        if (!time_data)
            return;

        if (timer.status === "completed" && !time_data.finish_segment)
        {
            set_is_playing(false);
            timer.reset();
        }
    }, [timer.status]);

    const prev_timer_status = useRef(timer.status);
    useEffect(() => {
        prev_timer_status.current = timer.status;
    }, [timer.status])

    useEffect(() => {
        if (prev_timer_status.current === "completed")
        {
            set_is_playing(false);
            timer.reset();
        }
    }, [player_index])

    useEffect(() => {
        let mounted = true;

        next_reading(bible_display_settings.bible_version, player_index, timer.elapsed).then(r => {
            if (mounted)
            {
                if (r.type === "none" || r.type === "stop")
                {
                    set_is_playing(false);
                    set_player_index(0);
                }
                else 
                {
                    set_current_reading(r.reading);
                }
            }
        })

        return () => { 
            mounted = false;
        };
    }, [player_index, reader_behavior, bible_display_settings.bible_version, next_reading, set_current_reading]);

    useEffect(() => {
        if (current_reading)
        {
            player_ref.current.stop();
            view_history_ref.current.push_ref_id(reader_reading_to_ref_id(current_reading));
        }
    }, [current_reading]);
    
    // Stops the player if what is currently displayed is not the chapter that it should be playing
    useEffect(() => {
        const current = view_history_ref.current.get_current();
        const is_same_chapter = current.type === "chapter" && current.chapter.book === current_reading?.chapter.book && current.chapter.chapter === current_reading.chapter.chapter;
        const is_same_verse = current.type === "verse" && current.chapter.book === current_reading?.chapter.book && current.chapter.chapter === current_reading.chapter.chapter;

        if (!is_same_chapter && !is_same_verse)
        {
            player_ref.current?.pause();
        }
    }, [])

    const handle_play_button_clicked = useCallback(() => {
        const state = player_ref.current.state();
        if (state)
        {
            if (state.paused)
            {
                player_ref.current.play();
                set_is_playing(true);
            }
            else 
            {
                player_ref.current.pause();
                set_is_playing(false);
            }
        }
    }, [])

    const [player_progress, progress_text] = useMemo(() => {
        if (player_state && player_state.duration > 0)
        {
            const player_progress = player_state.current_time / player_state.duration;
            const progress_text = format_progress_text(player_progress, player_state.duration);
            return [player_progress, progress_text]
        }
        else 
        {
            return [ null, "--:--" ];
        }
    }, [player_state])

    const audio_keys: TtsAudioKey[] = useMemo(() => {
        if (!current_reading)
            return [];

        const voice = settings.tts_settings.current_voice;
        let verses: VerseId[];
        if (current_reading.type === "chapter")
        {
            verses = get_chapter_verse_ids(bible_infos[current_version], current_reading.chapter);
        }
        else 
        {
            verses = Array.from({ length: current_reading.end - current_reading.start + 1}, (_, i) => i + current_reading.start).map(verse => ({
                book: current_reading.chapter.book,
                chapter: current_reading.chapter.chapter,
                verse
            }))
        }

        let keys = verses.map((v): TtsAudioKey => ({
            type: "verse",
            bible: current_version,
            verse: v,
            voice,
        }));

        const label = label_audio_section(voice, current_reading);
        const label_key: TtsAudioKey = {
            type: "string",
            voice,
            string: label,
        }

        return [label_key, ...keys];
    }, [current_reading, settings.tts_settings.current_voice, label_audio_section]);

    useEffect(() => {
        if (open)
        {
            console.log("REQUESTING")
            player_ref.current.request(audio_keys);
        }
    }, [audio_keys, open]);

    const generation_progress = useMemo(() => {
        const count = player_ref.current.contains_keys(audio_keys);
        if (count < audio_keys.length)
        {
            if (audio_keys.length === 0)
            {
                return 0;
            }
            return count / audio_keys.length;
        }
        else 
        {
            return null;
        }
    }, [audio_keys, tts_player]);

    useEffect(() => {
        if (player_ref.current.contains_keys(audio_keys) === audio_keys.length && open && audio_keys.length > 0)
        {
            player_ref.current.load(audio_keys);
        }
    }, [audio_keys, generated_keys_count, open]);

    useEffect(() => {
        if (player_ref.current.is_loaded() && is_playing)
        {
            player_ref.current.play();
        }
    }, [is_playing, is_player_loaded])

    const play_button_type = useMemo((): PlayButtonType => {
        const state = tts_player.state();
        if (generation_progress !== null)
        {
            return "generating";
        }
        else if (state && !state.paused)
        {
            return "pause";
        }
        else 
        {
            return "play";
        }
    }, [generation_progress, player_state])

    const handle_user_change_progress = useCallback((v: number) => {
        set_user_setting_time(true);
        set_user_value(v);
    }, [set_user_setting_time, set_user_value]);

    const handle_fast_forward = useCallback(() => {
        if (player_state && player_state.duration > 0)
        {
            const new_time = Math.min(player_state.current_time + FAST_FORWARD_TIME, player_state.duration);
            player_ref.current.set_time(new_time);
        }
    }, [player_state?.duration, player_state?.current_time])

    const handle_rewind = useCallback(() => {
        if (player_state && player_state.duration > 0)
        {
            const new_time = Math.max(player_state.current_time - REWIND_TIME, 0);
            player_ref.current.set_time(new_time);
        }
    }, [player_state?.duration, player_state?.current_time])

    const handle_user_commit_progress = useCallback((v: number) => {
        if (player_state && player_state.duration > 0)
        {
            player_ref.current.set_time(v * player_state.duration);
        }
        set_user_setting_time(false);
    }, [player_state?.duration, set_user_setting_time]);

    const tooltips = use_audio_player_tooltips();

    return (
        <Box
            sx={{
                position: "fixed",
                display: "flex",
                justifyContent: "center",
                bottom: 0,
                right: 0,
                width: "100vw",
                pointerEvents: "none",
            }}
        >
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ width: "60%", pointerEvents: "all" }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                backgroundColor: theme.palette.primary.dark,
                                borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
                                borderColor: theme.palette.divider,
                                borderWidth: theme.spacing(1 / 8),
                                borderStyle: "solid",
                                position: "relative",
                            }}
                        >
                            <ExpandButton
                                is_expanded={is_expanded}
                                set_is_expanded={set_is_expanded}
                            />
                            <TimerDisplay 
                                total_seconds={timer.duration} 
                                elapsed_seconds={timer.elapsed} 
                                show={get_reader_behavior_time_data(reader_behavior) !== null}
                                on_reset={() => {}}                            
                            />
                            <Stack 
                                direction="column"
                            >
                                <Stack
                                    direction={"column"}
                                >
                                    <Stack
                                        direction="row"
                                        display="flex"
                                        alignItems="center"
                                        gap={theme.spacing(0.5)}
                                        padding={theme.spacing(0.5)}
                                    >
                                        <ImageButton
                                            image={images.angles_left}
                                            tooltip={tooltips.rewind(REWIND_TIME)}
                                            disabled={!tts_player.is_loaded()}
                                            on_click={handle_rewind}
                                        />
                                        <PlayButton
                                            type={play_button_type}
                                            generation_progress={generation_progress}
                                            on_click={handle_play_button_clicked ?? undefined}
                                        />
                                        <ImageButton
                                            image={images.angles_right}
                                            tooltip={tooltips.fast_forward(FAST_FORWARD_TIME)}
                                            disabled={!tts_player.is_loaded()}
                                            on_click={handle_fast_forward}
                                        />
                                        <Slider
                                            value={user_setting_time ? user_value : player_progress ?? 0}
                                            min={0}
                                            max={1}
                                            step={0.0001}
                                            tooltip={tooltips.progress}
                                            on_change={handle_user_change_progress}
                                            on_commit={handle_user_commit_progress}
                                            readonly={false}
                                            sx={{
                                                ml: theme.spacing(2)
                                            }}
                                        />
                                        <Typography
                                            color={theme.palette.primary.contrastText}
                                            variant="body2"
                                            textAlign="center"
                                            component="div"
                                            width="8em"
                                        >
                                            {progress_text}
                                        </Typography>
                                    </Stack>
                                    <Stack 
                                        direction="row"
                                        gap={theme.spacing(0.5)}
                                        padding={theme.spacing(0.5)}
                                        sx={{
                                            backgroundColor: theme.palette.background.default,
                                        }}
                                    >
                                        <VolumeControl/>
                                        <PlaybackControl/>
                                        <VoiceSelectDropdown/>
                                        <ImageButton 
                                            image={images.history_vertical}
                                            tooltip={null}
                                            on_click={() => set_show_queue(true)}
                                        />
                                    </Stack>
                                    <BehaviorSelector 
                                        bible={bible_display_settings.bible_version}
                                        behavior={reader_behavior}
                                        on_change={handle_change_reader_behavior}
                                    />
                                </Stack>
                                <Collapse in={is_expanded} timeout="auto" unmountOnExit={false}>
                                    <Stack
                                        direction="row"
                                        display="flex"
                                        alignItems="center"
                                        flexWrap="wrap"
                                        useFlexGap
                                        gap={theme.spacing(0.5)}
                                        sx={{
                                            backgroundColor: theme.palette.background.default,
                                        }}
                                    >
                                        <CorrectPitchCheckbox/>
                                        <FollowTextCheckbox/>
                                    </Stack>
                                </Collapse>
                            </Stack>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
            <QueuePopup 
                show={show_queue}
                on_close={() => set_show_queue(false)}
                index={player_index}
                bible={bible_display_settings.bible_version}
                on_select={set_player_index}
            />
        </Box>
    )
}

function format_progress_text(elapsed: number, duration: number): string
{
    let time = Math.floor(duration - elapsed * duration);
    let mins = Math.floor(time / 60).toString().padStart(2, '0');
    let secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}