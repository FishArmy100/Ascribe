pub mod printing_cmd;
pub mod printing_state;
pub mod print_bible_format;
pub mod writer;
pub mod fonts;

use biblio_json::core::VerseRangeIter;
use biblio_json::modules::Module;
use biblio_json::{Package, core::VerseId, modules::ModuleId};
use itertools::Itertools;

use crate::bible::printing::print_bible_format::PrintBibleFormat;
use crate::bible::printing::writer::{BiblePdfWriter, WriterOp};
use crate::bible::render::{VerseRenderData, fetch_verse_render_data};

#[derive(Debug, Clone)]
pub struct PrintBibleRange
{
    pub bible: ModuleId,
    pub from: VerseId,
    pub to: VerseId,
}

pub struct PrintBibleArgs<'a>
{
    pub format: &'a PrintBibleFormat,
    pub ranges: &'a [PrintBibleRange],
    pub package: &'a Package,
}

pub fn print_bible(args: PrintBibleArgs) -> Result<Vec<u8>, String>
{
    let PrintBibleArgs { 
        format, 
        ranges, 
        package 
    } = args;

    let mut writer = BiblePdfWriter::new(format, package);
    
    for (i, range) in ranges.iter().enumerate()
    {
        if i != 0 && format.new_page_per_section
        {
            writer.new_page();
        }

        let render_data = fetch_range_render_data(range, package);
        writer.write_title(range);
        for verse in render_data
        {
            writer.write_verse(&verse);
            writer.verse_return();
        }
    }

    writer.build()
}

fn fetch_range_render_data(range: &PrintBibleRange, package: &Package) -> Vec<VerseRenderData>
{
    let bible = package.modules.get(&range.bible)
        .map(Module::as_bible)
        .flatten()
        .unwrap();

    let verses = VerseRangeIter::from_verses(&bible.source.book_infos, range.from, range.to).collect_vec();
    
    let module_ids = package.modules.keys()
        .map(Clone::clone)
        .collect();

    let bible_id = &bible.config.id;
    fetch_verse_render_data(package, &verses, bible_id, &module_ids)
}