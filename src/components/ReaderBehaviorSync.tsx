import React, { useEffect, useRef } from "react";
import { use_view_history } from "./providers/ViewHistoryProvider";
import stringify from "fast-json-stable-stringify";
import { use_bible_reader } from "./providers/BibleReaderProvider";
import { use_deep_copy } from "@utils/index";


export default function ReaderBehaviorSync(): React.ReactElement
{
    const view_history = use_view_history();
    const view_history_ref = useRef(view_history);
    const { reader_behavior, set_reader_behavior } = use_bible_reader();
    const deep_copy = use_deep_copy()

    useEffect(() => {
        view_history_ref.current = view_history;
    }, [view_history]);

    useEffect(() => {
        if (reader_behavior.type !== "current")
        {
            return;
        }

        const copy = deep_copy(reader_behavior);

        const view = view_history.get_current();
        if (view.type === "chapter")
        {
            copy.ref_id = {
                type: "single",
                atom: {
                    type: "chapter",
                    book: view.chapter.book,
                    chapter: view.chapter.chapter,
                }
            }

            set_reader_behavior(copy);
        }
        else if (view.type === "verse" && (view.start === view.end || view.end === null))
        {
            copy.ref_id = {
                type: "single",
                atom: {
                    type: "verse",
                    book: view.chapter.book,
                    chapter: view.chapter.chapter,
                    verse: view.start
                }
            }
        }
        else if (view.type === "verse" && view.end !== null)
        {
            copy.ref_id = {
                type: "range",
                from: {
                    type: "verse",
                    book: view.chapter.book,
                    chapter: view.chapter.chapter,
                    verse: view.start
                },
                to: {
                    type: "verse",
                    book: view.chapter.book,
                    chapter: view.chapter.chapter,
                    verse: view.end
                }
            }
        }
    }, [stringify(view_history.get_current())])

    return <></>
}