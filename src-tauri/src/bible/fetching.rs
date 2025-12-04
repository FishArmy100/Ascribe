use std::num::NonZeroU32;

use biblio_json::{Package, core::{Atom, ChapterId, OsisBook, RefId, RefIdInner, VerseId, WordRange}, modules::{Module, ModuleEntry, ModuleId, notebook::NotebookEntry, xrefs::XRefEntry}};
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
        let binding = self.get_mod(bible).as_ref().unwrap()
            .as_bible();
        let bible_mod = binding.as_ref().unwrap();

        let word = bible_mod.source.verses
            .get(&verse).as_ref().unwrap()
            .words[word.get() as usize].clone();

        let entries = self.modules.values().map(|module| {
            match module
            {
                Module::Dictionary(dictionary) => {
                    dictionary.find(&word.text)
                        .map(|e| vec![(ModuleEntry::Dictionary(e), module.id().clone())])
                        .unwrap_or_default()
                },
                Module::XRef(xrefs) => match e {
                    XRefEntry::Directed { source, .. } => !source.is_verse() && !source.is_chapter() && !source.is_book() && source.has_verse(verse),
                    XRefEntry::Mutual { refs, .. } => {
                        refs.iter().any(|v| v.is_verse() && v.has_verse(verse))
                    },
                },
                Module::StrongsLinks(links) => todo!(),
                Module::Commentary(commentary_module) => todo!(),
                Module::Notebook(notebook_module) => todo!(),
                Module::Readings(readings_module) => todo!(),
                _ => vec![]
            }
        }).flatten().collect::<Vec<(ModuleEntry, ModuleId)>>();

        self.convert_to_json_entries(entries, bible)
    }
    
    fn fetch_verse_entries(&self, verse: VerseId, bible: &ModuleId) -> Vec<ModuleEntryJson> 
    {
        let entries = self.modules.values().map(|module| {
            match module 
            {
                Module::XRef(xrefs) => xrefs.entries.iter().filter(|e| {
                    match e 
                    {
                        XRefEntry::Directed { source, .. } => source.is_verse() && source.has_verse(verse),
                        XRefEntry::Mutual { refs, .. } => {
                            refs.iter().any(|v| v.is_verse() && v.has_verse(verse))
                        },
                    }
                })
                .map(|e| (ModuleEntry::XRef(e), xrefs.config.id.clone()))
                .collect_vec(),
                Module::Commentary(commentary) => commentary.entries.iter().filter(|e| {
                    e.references.iter().any(|v| v.is_verse() && v.has_verse(verse))
                })
                .map(|e| (ModuleEntry::Commentary(e), commentary.config.id.clone()))
                .collect_vec(),
                Module::Notebook(notebook) => notebook.entries.iter().filter(|e| {
                    match e 
                    {
                        NotebookEntry::Highlight { references, .. } => {
                            references.iter()
                                .any(|v| v.is_verse() && v.has_verse(verse))
                        },
                        NotebookEntry::Note { references, .. } => {
                            references.iter()
                                .any(|v| v.is_verse() && v.has_verse(verse))
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
        let entries = self.modules.values().map(|module| {
            match module 
            {
                Module::XRef(xrefs) => xrefs.entries.iter().filter(|e| {
                    match e 
                    {
                        XRefEntry::Directed { source, .. } => source.is_chapter() && source.has_chapter(chapter),
                        XRefEntry::Mutual { refs, .. } => {
                            refs.iter().any(|r| r.is_chapter() && r.has_chapter(chapter))
                        },
                    }
                })
                .map(|e| (ModuleEntry::XRef(e), xrefs.config.id.clone()))
                .collect_vec(),
                Module::Commentary(commentary) => commentary.entries.iter().filter(|e| {
                    e.references.iter().any(|r| r.is_chapter() && r.has_chapter(chapter))
                })
                .map(|e| (ModuleEntry::Commentary(e), commentary.config.id.clone()))
                .collect_vec(),
                Module::Notebook(notebook) => notebook.entries.iter().filter(|e| {
                    match e 
                    {
                        NotebookEntry::Highlight { references, .. } => {
                            references.iter()
                                .any(|r| r.is_chapter() && r.has_chapter(chapter))
                        },
                        NotebookEntry::Note { references, .. } => {
                            references.iter()
                                .any(|r| r.is_chapter() && r.has_chapter(chapter))
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
    
    fn fetch_book_entries(&self, book: OsisBook, bible: &ModuleId) -> Vec<ModuleEntryJson> 
    {
        let entries = self.modules.values().map(|module| {
            match module 
            {
                Module::XRef(xrefs) => xrefs.entries.iter().filter(|e| {
                    match e 
                    {
                        XRefEntry::Directed { source, .. } => source.is_book() && source.has_book(book),
                        XRefEntry::Mutual { refs, .. } => {
                            refs.iter().any(|r| r.is_book() && r.has_book(book))
                        },
                    }
                })
                .map(|e| (ModuleEntry::XRef(e), xrefs.config.id.clone()))
                .collect_vec(),
                Module::Commentary(commentary) => commentary.entries.iter().filter(|e| {
                    e.references.iter().any(|r| r.is_book() && r.has_book(book))
                })
                .map(|e| (ModuleEntry::Commentary(e), commentary.config.id.clone()))
                .collect_vec(),
                Module::Notebook(notebook) => notebook.entries.iter().filter(|e| {
                    match e 
                    {
                        NotebookEntry::Highlight { references, .. } => {
                            references.iter()
                                .any(|r| r.is_book() && r.has_book(book))
                        },
                        NotebookEntry::Note { references, .. } => {
                            references.iter()
                                .any(|r| r.is_book() && r.has_book(book))
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

fn is_word_