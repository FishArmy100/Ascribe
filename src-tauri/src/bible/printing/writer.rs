use std::collections::HashSet;

use biblio_json::{Package, core::{StrongsNumber, VerseId}, modules::{Module, ModuleId}};
use itertools::Itertools;
use pdf_oxide::writer::{DocumentBuilder, FluentPageBuilder};
use ttf_parser::{Face, GlyphId};

use crate::bible::{printing::{PrintBibleRange, fonts::{Font, FontVariant}, print_bible_format::{BookFormatter, PageNumbers, PrintBibleFormat, TextAlign, TextFormat, VerseNumberFormatType}}, render::{VerseRenderData, WordRenderData}};

pub struct Curser
{
    pub x: f32,
    pub y: f32,
}

pub enum WriterOp
{
    Text
    {
        text: String,
        font: Font,
        size: f32,
        x: f32,
        y: f32,
        bold: bool,
        italic: bool,
        align: TextAlign,
    },
    NewPage,
}

pub struct BiblePdfWriter<'a>
{
    format: &'a PrintBibleFormat,
    package: &'a Package,
    curser: Curser,
    ops: Vec<WriterOp>,
    page_count: u32,
}

impl<'a> BiblePdfWriter<'a>
{
    pub fn new(format: &'a PrintBibleFormat, package: &'a Package) -> Self
    {
        let curser = Curser {
            x: format.margin.left,
            y: format.margin.top,
        };

        let mut s = Self {
            curser,
            package,
            format,
            ops: vec![WriterOp::NewPage],
            page_count: 1,
        };
        s.write_page_numbers();
        s
    }
    
    pub fn new_page(&mut self)
    {
        self.ops.push(WriterOp::NewPage);
        self.page_count += 1;
        self.curser = Curser {
            x: self.format.margin.left,
            y: self.format.margin.top,
        };

        self.write_page_numbers();
    }

    fn write_page_numbers(&mut self) 
    {
        let margin = &self.format.margin;
        match &self.format.page_numbers
        {
            PageNumbers::TopLeft { font_size, bold, italic, font } => {
                self.ops.push(WriterOp::Text { 
                    text: format!("{}", self.page_count), 
                    font: *font, 
                    size: *font_size, 
                    bold: *bold, 
                    italic: *italic, 
                    align: TextAlign::Left, 
                    x: margin.left / 2.0, 
                    y: margin.top / 2.0, 
                });
            },
            PageNumbers::TopRight { font_size, bold, italic, font } => {
                let variant = FontVariant::new(*bold, *italic);
                let face = font.get_face(variant);
        
                let text = format!("{}", self.page_count);
                let width = measure_text_width(face, &text, *font_size);
    
                self.ops.push(WriterOp::Text { 
                    text: text, 
                    font: *font, 
                    size: *font_size, 
                    bold: *bold, 
                    italic: *italic, 
                    align: TextAlign::Left, 
                    x: self.format.page_size.width() - margin.right / 2.0 - width / 2.0, 
                    y: margin.top / 2.0, 
                });
            },
            PageNumbers::BottomLeft { font_size, bold, italic, font } => {
                self.ops.push(WriterOp::Text { 
                    text: format!("{}", self.page_count), 
                    font: *font, 
                    size: *font_size, 
                    bold: *bold, 
                    italic: *italic, 
                    align: TextAlign::Left, 
                    x: margin.left / 2.0, 
                    y: self.format.page_size.height() - margin.bottom / 2.0, 
                });
            },
            PageNumbers::BottomRight { font_size, bold, italic, font } => {
                let variant = FontVariant::new(*bold, *italic);
                let face = font.get_face(variant);
        
                let text = format!("{}", self.page_count);
                let width = measure_text_width(face, &text, *font_size);
    
                self.ops.push(WriterOp::Text { 
                    text: text, 
                    font: *font, 
                    size: *font_size, 
                    bold: *bold, 
                    italic: *italic, 
                    align: TextAlign::Left, 
                    x: self.format.page_size.width() - margin.right / 2.0 - width / 2.0, 
                    y: self.format.page_size.height() - margin.bottom / 2.0, 
                });
            },
            PageNumbers::None => {},
        }
    }
    
    pub fn write_verse(&mut self, render_data: &VerseRenderData)
    {
        if let Some(verse_title) = self.format_verse_title(&render_data.bible, render_data.id.into())
        {
            self.write_space(self.format.verse_format.verse_indent);
            self.write_word(&verse_title, &self.format.verse_format.verse_number_format.text_format, self.format.verse_format.line_height);
            self.write_space(self.format.verse_format.verse_number_format.spacing);
        }

        let word_spacing = self.format.verse_format.word_spacing;
        for (i, word) in render_data.words.iter().enumerate()
        {
            if i != 0
            {
                self.write_space(word_spacing);
            }

            self.write_verse_word_render_data(&word);
        }
    }

    pub fn verse_return(&mut self)
    {
        self.new_line_raw(self.format.verse_format.verse_spacing);
    }

