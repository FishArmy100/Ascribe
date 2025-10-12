
export type StrongsLang = "hebrew" | "greek";
export type StrongsNumber = {
    language: StrongsLang,
    number: number,
}

export function format_strongs(strongs_number: StrongsNumber): string 
{
    let prefix = "";
    if (strongs_number.language === "greek")
        prefix = "G";

    if (strongs_number.language === "hebrew")
        prefix = "H";

    return prefix + strongs_number.number
}