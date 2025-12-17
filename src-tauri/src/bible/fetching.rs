use std::{collections::{HashMap, HashSet}, num::NonZeroU32};

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
    fn fetch_words_have_entries(&self, words: &[(VerseId, NonZeroU32)], bible: &ModuleId) -> Vec<(VerseId, NonZeroU32)>;
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

        let word_data = bible_mod.source.verses
            .get(&verse).as_ref().unwrap()
            .words[word.get() as usize - 1].clone();

        let strongs_defs = self.modules.values().filter_map(Module::as_strongs_defs).collect_vec();

        let entries = self.modules.values().map(|module| {
            match module
            {
                Module::Dictionary(dictionary) => {
                    dictionary.find(&word_data.text)
                        .map(|e| vec![(ModuleEntry::Dictionary(e), module.id().clone())])
                        .unwrap_or_default()
                },
                Module::XRef(xrefs) => xrefs.entries.iter().filter(|e| {
                    match e 
                    {
                        XRefEntry::Directed { source, .. } => is_word_ref_id(source) && source.has_verse_word(verse, word),
                        XRefEntry::Mutual { refs, .. } => {
                            refs.iter().any(|r| is_word_ref_id(r) && r.has_verse_word(verse, word))
                        },
                    }
                })
                    .map(|e| (ModuleEntry::XRef(e), xrefs.config.id.clone()))
                    .collect_vec(),
                Module::StrongsLinks(links) => {
                    if links.config.bible != *bible { return vec![] }
                    let Some(links) = links.get_links(&verse) else { return vec![] };
                    let Some(strongs_word) = links.words.iter().find(|w| match w.range {
                        WordRange::Single(s) => s == word,
                        WordRange::Range(s, e) => s <= word && e >= word,
                    }) else { return vec![] };
                    
                    strongs_word.strongs.iter().map(|s| {
                        strongs_defs.iter().filter_map(|defs| {
                            defs.get_def(s).map(|d| (d, defs.config.id.clone()))
                        })
                    }).flatten().map(|(d, id)| (ModuleEntry::StrongsDef(d), id)).collect_vec()
                },
                Module::Commentary(commentary) => commentary.entries.iter().filter(|e| {
                    e.references.iter().any(|v| is_word_ref_id(v) && v.has_verse_word(verse, word))
                })
                    .map(|e| (ModuleEntry::Commentary(e), commentary.config.id.clone()))
                    .collect_vec(),
                Module::Notebook(notebook) => notebook.entries.iter().filter(|e| {
                    match e 
                    {
                        NotebookEntry::Highlight { references, .. } => {
                            references.iter()
                                .any(|v| is_word_ref_id(v) && v.has_verse_word(verse, word))
                        },
                        NotebookEntry::Note { references, .. } => {
                            references.iter()
                                .any(|v| is_word_ref_id(v) && v.has_verse_word(verse, word))
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
                        NotebookEntry::Highlight { .. } => false,
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
                        NotebookEntry::Highlight { .. } => false,
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
    
    fn fetch_words_have_entries(&self, words: &[(VerseId, NonZeroU32)], bible: &ModuleId) -> Vec<(VerseId, NonZeroU32)> 
    {
        let binding = self.get_mod(bible).as_ref().unwrap()
            .as_bible();
        let bible_mod = binding.as_ref().unwrap();

        let mut no_entry_words: HashSet<_> = words.iter().cloned().collect();

        let mut word_datas = no_entry_words.iter().map(|(v, w)| {
            let data = bible_mod.source.verses
                .get(v).as_ref().unwrap()
                .words[w.get() as usize - 1].clone();
            ((*v, *w), data)
        }).collect::<HashMap<_, _>>();

        for module in self.modules.values() 
        {
            match module
            {
                Module::Dictionary(dictionary) => {
                    let mut found_words = vec![];
                    for (k, v) in &word_datas
                    {
                        let found = dictionary.find(&v.text)
                            .map(|e| vec![(ModuleEntry::Dictionary(e), module.id().clone())])
                            .is_some();

                        if found
                        {
                            found_words.push(k.clone());
                        }
                    }

                    for f in found_words
                    {
                        word_datas.remove(&f);
                        no_entry_words.remove(&f);
                    }
                },
                Module::XRef(xrefs) => xrefs.entries.iter().for_each(|e| {
                    let mut found_words = vec![];
                    for &(verse, word) in &no_entry_words
                    {
                        let found = match e 
                        {
                            XRefEntry::Directed { source, .. } => is_word_ref_id(source) && source.has_verse_word(verse, word),
                            XRefEntry::Mutual { refs, .. } => {
                                refs.iter().any(|r| is_word_ref_id(r) && r.has_verse_word(verse, word))
                            },
                        };

                        if found 
                        {
                            found_words.push((verse, word));
                        }
                    }

                    for f in found_words
                    {
                        word_datas.remove(&f);
                        no_entry_words.remove(&f);
                    }
                }),
                Module::StrongsLinks(links) => {
                    if links.config.bible != *bible { continue; }

                    let mut found_words = vec![];
                    for &(verse, word) in &no_entry_words
                    {
                        let Some(links) = links.get_links(&verse) else { continue; };
                        let found = links.words.iter().find(|w| match w.range {
                            WordRange::Single(s) => s == word,
                            WordRange::Range(s, e) => s <= word && e >= word,
                        }).is_some();

                        if found
                        {
                            found_words.push((verse, word));
                        }
                    }

                    for f in found_words
                    {
                        word_datas.remove(&f);
                        no_entry_words.remove(&f);
                    }
                },
                Module::Commentary(commentary) => commentary.entries.iter().for_each(|e| {
                    let mut found_words = vec![];
                    for &(verse, word) in &no_entry_words
                    {
                        let found = e.references.iter().any(|v| is_word_ref_id(v) && v.has_verse_word(verse, word));
                        if found
                        {
                            found_words.push((verse, word));
                        }
                    }

                    for f in found_words
                    {
                        word_datas.remove(&f);
                        no_entry_words.remove(&f);
                    }
                }),
                Module::Notebook(notebook) => notebook.entries.iter().for_each(|e| {
                    let mut found_words = vec![];
                    for &(verse, word) in &no_entry_words
                    {
                        let found = match e {
                            NotebookEntry::Highlight { references, .. } => {
                                references.iter()
                                    .any(|v| is_word_ref_id(v) && v.has_verse_word(verse, word))
                            },
                            NotebookEntry::Note { references, .. } => {
                                references.iter()
                                    .any(|v| is_word_ref_id(v) && v.has_verse_word(verse, word))
                            },
                        };

                        if found
                        {
                            found_words.push((verse, word));
                        }
                    }

                    for f in found_words
                    {
                        word_datas.remove(&f);
                        no_entry_words.remove(&f);
                    }
                }),
                _ => {}
            }
        };

        words.iter().filter(|w| !no_entry_words.contains(&w)).cloned().collect()
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

fn is_word_ref_id(r: &RefId) -> bool
{
    match r.id
    {
        RefIdInner::Single(atom) => {
            match atom 
            {
                Atom::Word { .. } => true,
                _ => false,
            }
        },
        RefIdInner::Range { from, to } => {
            match (to, from)
            {
                (Atom::Word { .. }, _) => true,
                (_, Atom::Word { .. }) => true,
                _ => false,
            }
        },
    }
}