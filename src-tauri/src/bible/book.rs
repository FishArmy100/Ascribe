use std::{collections::HashMap, num::NonZeroU32};

use biblio_json::{core::OsisBook, modules::bible::BibleModule};
use itertools::Itertools;
use regex::Regex;


lazy_static::lazy_static!
{
    static ref ALTS_MAP: HashMap<&'static str, &'static str> = {
        let map = HashMap::from([
            ("nm", "numbers"),
            ("dt", "deuteronomy"),
            ("jsh", "joshua"),
            ("jdg", "judges"),
            ("jdgs", "judges"),
            ("sm", "samuel"),
            ("jb", "job"),
            ("pss", "psalm"),
            ("psalms", "psalm"),
            ("prv", "proverbs"),
            ("sg", "song of solomon"),
            ("ss", "song of solomon"),
            ("sos", "song of solomon"),
            ("jl", "joel"),
            ("obd", "obadiah"),
            ("hb", "habakkuk"),
            ("hg", "haggai"),
            ("ml", "malachi"),
            ("mt", "matthew"),
            ("mk", "mark"),
            ("lk", "luke"),
            ("jn", "john"),
            ("jas", "james"),
            ("php", "philippians"),
            ("phm", "philemon"),
        ]);
        map
    };

    static ref BOOK_NAME_REGEX: Regex = Regex::new("^(?P<prefix>\\d+\\s+)?(?P<book>[a-zA-Z\\s]*[a-zA-Z])$").unwrap();
}

#[derive(Debug)]
struct BookNameInfo
{
    name: String,
    prefix: Option<NonZeroU32>,
    osis: OsisBook,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ResolveBookNameError
{
    InvalidInput,
    PrefixInvalid,
    BookDoesNotExist
}

pub fn resolve_book_name(name: &str, module: &BibleModule) -> Result<OsisBook, ResolveBookNameError>
{
    let Some(captures) = BOOK_NAME_REGEX.captures(name) else {
        return Err(ResolveBookNameError::InvalidInput)
    };

    let prefix = match captures.name("prefix").map(|s| s.as_str().trim().parse::<NonZeroU32>())
    {
        None => None,
        Some(Ok(ok)) => Some(ok),
        Some(Err(_)) => return Err(ResolveBookNameError::PrefixInvalid)
    };

    let name = captures.name("book").unwrap().as_str().to_ascii_lowercase().to_owned();


    let book_name = name.to_ascii_lowercase();

    let books = &module.source.book_infos;
    let book_name = match ALTS_MAP.get(book_name.as_str()) {
        Some(s) => &s,
        None => book_name.as_str(),
    };

    let possible_books = books
        .iter()
        .map(|b| {
            let captures = BOOK_NAME_REGEX.captures(&b.name).unwrap();
            let prefix = captures.name("prefix").map(|s| s.as_str().trim().parse::<NonZeroU32>().unwrap());
            let name = captures.name("book").unwrap().as_str().to_ascii_lowercase().to_owned();

            BookNameInfo {
                prefix,
                name,
                osis: b.osis_book,
            }
        })
        .filter(|b| b.name.starts_with(book_name) && b.prefix == prefix)
        .collect_vec();

    if possible_books.len() == 0 
    {
        return Err(ResolveBookNameError::BookDoesNotExist);
    }

    let book = possible_books
        .iter()
        .find(|b| b.prefix == prefix)
        .or_else(|| possible_books.first())
        .unwrap();
    
    Ok(book.osis)
}