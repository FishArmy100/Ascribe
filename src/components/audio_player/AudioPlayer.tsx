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
import AudioPlayerPrimaryControls from "./AudioPlayerPrimaryControls";
import use_audio_player_controller from "./audio_player_hooks/player_controller";

export type AudioPlayerProps = {
    open: boolean,
}

export default function AudioPlayer({
    open,
}: AudioPlayerProps): React.ReactElement
{
    const controller = use_audio_player_controller(open);
    const controller_ref = useRef(controller);
    useEffect(() => {
        controller_ref.current = controller;
    }, [controller])

    const theme = useTheme();
    const { bible_display_settings } = use_bible_display_settings();
    const view_history = use_view_history();

    const view_history_ref = useRef<ViewHistoryContextType>(view_history);
    useEffect(() => {
        view_history_ref.current = view_history;
    }, [view_history])

    const [is_expanded, set_is_expanded] = useState(false);
    const [show_queue, set_show_queue] = useState(false);
    const deep_copy = use_deep_copy();

    const [player_index, set_player_index] = useState<number>(0);

    const handle_change_reader_behavior = useCallback((updater: (behavior: BibleReaderBehavior) => BibleReaderBehavior) => {
        const copy = deep_copy(controller_ref.current.behavior);
        const updated = updater(copy);
        controller_ref.current.set_behavior(updated);
    }, []);

    useEffect(() => {
        if (controller.behavior.type === "current")
        {
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

            const copy = deep_copy(controller.behavior);
            copy.ref_id = inner;
            if (stringify(controller.behavior.ref_id) !== stringify(copy.ref_id))
            {
                controller.set_behavior(copy);
            }
        }
    }, [stringify(view_history.get_current()), controller.set_behavior, controller.behavior]);

    useEffect(() => {
        if (controller.current_reading && open)
        {
            view_history_ref.current.push_ref_id(reader_reading_to_ref_id(controller.current_reading));
        }
    }, [controller.current_reading, open]);
    
    // Stops the player if what is currently displayed is not the chapter that it should be playing
    useEffect(() => {
        const current = view_history_ref.current.get_current();
        const is_same_chapter = current.type === "chapter" && 
                                current.chapter.book === controller.current_reading?.chapter.book && 
                                current.chapter.chapter === controller.current_reading.chapter.chapter;

        const is_same_verse = current.type === "verse" && 
                            current.chapter.book === controller.current_reading?.chapter.book && 
                            current.chapter.chapter === controller.current_reading.chapter.chapter;

        if (!is_same_chapter && !is_same_verse)
        {
            controller.pause();
        }
    }, [])

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
                                timer={controller.timer_data}
                                on_reset={() => {}}                            
                            />
                            <Stack 
                                direction="column"
                            >
                                <Stack
                                    direction="column"
                                >
                                    <AudioPlayerPrimaryControls controller={controller}/>
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
                                        behavior={controller.behavior}
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