use std::str::FromStr;

use biblio_json::core::StrongsNumber;

use crate::searching::SearchParseError;



#[derive(Debug)]
pub enum SearchPhrase
{
    Exact(Vec<String>),
    Strongs(StrongsNumber),
    Word(String),
    Union(Vec<SearchPhrase>),
}


impl SearchPhrase
{
    pub fn parse(src: &str) -> Result<Vec<Self>, SearchParseError> 
    {
        let tokens = tokenize(src);
        let mut parser = Parser::new(tokens);

        let mut result = Vec::new();
        while parser.peek().is_some() 
        {
            if let Some(section) = parser.parse_phrase() 
            {
                result.push(section);
            } 
            else 
            {
                return Err(SearchParseError::InvalidSearchPhrase);
            }
        }

        Ok(result)
    }
}

#[derive(Debug, Clone, PartialEq)]
enum Token {
    Word(String),
    Quoted(String),
    Pipe,
    LParen,
    RParen,
}

fn tokenize(input: &str) -> Vec<Token> {
    let mut tokens = Vec::new();
    let mut chars = input.chars().peekable();

    while let Some(&ch) = chars.peek() {
        match ch 
        {
            ' ' | '\t' | '\n' => { chars.next(); } // skip whitespace
            '"' => {
                chars.next(); // consume "
                let mut buf = String::new();
                while let Some(&c) = chars.peek() {
                    chars.next();
                    if c == '"' { break; }
                    buf.push(c);
                }
                tokens.push(Token::Quoted(buf));
            }
            '|' => { chars.next(); tokens.push(Token::Pipe); }
            '(' => { chars.next(); tokens.push(Token::LParen); }
            ')' => { chars.next(); tokens.push(Token::RParen); }
            _ => {
                let mut buf = String::new();
                while let Some(&c) = chars.peek() {
                    if c.is_whitespace() || c == '|' || c == '(' || c == ')' { break; }
                    buf.push(c);
                    chars.next();
                }
                tokens.push(Token::Word(buf));
            }
        }
    }
    tokens
}

/// ===== Parser =====
struct Parser {
    tokens: Vec<Token>,
    pos: usize,
}

impl Parser 
{
    fn new(tokens: Vec<Token>) -> Self 
    {
        Self { tokens, pos: 0 }
    }

    fn peek(&self) -> Option<&Token> 
    {
        self.tokens.get(self.pos)
    }

    fn next(&mut self) -> Option<Token> 
    {
        if self.pos < self.tokens.len() 
        {
            self.pos += 1;
            Some(self.tokens[self.pos - 1].clone())
        } 
        else 
        {
            None
        }
    }

    fn parse_phrase(&mut self) -> Option<SearchPhrase> 
    {
        let mut parts = Vec::new();
        while let Some(sec) = self.parse_primary() 
        {
            parts.push(sec);
            if let Some(Token::Pipe) = self.peek() 
            {
                self.next(); // consume |
                continue;
            } 
            else 
            {
                break;
            }
        }

        if parts.len() > 1 
        {
            Some(SearchPhrase::Union(parts))
        } 
        else 
        {
            parts.pop()
        }
    }

    fn parse_primary(&mut self) -> Option<SearchPhrase> 
    {
        match self.peek()? 
        {
            Token::Quoted(_) | Token::Word(_) | Token::LParen => 
            {
                match self.next()? 
                {
                    Token::Quoted(text) => 
                    {
                        let words = text
                            .split_whitespace()
                            .map(|s| s.to_string())
                            .collect::<Vec<_>>();
                        Some(SearchPhrase::Exact(words))
                    }
                    Token::Word(word) => 
                    {
                        if let Ok(num) = StrongsNumber::from_str(&word) 
                        {
                            Some(SearchPhrase::Strongs(num))
                        } 
                        else 
                        {
                            // We treat each separate word as a Word section
                            Some(SearchPhrase::Word(word))
                        }
                    }
                    Token::LParen => 
                    {
                        let mut inner_parts = Vec::new();
                        while let Some(tok) = self.peek() 
                        {
                            if matches!(tok, Token::RParen) 
                            {
                                self.next(); // consume )
                                break;
                            }
                            if let Some(p) = self.parse_phrase() 
                            {
                                inner_parts.push(p);
                                if let Some(Token::Pipe) = self.peek() 
                                {
                                    self.next(); // consume |
                                    continue;
                                }
                            } 
                            else 
                            {
                                break;
                            }
                        }
                        if inner_parts.len() == 1 
                        {
                            Some(inner_parts.remove(0))
                        } 
                        else 
                        {
                            Some(SearchPhrase::Union(inner_parts))
                        }
                    }
                    _ => None,
                }
            }
            _ => None,
        }
    }
}