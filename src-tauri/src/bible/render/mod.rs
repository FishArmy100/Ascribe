pub mod verse_renderer;
pub mod search_renderer;
pub mod render_data;

use itertools::Itertools;
pub use verse_renderer::*;
pub use search_renderer::*;
pub use render_data::*;

struct WrapTagArgs<'a>
{
    tag: &'a str,
    classes: Option<&'a [&'a str]>,
    data: Option<&'a [(&'a str, &'a str)]>,
    content: &'a str,
}

fn wrap_tag(args: WrapTagArgs) -> String 
{
    let WrapTagArgs { tag, classes, data, content } = args; 

    match (classes, data)
    {
        (Some(classes), Some(data)) => {
            let data = data.iter().map(|(n, d)| format!("{}=\"{}\"", n, d)).join(" ");
            format!("<{} class=\"{}\" {}>{}</{}>", tag, classes.iter().join(" "), data, content, tag)
        }
        (Some(classes), None) => {
            format!("<{} class=\"{}\">{}</{}>", tag, classes.iter().join(" "), content, tag)
        }
        (None, Some(data)) => {
            let data = data.iter().map(|(n, d)| format!("{}=\"{}\"", n, d)).join(" ");
            format!("<{} {}>{}</{}>", tag, data, content, tag) 
        }
        (None, None) => { 
            format!("<{}>{}</{}>", tag, content, tag) 
        }
    }
}
