use std::sync::{Arc, Mutex};

use tauri::State;

pub type AppState<'a, T> = State<'a, AppStateInner<T>>;

pub struct AppStateInner<T>(Arc<Mutex<T>>) 
    where T : Send + Sync + 'static;

impl<T> AppStateInner<T> where T : Send + Sync + 'static
{
    pub fn new(value: T) -> Self 
    {
        Self(Arc::new(Mutex::new(value)))
    }

    pub fn visit<F, R>(&self, f: F) -> R 
        where F: FnOnce(&mut T) -> R
    {
        let mut binding = self.0.lock().unwrap();
        f(&mut binding)
    }

    pub fn set_inner(&self, value: T)
    {
        let mut binding = self.0.lock().unwrap();
        *binding = value;
    }
}


impl<T> AppStateInner<T> where T : Send + Sync + 'static + Clone
{
    pub fn clone_inner(&self) -> T 
    {
        self.0.lock().unwrap().clone()
    }
}