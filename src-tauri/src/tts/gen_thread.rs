use std::{collections::VecDeque, ops::DerefMut, thread::{self, JoinHandle}};

use biblio_json::modules::Module;
use tauri::{AppHandle, Manager};

use crate::{bible::BiblioJsonPackageHandle, core::utils::Shared, tts::{VerseAudioData, VerseAudioKey, VerseAudioLibrary, synth::SpeechSynth, voices::AppVoices}};

pub struct TtsGenThread(Shared<TtsGenThreadInner>);

impl TtsGenThread
{
    pub fn new(app: AppHandle) -> Self
    {
        Self(Shared::new(TtsGenThreadInner::new(app)))
    }

    pub fn visit<F, R>(&self, f: F) -> R 
        where F : FnOnce(&mut TtsGenThreadInner) -> R 
    {
        let mut binding = self.0.get();
        f(&mut binding)
    }
}

pub struct TtsGenThreadInner
{
    queue: Shared<VecDeque<VerseAudioKey>>,
    synth: Shared<Option<SpeechSynth>>,
    join_handle: Option<JoinHandle<()>>,
    app: AppHandle,
}

impl TtsGenThreadInner
{
    pub fn new(app: AppHandle) -> Self 
    {
        Self {
            queue: Shared::default(),
            synth: Shared::default(),
            join_handle: None,
            app,
        }
    }

    pub fn enqueue(&mut self, verses: impl Iterator<Item = VerseAudioKey>)
    {
        let mut queue = self.queue.get();
        queue.extend(verses);
        drop(queue);

        if self.join_handle.is_none()
        {
            self.spawn_thread();
        }
        else if let Some(handle) = &self.join_handle
        {
            if handle.is_finished()
            {
                self.join_handle.take().unwrap().join().unwrap();
                self.spawn_thread();
            }
        }
    }

    pub fn clear(&mut self)
    {
        self.queue.get().clear();
    }

    fn spawn_thread(&mut self)
    {
        let queue = self.queue.clone();
        let synth = self.synth.clone();
        let package = self.app.state::<BiblioJsonPackageHandle>().inner().clone();
        let voices = self.app.state::<AppVoices>().inner().clone();
        let library = self.app.state::<VerseAudioLibrary>().inner().clone();
        
        self.join_handle = Some(thread::spawn(move || {
            while let Some(ref key) = {
                let mut binding = queue.get();
                binding.pop_front()
            }
            {
                if library.visit(|l| l.contains(key))
                {
                    continue;
                }

                let verse = package.visit(|p| {
                    let bible = p.get_mod(&key.bible)
                        .and_then(Module::as_bible)
                        .unwrap();

                    bible.source.verses.get(&key.verse).unwrap().clone()
                });

                let mut synth_binding = synth.get();
                let synth = match synth_binding.deref_mut()
                {
                    Some(synth) => 
                    {
                        if synth.voice().id != key.voice
                        {
                            let voice = voices.get_voice(&key.voice).unwrap().clone();
                            *synth_binding = Some(SpeechSynth::new(voice));
                        }

                        synth_binding.as_mut().unwrap()
                    },
                    None => 
                    {
                        let voice = voices.get_voice(&key.voice).unwrap().clone();
                        *synth_binding = Some(SpeechSynth::new(voice));
                        synth_binding.as_mut().unwrap()
                    } 
                };

                let data = synth.synth_verse(&verse);
                let duration = data.duration().as_secs_f32();
                let verse_audio = VerseAudioData {
                    key: key.clone(),
                    data,
                    duration,
                };

                library.visit(|l| {
                    l.insert(verse_audio);
                });
            }
        }))
    }
}