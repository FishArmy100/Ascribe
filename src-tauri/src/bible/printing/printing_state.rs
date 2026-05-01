use std::sync::{Arc, Mutex};

use crate::bible::printing::PrintBibleFormat;

#[derive(Debug)]
pub struct PrintBibleState
{
    inner: Arc<Mutex<PrintBibleStateInner>>,
}

impl PrintBibleState
{
    pub fn new() -> Self 
    {
        Self 
        {
            inner: Arc::new(Mutex::new(PrintBibleStateInner { 
                format: PrintBibleFormat::default() 
            }))
        }
    }

    pub fn visit<F, R>(&self, f: F) -> R 
        where F : FnOnce(&mut PrintBibleStateInner) -> R 
    {
        let mut binding = self.inner.lock().unwrap();
        f(&mut binding)
    }
}

#[derive(Debug)]
pub struct PrintBibleStateInner
{
    pub format: PrintBibleFormat,
}