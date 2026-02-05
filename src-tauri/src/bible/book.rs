use std::num::NonZeroU32;

use biblio_json::{core::OsisBook, modules::bible::BibleModule};
use itertools::Itertools;
use regex::Regex;


lazy_static::lazy_static!
{
    static ref BOOK_NAME_REGEX: Regex = Regex::new(
        r"^(?P<prefix>\d+\s+)?(?P<book>\p{L}[\p{L}\s]*\p{L})$"
    ).unwrap();
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

impl std::fmt::Display for ResolveBookNameError
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result 
    {
        match self 
        {
            ResolveBookNameError::InvalidInput => write!(f, "Invalid book"),
            ResolveBookNameError::PrefixInvalid => write!(f, "Invalid prefix"),
            ResolveBookNameError::BookDoesNotExist => write!(f, "Book does not exist"),
        }
    }
}

pub fn resolve_book_name(name: &str, module: &BibleModule) -> Result<OsisBook, ResolveBookNameError>
{
    println!("name: {}; module: {}", name, module.config.id);
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

    let full_name = if let Some(prefix) = prefix 
    { 
        format!("{} {}", prefix, name) 
    } 
    else 
    { 
        name.clone()
    };

    if let Some(osis) = module.config.book_aliases.get(&full_name)
    {
        return Ok(*osis)
    }

    let books = &module.source.book_infos;
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
        .filter(|b| b.name.starts_with(&name) && b.prefix == prefix)
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