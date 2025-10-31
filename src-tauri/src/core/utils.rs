use std::{str::FromStr, sync::{Arc, Mutex, MutexGuard}};

use regex::Captures;
use uuid::Uuid;

pub fn load_capture<T>(captures: &Captures, name: &str) -> Option<T>
    where T: FromStr,
{
    captures.name(name).and_then(|c| c.as_str().parse().ok())
}

pub fn get_uuid() -> String
{
    Uuid::new_v4().to_string()
}

#[derive(Debug)]
pub struct Shared<T>(Arc<Mutex<T>>);

impl<T> Shared<T>
{
    pub fn new(v: T) -> Self
    {
        Self(Arc::new(Mutex::new(v)))
    }

    pub fn get(&self) -> MutexGuard<'_, T>
    {
        self.0.lock().unwrap()
    }

    pub fn inner(&self) -> &Arc<Mutex<T>>
    {
        &self.0
    }
}

impl<T> From<Arc<Mutex<T>>> for Shared<T>
{
    fn from(value: Arc<Mutex<T>>) -> Self 
    {
        Self(value)
    }
}

impl<T> From<Shared<T>> for Arc<Mutex<T>>
{
    fn from(value: Shared<T>) -> Self 
    {
        value.0
    }
}

impl<T> Clone for Shared<T>
{
    fn clone(&self) -> Self 
    {
        Self(self.0.clone())
    }
}

pub fn dedup_by_predicate<T, F>(items: Vec<T>, mut predicate: F) -> Vec<T>
    where T: Clone,
          F: FnMut(&T, &T) -> bool,
{
    let mut result = Vec::new();
    for item in items {
        if !result.iter().any(|x| predicate(x, &item)) {
            result.push(item);
        }
    }
    result
}