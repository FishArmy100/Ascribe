import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { useMemo } from "react";

export default function use_date_names()
{
    const i18n = use_app_i18n();

    const names = useMemo(() => ({
        seasons: {
            spring: __t("date.seasons.spring", "Spring"),
            summer: __t("date.seasons.summer", "Summer"),
            fall: __t("date.seasons.fall", "Fall"),
            winter: __t("date.seasons.winter", "Winter"),
        },

        months: {
            january: __t("date.months.january", "January"),
            february: __t("date.months.february", "February"),
            march: __t("date.months.march", "March"),
            april: __t("date.months.april", "April"),
            may: __t("date.months.may", "May"),
            june: __t("date.months.june", "June"),
            july: __t("date.months.july", "July"),
            august: __t("date.months.august", "August"),
            september: __t("date.months.september", "September"),
            october: __t("date.months.october", "October"),
            november: __t("date.months.november", "November"),
            december: __t("date.months.december", "December"),
        },

        months_short: {
            jan: __t("date.months_short.jan", "Jan"),
            feb: __t("date.months_short.feb", "Feb"),
            mar: __t("date.months_short.mar", "Mar"),
            apr: __t("date.months_short.apr", "Apr"),
            may: __t("date.months_short.may", "May"),
            jun: __t("date.months_short.jun", "Jun"),
            jul: __t("date.months_short.jul", "Jul"),
            aug: __t("date.months_short.aug", "Aug"),
            sep: __t("date.months_short.sep", "Sep"),
            oct: __t("date.months_short.oct", "Oct"),
            nov: __t("date.months_short.nov", "Nov"),
            dec: __t("date.months_short.dec", "Dec"),
        },

        weekdays: {
            sunday: __t("date.weekdays.sunday", "Sunday"),
            monday: __t("date.weekdays.monday", "Monday"),
            tuesday: __t("date.weekdays.tuesday", "Tuesday"),
            wednesday: __t("date.weekdays.wednesday", "Wednesday"),
            thursday: __t("date.weekdays.thursday", "Thursday"),
            friday: __t("date.weekdays.friday", "Friday"),
            saturday: __t("date.weekdays.saturday", "Saturday"),
        },

        weekdays_short: {
            sun: __t("date.weekdays_short.sun", "Sun"),
            mon: __t("date.weekdays_short.mon", "Mon"),
            tue: __t("date.weekdays_short.tue", "Tue"),
            wed: __t("date.weekdays_short.wed", "Wed"),
            thu: __t("date.weekdays_short.thu", "Thu"),
            fri: __t("date.weekdays_short.fri", "Fri"),
            sat: __t("date.weekdays_short.sat", "Sat"),
        },

        relative: {
            today: __t("date.relative.today", "Today"),
            yesterday: __t("date.relative.yesterday", "Yesterday"),
            tomorrow: __t("date.relative.tomorrow", "Tomorrow"),
        },
    }), [i18n]);

    return names;
}