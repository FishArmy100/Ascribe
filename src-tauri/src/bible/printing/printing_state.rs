use std::sync::{Arc, Mutex};

use crate::bible::printing::PrintBibleFormat;


pub struct PrintBibleState
{
    inner: Arc<Mutex<PrintBibleStateInner>>,
}

impl PrintBibleState
{
    pub fn visit<F, R>(f: F) -> R 
        where F : FnOnce(&mut PrintBibleStateInner) -> R 
    {
           
    }
}

pub struct PrintBibleStateInner
{
    pub format: PrintBibleFormat,
}