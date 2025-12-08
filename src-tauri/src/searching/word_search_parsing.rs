use std::str::{Chars, FromStr};
use std::iter::Peekable;

use biblio_json::core::StrongsNumber;

use crate::searching::word_search_engine::WordSearchPart;

#[derive(Debug, Clone)]
pub enum WordSearchToken
{
    Word(String),
    Strongs(String),
    Quote(String),
    LParen,
    RParen,
    Or,
    Not,
    EOF,
}

struct WordSearchLexer<'a>
{
    input: Peekable<Chars<'a>>,
}

impl<'a> WordSearchLexer<'a>
{
    fn new(s: &'a str) -> Self
    {
        WordSearchLexer { input: s.chars().peekable() }
    }

    fn next_token(&mut self) -> WordSearchToken
    {
        self.consume_ws();

        match self.input.peek()
        {
            Some('"') =>
            {
                self.input.next();
                let mut val = String::new();
                while let Some(&c) = self.input.peek()
                {
                    if c == '"' { self.input.next(); break; }
                    val.push(c);
                    self.input.next();
                }
                WordSearchToken::Quote(val)
            }
            Some('(') =>
            {
                self.input.next();
                WordSearchToken::LParen
            }
            Some(')') =>
            {
                self.input.next();
                WordSearchToken::RParen
            }
            Some(_) =>
            {
                let word = self.consume_word();

                match word.to_uppercase().as_str()
                {
                    "OR" => WordSearchToken::Or,
                    "NOT" => WordSearchToken::Not,
                    _ =>
                    {
                        if word.len() >= 2
                            && (word.starts_with('G') || word.starts_with('H'))
                            && word[1..].chars().all(|c| c.is_ascii_digit())
                        {
                            WordSearchToken::Strongs(word)
                        }
                        else
                        {
                            WordSearchToken::Word(word)
                        }
                    }
                }
            }
            None => WordSearchToken::EOF,
        }
    }

    fn consume_ws(&mut self)
    {
        while matches!(self.input.peek(), Some(c) if c.is_whitespace())
        {
            self.input.next();
        }
    }

    fn consume_word(&mut self) -> String
    {
        let mut out = String::new();
        while let Some(&c) = self.input.peek()
        {
            if c.is_whitespace() || c == '(' || c == ')' || c == '"' { break; }
            out.push(c);
            self.input.next();
        }
        out
    }
}

// ---------------- Parser ----------------

pub struct WordSearchParser<'a>
{
    lexer: WordSearchLexer<'a>,
    lookahead: WordSearchToken,
}

impl<'a> WordSearchParser<'a>
{
    pub fn new(input: &'a str) -> Self
    {
        let mut lexer = WordSearchLexer::new(input);
        let lookahead = lexer.next_token();
        WordSearchParser { lexer, lookahead }
    }

    fn consume(&mut self) -> WordSearchToken
    {
        let current = std::mem::replace(&mut self.lookahead, self.lexer.next_token());
        current
    }

    pub fn parse(&mut self) -> Result<WordSearchPart, String>
    {
        self.parse_or()
    }

    // --- OR level ---
    fn parse_or(&mut self) -> Result<WordSearchPart, String>
    {
        let mut parts = vec![self.parse_and()?];

        while let WordSearchToken::Or = self.lookahead
        {
            self.consume();
            parts.push(self.parse_and()?);
        }

        Ok(if parts.len() == 1
        {
            parts.pop().unwrap()
        }
        else
        {
            WordSearchPart::Or(parts)
        })
    }

    // --- Implicit AND level ---
    fn parse_and(&mut self) -> Result<WordSearchPart, String>
    {
        let mut parts = Vec::new();

        while !matches!(self.lookahead, WordSearchToken::Or | WordSearchToken::RParen | WordSearchToken::EOF)
        {
            parts.push(self.parse_not()?);
        }

        Ok(if parts.len() == 1
        {
            parts.pop().unwrap()
        }
        else
        {
            WordSearchPart::And(parts)
        })
    }

    // --- NOT level ---
    fn parse_not(&mut self) -> Result<WordSearchPart, String>
    {
        if let WordSearchToken::Not = self.lookahead
        {
            self.consume();
            Ok(WordSearchPart::Not(Box::new(self.parse_primary()?)))
        }
        else
        {
            self.parse_primary()
        }
    }

    // --- Primary: words, strongs, sequences, groups ---
    fn parse_primary(&mut self) -> Result<WordSearchPart, String>
    {
        match self.consume()
        {
            WordSearchToken::Word(w) =>
                Ok(WordSearchPart::Word(w)),

            WordSearchToken::Strongs(s) =>
            {
                let sn = StrongsNumber::from_str(&s)
                    .map_err(|e| format!("Strongs error: {}", e))?;
                Ok(WordSearchPart::Strongs(sn))
            }

            WordSearchToken::Quote(q) =>
            {
                let mut seq = Vec::new();

                for tok in q.split_whitespace()
                {
                    if let Ok(sn) = StrongsNumber::from_str(tok)
                    {
                        seq.push(WordSearchPart::Strongs(sn));
                    }
                    else
                    {
                        seq.push(WordSearchPart::Word(tok.to_string()));
                    }
                }

                Ok(WordSearchPart::Sequence(seq))
            }

            WordSearchToken::LParen =>
            {
                let inside = self.parse_or()?;
                match self.consume()
                {
                    WordSearchToken::RParen => Ok(inside),
                    other => Err(format!("Expected ')', found {:?}", other)),
                }
            }

            WordSearchToken::EOF =>
                Err("Unexpected end of input".into()),

            other =>
                Err(format!("Unexpected token: {:?}", other)),
        }
    }
}