    pub fn write_title(&mut self, range: &PrintBibleRange)
    {
        let title = self.format_title(range.from, range.to, &range.bible);
        self.write_title_raw(&title);
        self.new_line_raw(self.format.title_format.title_spacing);
    }

    fn write_title_raw(&mut self, title: &str)
    {
        let format = &self.format.title_format.text_format;
        let face = format.get_font_face();
        let width = measure_text_width(face, title, format.font_size);
        let page_width = self.format.page_size.width();
        let margin = &self.format.margin;
        
        let x = match self.format.title_format.text_align
        {
            TextAlign::Left => self.format.margin.left,
            TextAlign::Center => margin.left + (page_width - margin.right - margin.left - width) / 2.0,
            TextAlign::Right => page_width - self.format.margin.right - width,
        };
        
        self.ops.push(WriterOp::Text { 
            text: title.to_owned(), 
            font: format.font, 
            size: format.font_size, 
            x, 
            y: self.curser.y, 
            bold: format.bold, 
            italic: format.italic, 
            align: self.format.title_format.text_align.clone(),
        });

        let text_height = measure_text_height(face, format.font_size);
        self.new_line_raw(self.format.title_format.line_height * text_height);
    }

    fn format_title(&self, from: VerseId, to: VerseId, bible: &ModuleId) -> String
    {
        let module = self.package.get_mod(bible)
            .and_then(Module::as_bible)
            .unwrap();

        let book_formatter = &self.format.title_format.book_formatter;
        if from == to 
        {
            format!("{} {}:{}", book_formatter.format(bible, from.book, self.package), from.chapter, from.verse) 
        }
        else if from.book == to.book && from.chapter == to.chapter
        {
            let chapter_verse_count = module.source.book_infos.iter()
                .find(|b| b.osis_book == from.book)
                .unwrap()
                .chapters[(from.chapter.get() - 1) as usize];

            if from.verse.get() == 1 && to.verse.get() == chapter_verse_count
            {
                format!("{} {}", book_formatter.format(bible, from.book, self.package), from.chapter)
            }
            else 
            {
                format!("{} {}:{}-{}", book_formatter.format(bible, from.book, self.package), from.chapter, from.verse, to.verse)
            }
        }
        else if from.book == to.book
        {
            format!("{} {}:{} - {}:{}", 
                book_formatter.format(bible, from.book, self.package), 
                from.chapter, 
                from.verse, 
                to.chapter, 
                to.verse
            )
        }
        else 
        {
            format!("{} {}:{} - {} {}:{}",
                book_formatter.format(bible, from.book, self.package),
                from.chapter,
                from.verse,
                book_formatter.format(bible, to.book, self.package),
                to.chapter,
                to.verse,
            )    
        }
    }
    
    fn write_verse_word_render_data(&mut self, render_data: &WordRenderData)
    {
        let word_format = if render_data.italics {
            &self.format.verse_format.alt_text_format
        }
        else 
        {
            &self.format.verse_format.text_format    
        };
        let word_face = word_format.get_font_face();
        let word = &render_data.word;
        let word_width = measure_text_width(word_face, word, word_format.font_size);
        
        if let Some(strongs_format) = &self.format.strongs_format
        {
            let strongs_face = strongs_format.get_font_face();

            let strongs = &render_data.strongs.clone();
            let strongs_text = match strongs.len() 
            {
                0 => "".to_string(),
                _ => {
                    let text = strongs.iter().map(|s| StrongsNumber::from(s).to_string()).join("; ");
                    format!("[{}]", text)
                }
            };
            
            let strongs_width = measure_text_width(strongs_face, &strongs_text, strongs_format.font_size);
            let total_width = word_width + strongs_width;
            
            if self.curser.x + total_width > self.format.page_size.width() - self.format.margin.right
            {
                self.new_line(word_face, word_format.font_size, self.format.verse_format.line_height);
            }

            // word text
            self.ops.push(WriterOp::Text { 
                text: word.to_owned(), 
                font: word_format.font, 
                size: word_format.font_size, 
                x: self.curser.x, 
                y: self.curser.y, 
                bold: word_format.bold, 
                italic: word_format.italic, 
                align: TextAlign::Left,
            });

            self.curser.x += word_width;

            // strongs text
            self.ops.push(WriterOp::Text { 
                text: strongs_text.to_owned(), 
                font: strongs_format.font, 
                size: strongs_format.font_size, 
                x: self.curser.x, 
                y: self.curser.y, 
                bold: strongs_format.bold, 
                italic: strongs_format.italic, 
                align: TextAlign::Left,
            });

            self.curser.x += strongs_width;

        }
        else 
        {
            if self.curser.x + word_width > self.format.page_size.width() - self.format.margin.right
            {
                self.new_line(word_face, word_format.font_size, self.format.verse_format.line_height);
            }

            // word text
            self.ops.push(WriterOp::Text { 
                text: word.to_owned(), 
                font: word_format.font, 
                size: word_format.font_size, 
                x: self.curser.x, 
                y: self.curser.y, 
                bold: word_format.bold, 
                italic: word_format.italic, 
                align: TextAlign::Left,
            });

            self.curser.x += word_width;
        }

    }

