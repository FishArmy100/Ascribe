import DropdownBase from "@components/core/DropdownBase";
import dayjs, { Dayjs } from "dayjs"
import * as images from "@assets"
import { useState } from "react";
import DatePicker from "./DatePicker";
import { ReadingsDate, to_readings_date } from "@interop/bible/readings";

export default function ReadingsDisplay(): React.ReactElement
{
    const [is_open, set_is_open] = useState(false);
    const [date, set_date] = useState<ReadingsDate>(to_readings_date(new Date()))

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
        </DropdownBase>
    )
}