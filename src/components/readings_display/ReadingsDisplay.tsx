import DropdownBase from "@components/core/DropdownBase";
import * as images from "@assets"
import { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import { backend_fetch_reading, ReadingsDate, to_readings_date } from "@interop/bible/readings";
import ReadingsChapterList from "./ReadingsChapterList";
import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { RefId } from "@interop/bible/ref_id";
import ReadingsPlanSelector from "./ReadingPlanSelector";
import { Box, Divider } from "@mui/material";

export default function ReadingsDisplay(): React.ReactElement
{
    const [is_open, set_is_open] = useState(false);
    const [date, set_date] = useState<ReadingsDate>(to_readings_date(new Date()));

    const start_date = useMemo(() => {
        const year = new Date().getFullYear();
        return to_readings_date(new Date(year, 0, 1));
    }, []);

    const { bible_display_settings } = use_bible_display_settings();

    const [readings, set_readings] = useState<RefId[] | null>(null);

    useEffect(() => {
        let is_mounted = true;
        const fetch_readings = async () => {
            const readings = await backend_fetch_reading(bible_display_settings.reading_plan, start_date, date);
            console.log(readings);
            if (is_mounted)
            {
                set_readings(readings);
            }
        }

        fetch_readings();
        return () => {
            is_mounted = false;
        }
    }, [date, bible_display_settings])

    return (
        <DropdownBase
            button={{
                type: "image",
                tooltip: is_open ? "Hide readings display" : "Show readings display",
                src: images.book_reader,
            }}
            is_open={is_open}
            on_click={() => set_is_open(!is_open)}
            disable_hover
        >
            <DatePicker 
                label="Pick a date"
                on_change={set_date}
                date={date}
            />
            <Box
                sx={{
                    padding: 1
                }}
            >
                {readings && (
                    <>
                        <Divider orientation="horizontal" sx={{ mt: 1, mb: 1 }}/>
                        <ReadingsChapterList
                            readings={readings}
                            bible_id={bible_display_settings.bible_version}
                        />
                    </>
                )}
                <Divider orientation="horizontal" sx={{ mt: 1, mb: 1 }}/>
                <ReadingsPlanSelector />
            </Box>
        </DropdownBase>
    )
}