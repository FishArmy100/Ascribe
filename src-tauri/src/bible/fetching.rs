use std::num::NonZeroU32;

use biblio_json::{FetchEntry, Package, core::{Atom, ChapterId, OsisBook, RefId, RefIdInner, VerseId, WordRange}, modules::{Module, ModuleEntry, ModuleEntryRef, ModuleId, notebook::NotebookEntry, xrefs::XRefEntry}};
use itertools::Itertools;

use crate::repr::ModuleEntryJson;



pub trait PackageEx
{
    fn convert_to_json_entries<'a>(&'a self, fetched: Vec<(ModuleEntry<'a>, ModuleId)>, bible: &ModuleId) -> Vec<ModuleEntryJson>;
    fn fetch_word_entries(&self, verse: VerseId, word: NonZeroU32, bible: &ModuleId) -> Vec<ModuleEntryJson>;
    fn fetch_verse_entries(&self, verse: VerseId, bible: &ModuleId) -> Vec<ModuleEntryJson>;
    fn fetch_chapter_entries(&self, chapter: ChapterId, bible: &ModuleId) -> Vec<ModuleEntryJson>;
    fn fetch_book_entries(&self, book: OsisBook, bible: &ModuleId) -> Vec<ModuleEntryJson>;
}

impl PackageEx for Package
{
    fn convert_to_json_entries<'a>(&'a self, fetched: Vec<(ModuleEntry<'a>, ModuleId)>, bible: &ModuleId) -> Vec<ModuleEntryJson>
    {
        let preview_renderer = |id: &RefId| -> String {
            let (verse, b) = get_first_verse(&id);
            let bible = b.unwrap_or(bible);
            let Some(bible) = self.get_mod(bible).map(|b| b.as_bible()).flatten() else {
                return String::new()
            };

            let Some(verse) = bible.source.verses.get(&verse) else {
                return String::new()
            };

            verse.words.iter()
                .map(|w| {
                    let begin_punc = w.begin_punc.as_ref().map_or("", |v| v);
                    let end_punc = w.end_punc.as_ref().map_or("", |v| v);
                    format!("{}{}{}", begin_punc, w.text, end_punc)
                })
                .join(" ")
        };

        fetched.into_iter().filter_map(|(e, module)| {
            Some(ModuleEntryJson::new(e, module, preview_renderer))
        }).collect_vec()
    }
    
    fn fetch_word_entries(&self, verse: VerseId, word: NonZeroU32, bible: &ModuleId) -> Vec<ModuleEntryJson>
    {
        let entries = self.fetch(verse, bible).map(|r| r.entries).unwrap_or_default();
        let fetched = entries.into_iter().filter(|e| match e.range {
            WordRange::Single(s) => s == word,
            WordRange::Range(s, e) => s <= word && e >= word,
        }).filter_map(|e| {
            let module_name = e.entry.module.clone();
            let entry = self.fetch_entry(e.entry.clone())?;

            if let ModuleEntry::XRef(XRefEntry::Directed { source, .. }) = &entry
            {
                if source != &RefId::from_verse_id(verse, None)
                {
                    return None;
                }
            }
            
            Some((entry, module_name))  
        }).collect_vec();

        self.convert_to_json_entries(fetched, bible)
    }
    
    fn fetch_verse_entries(&self, verse: VerseId, bible: &ModuleId) -> Vec<ModuleEntryJson> 
    {
        let entries = self.modules.iter().map(|(id, module)| {
            match module 
            {
                Module::XRef(xrefs) => xrefs.entries.iter().filter(|e| {
                    match e 
                    {
                        XRefEntry::Directed { source, .. } => source.is_verse() && source.has_verse(&verse),
                        XRefEntry::Mutual { refs, .. } => {
                            refs.iter().any(|v| v.is_verse() && v.has_verse(&verse))
                        },
                    }
                })
                .map(|e| (ModuleEntry::XRef(e), xrefs.config.id.clone()))
                .collect_vec(),
                Module::Commentary(commentary) => commentary.entries.iter().filter(|e| {
                    e.references.iter().any(|v| v.is_verse() && v.has_verse(&verse))
                })
                .map(|e| (ModuleEntry::Commentary(e), commentary.config.id.clone()))
                .collect_vec(),
                Module::Notebook(notebook) => notebook.entries.iter().filter(|e| {
                    match e 
                    {
                        NotebookEntry::Highlight { references, .. } => {
                            references.iter()
                                .any(|v| v.is_verse() && v.has_verse(&verse))
                        },
                        NotebookEntry::Note { references, .. } => {
                            references.iter()
                                .any(|v| v.is_verse() && v.has_verse(&verse))
                        },
                    }
                })
                .map(|e| (ModuleEntry::Notebook(e), notebook.config.id.clone()))
                .collect_vec(),
                _ => vec![]
            }
        }).flatten().collect::<Vec<(ModuleEntry, ModuleId)>>();

        self.convert_to_json_entries(entries, bible)
    }
    
    fn fetch_chapter_entries(&self, chapter: ChapterId, bible: &ModuleId) -> Vec<ModuleEntryJson> 
    {
        todo!()
    }
    
    fn fetch_book_entries(&self, book: OsisBook, bible: &ModuleId) -> Vec<ModuleEntryJson> 
    {
        todo!()
    }
}

fn get_first_verse(id: &RefId) -> (VerseId, Option<&ModuleId>)
{
    let bible = id.bible.as_ref().clone();
    let atom = match &id.id {
        RefIdInner::Single(atom) => atom,
        RefIdInner::Range { from, .. } => from,
    };

    match atom 
    {
        Atom::Book { book } => {
            let verse = VerseId {
                book: *book,
                chapter: NonZeroU32::new(1).unwrap(),
                verse: NonZeroU32::new(1).unwrap(),
            };

            (verse, bible)
        },
        Atom::Chapter { book, chapter } => {
            let verse = VerseId {
                book: *book,
                chapter: *chapter,
                verse: NonZeroU32::new(1).unwrap(),
            };

            (verse, bible)
        },
        Atom::Verse { book, chapter, verse } => {
            let verse = VerseId {
                book: *book,
                chapter: *chapter,
                verse: *verse,
            };

            (verse, bible)
        },
        Atom::Word { book, chapter, verse, .. } => {
            let verse = VerseId {
                book: *book,
                chapter: *chapter,
                verse: *verse,
            };

            (verse, bible)
        },
    }
}