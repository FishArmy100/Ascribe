import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import { ReadingsDate } from '@interop/bible/readings';
import { use_deep_copy } from '@utils/index';
import { Box } from '@mui/material';

export type DatePickerProps = {
    label: string,
    on_change: (date: ReadingsDate) => void,
    date: ReadingsDate,
}

export default function DatePicker({
    label,
    on_change,
    date,
}: DatePickerProps): React.ReactElement
{
    const deep_copy = use_deep_copy();
    const on_date_set = React.useCallback((value: Dayjs | null) => {

        if (value === null)
        {
            on_change(deep_copy(date))
        }
        else 
        {
            on_change({
                year: value.year(),
                month: value.month() + 1,
                day: value.date(),
            })
        }
    },  [on_change])

    const calendar_date: Dayjs = React.useMemo(() => {
        return dayjs(
            new Date(date.year, date.month - 1, date.day)
        )
    }, [date.day, date.month])

    return (
        <Box
            sx={{
                padding: 1,
            }}
        >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MuiDatePicker
                    label={label}
                    value={calendar_date}
                    onChange={on_date_set}
                    slotProps={{
                        popper: {
                            disablePortal: true
                        }
                    }}
                />
            </LocalizationProvider>
        </Box>
    );
}