    fn write_word(&mut self, word: &str, format: &TextFormat, line_height: f32)
    {
        let face = format.get_font_face();
        let width = measure_text_width(face, word, format.font_size);

        if self.curser.x + width > self.format.page_size.width() - self.format.margin.right
        {
            self.new_line(face, format.font_size, line_height);
        }

        self.ops.push(WriterOp::Text { 
            text: word.to_owned(), 
            font: format.font, 
            size: format.font_size, 
            x: self.curser.x, 
            y: self.curser.y, 
            bold: format.bold, 
            italic: format.italic, 
            align: TextAlign::Left,
        });

        self.curser.x += width;
    }

    fn new_line_raw(&mut self, height: f32)
    {
        self.curser.y += height;
        self.curser.x = self.format.margin.left;

        if self.curser.y > self.format.page_size.height() - self.format.margin.bottom
        {
            self.new_page();
        }
    }
    
    fn new_line(&mut self, face: &Face, font_size: f32, line_height: f32)
    {
        let text_height = measure_text_height(face, font_size);
        let height = line_height * text_height;
        self.new_line_raw(height);
    }

    fn write_space(&mut self, space: f32)
    {
        if self.curser.x + space <= self.format.page_size.width() - self.format.margin.right
        {
            self.curser.x += space;
        }
    }

    fn format_verse_title(&self, bible: &ModuleId, verse: VerseId) -> Option<String> 
    {
        match self.format.verse_format.verse_number_format.format_type
        {
            VerseNumberFormatType::Long => {
                let book = BookFormatter::Full.format(bible, verse.book, self.package);
                Some(format!("{} {}:{}", book, verse.chapter, verse.verse))
            },
            VerseNumberFormatType::Short => {
                let book = BookFormatter::Short.format(bible, verse.book, self.package);
                Some(format!("{} {}:{}", book, verse.chapter, verse.verse))
            },
            VerseNumberFormatType::Number => {
                Some(format!("{}", verse.verse))
            },
            VerseNumberFormatType::NumberText => {
                Some(format!("Verse {}", verse.verse))
            },
            VerseNumberFormatType::None => None,
        }
    }

    pub fn build(self) -> Result<Vec<u8>, String>
    {
        let mut builder = DocumentBuilder::new();

        let used_fonts = self.ops.iter().filter_map(|op| {
            match op 
            {
                WriterOp::Text { font, bold, italic, .. } => {
                    let variant = FontVariant::new(*bold, *italic);
                    Some((*font, variant))
                },
                WriterOp::NewPage => None,
            }
        }).collect::<HashSet<_>>();

        for (font, variant) in used_fonts
        {
            let font = font.get_embedded_font(variant);
            let name = font.name.clone();
            builder = builder.register_embedded_font(name, font);
        }

        let mut page: Option<FluentPageBuilder> = None;
        
        for op in self.ops
        {
            match op {
                WriterOp::Text { text, font, size, x, y, bold, italic, .. } => {
                    if page.is_none()
                    {
                        return Err("Cannot write text to empty page".into())
                    }

                    let variant = FontVariant::new(bold, italic);
                    let font_name = font.get_name(variant);

                    let face = font.get_face(variant);
                    let height = measure_text_height(face, size);
                    
                    // Un-inverts Y-Coord
                    let page_height = self.format.page_size.height();
                    page = page.map(|p|
                        p.at(x, page_height - y - height)
                            .font(&font_name, size)
                            .text(&text)
                    );
                        
                },
                WriterOp::NewPage => {
                    let page_size = self.format.page_size.to_pdf_size();
                    match page
                    {
                        Some(p) => {
                            page = Some(
                                p.done()
                                    .page(page_size)
                            );
                        },
                        None => {
                            page = Some(builder.page(page_size))
                        }
                    }
                },
            }
        }
        
        let Some(page) = page else {
            return Err("No pages were added to the pdf".into())
        };

        page.done();
        
        builder.build()
            .map_err(|e| e.to_string())
    }
}

pub fn measure_text_width(face: &Face, text: &str, font_size: f32) -> f32 
{
    let units_per_em = face.units_per_em() as f32;
    let scale = font_size / units_per_em;

    text.chars().map(|c| {
        let glyph_id = face.glyph_index(c).unwrap_or(GlyphId(0));
        let advance = face.glyph_hor_advance(glyph_id).unwrap_or(0) as f32;
        advance * scale
    }).sum()
}

pub fn measure_text_height(face: &Face, font_size: f32) -> f32 
{
    let units_per_em = face.units_per_em() as f32;
    let ascender = face.ascender() as f32;
    let descender = face.descender() as f32; // negative value
    (ascender - descender) / units_per_em * font_size
}