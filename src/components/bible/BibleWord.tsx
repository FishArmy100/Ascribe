import React from "react"
import { WordRenderData } from "../../interop/bible/render"
import { format_strongs, StrongsNumber } from "../../interop/bible/strongs";

export type BibleWordProps = {
    render_data: WordRenderData,
    show_strongs: boolean,
}

export default function BibleWord({
    render_data,
    show_strongs,
}: BibleWordProps): React.ReactElement
{
    const begin_punc = render_data.begin_punc ?? "";
    const end_punc = render_data.end_punc ?? "";
    
    const strongs_numbers = render_data.strongs.map(s => format_strongs(s));
    const can_click = render_data.has_data;

    const word_classes = [
        "bible-word",
        render_data.italics ? "italic" : "",
        render_data.red ? "red" : "",
        can_click ? "clickable" : "",
    ].join(" ");

    return (
        <span className="bible-word-container">
            <span 
                className={word_classes}
                data-word-index={render_data.index}
            >
                {begin_punc + render_data.word + end_punc}
            </span>

            {show_strongs && render_data.strongs.length > 0 && (
                <sup className="bible-strongs">
                    [
                        {render_data.strongs.map((s, i) => (
                            <React.Fragment key={i}>
                                <span
                                    className="bible-strongs-link"
                                    data-strongs-number={strongs_numbers[i]}
                                >
                                    {strongs_numbers[i]}
                                </span>
                                {i < render_data.strongs.length - 1 && ";"}
                            </React.Fragment>
                        ))}
                    ]
                </sup>
            )}
        </span>
    );
}