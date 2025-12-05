use std::num::NonZeroU32;
use biblio_json::{core::{Atom, OsisBook, RefId, RefIdInner}, modules::ModuleId};
use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct RefIdJson
{
    pub bible: Option<ModuleId>,
    pub id: RefIdInnerJson,
}

impl From<RefId> for RefIdJson 
{
    fn from(ref_id: RefId) -> Self 
    {
        RefIdJson {
            bible: ref_id.bible,
            id: RefIdInnerJson::from(ref_id.id),
        }
    }
}

impl From<&RefId> for RefIdJson 
{
    fn from(ref_id: &RefId) -> Self 
    {
        RefIdJson {
            bible: ref_id.bible.clone(),
            id: RefIdInnerJson::from(&ref_id.id),
        }
    }
}

impl From<RefIdJson> for RefId 
{
    fn from(json: RefIdJson) -> Self 
    {
        RefId {
            bible: json.bible,
            id: RefIdInner::from(json.id),
        }
    }
}

impl From<&RefIdJson> for RefId 
{
    fn from(json: &RefIdJson) -> Self 
    {
        RefId {
            bible: json.bible.clone(),
            id: RefIdInner::from(&json.id),
        }
    }
}

#[derive(Debug, PartialEq, Clone, Hash, Eq, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum RefIdInnerJson
{
    Single { atom: AtomJson },
    Range { from: AtomJson, to: AtomJson },
}

impl From<RefIdInner> for RefIdInnerJson 
{
    fn from(inner: RefIdInner) -> Self 
    {
        match inner {
            RefIdInner::Single(atom) => RefIdInnerJson::Single { atom: AtomJson::from(atom) },
            RefIdInner::Range { from, to } => RefIdInnerJson::Range {
                from: AtomJson::from(from),
                to: AtomJson::from(to),
            },
        }
    }
}

impl From<&RefIdInner> for RefIdInnerJson 
{
    fn from(inner: &RefIdInner) -> Self 
    {
        match inner {
            RefIdInner::Single(atom) => RefIdInnerJson::Single { atom: AtomJson::from(atom) },
            RefIdInner::Range { from, to } => RefIdInnerJson::Range {
                from: AtomJson::from(from),
                to: AtomJson::from(to),
            },
        }
    }
}

impl From<RefIdInnerJson> for RefIdInner 
{
    fn from(inner: RefIdInnerJson) -> Self 
    {
        match inner {
            RefIdInnerJson::Single { atom } => RefIdInner::Single(Atom::from(atom)),
            RefIdInnerJson::Range { from, to } => RefIdInner::Range {
                from: Atom::from(from),
                to: Atom::from(to),
            },
        }
    }
}

impl From<&RefIdInnerJson> for RefIdInner 
{
    fn from(inner: &RefIdInnerJson) -> Self 
    {
        match inner {
            RefIdInnerJson::Single { atom } => RefIdInner::Single(Atom::from(atom)),
            RefIdInnerJson::Range { from, to } => RefIdInner::Range {
                from: Atom::from(from),
                to: Atom::from(to),
            },
        }
    }
}

#[derive(Debug, PartialEq, Clone, Hash, Eq, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum AtomJson
{
    Book { book: OsisBook },
    Chapter { book: OsisBook, chapter: NonZeroU32 },
    Verse { book: OsisBook, chapter: NonZeroU32, verse: NonZeroU32 },
    Word { book: OsisBook, chapter: NonZeroU32, verse: NonZeroU32, word: NonZeroU32 },
}

impl From<Atom> for AtomJson 
{
    fn from(atom: Atom) -> Self 
    {
        match atom {
            Atom::Book { book } => AtomJson::Book { book },
            Atom::Chapter { book, chapter } => AtomJson::Chapter { book, chapter },
            Atom::Verse { book, chapter, verse } => AtomJson::Verse { book, chapter, verse },
            Atom::Word { book, chapter, verse, word } => AtomJson::Word { book, chapter, verse, word },
        }
    }
}

impl From<&Atom> for AtomJson 
{
    fn from(atom: &Atom) -> Self 
    {
        match atom {
            Atom::Book { book } => AtomJson::Book { book: *book },
            Atom::Chapter { book, chapter } => AtomJson::Chapter { book: *book, chapter: *chapter },
            Atom::Verse { book, chapter, verse } => AtomJson::Verse { book: *book, chapter: *chapter, verse: *verse },
            Atom::Word { book, chapter, verse, word } => AtomJson::Word { book: *book, chapter: *chapter, verse: *verse, word: *word },
        }
    }
}

impl From<AtomJson> for Atom 
{
    fn from(atom: AtomJson) -> Self 
    {
        match atom {
            AtomJson::Book { book } => Atom::Book { book },
            AtomJson::Chapter { book, chapter } => Atom::Chapter { book, chapter },
            AtomJson::Verse { book, chapter, verse } => Atom::Verse { book, chapter, verse },
            AtomJson::Word { book, chapter, verse, word } => Atom::Word { book, chapter, verse, word },
        }
    }
}

impl From<&AtomJson> for Atom 
{
    fn from(atom: &AtomJson) -> Self 
    {
        match atom {
            AtomJson::Book { book } => Atom::Book { book: *book },
            AtomJson::Chapter { book, chapter } => Atom::Chapter { book: *book, chapter: *chapter },
            AtomJson::Verse { book, chapter, verse } => Atom::Verse { book: *book, chapter: *chapter, verse: *verse },
            AtomJson::Word { book, chapter, verse, word } => Atom::Word { book: *book, chapter: *chapter, verse: *verse, word: *word },
        }
    }
}