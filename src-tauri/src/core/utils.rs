use std::str::FromStr;

use regex::Captures;



pub fn load_capture<T>(captures: &Captures, name: &str) -> Option<T>
    where T: FromStr,
{
    captures.name(name).and_then(|c| c.as_str().parse().ok())
}