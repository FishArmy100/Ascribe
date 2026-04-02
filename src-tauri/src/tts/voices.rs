use biblio_json::core::lang::Language;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use tauri::{Runtime, path::{BaseDirectory, PathResolver}};
use std::{collections::HashMap, fs, ops::Deref, path::{Path, PathBuf}};

use crate::core::utils::get_uuid;

const VOICES_PATH: &str = "resources/tts-data/voices";
const VOICE_NAME_FILE_PATH: &str = "resources/tts-data/voices/voice_name_map.json";

pub struct AppVoices
{
    voices: HashMap<String, VoiceConfig>,
}

impl AppVoices
{
    pub fn load<R>(resolver: &PathResolver<R>) -> Self 
        where R : Runtime
    {
        let configs_json = VoiceConfigJson::load_configs(resolver);
        let voices_name_map_path = resolver.resolve(VOICE_NAME_FILE_PATH, BaseDirectory::Resource).unwrap();
        let content = fs::read_to_string(voices_name_map_path).unwrap();
        let voices_name_map = serde_json::from_str::<HashMap::<String, String>>(&content).unwrap();

        let voices = configs_json.into_iter()
            .map(|json| VoiceConfig::new(json, resolver, &voices_name_map))
            .map(|json| (json.id.clone(), json))
            .collect::<HashMap<_, _>>();

        Self 
        {
            voices,
        }
    }

    pub fn voices(&self) -> impl IntoIterator<Item = VoiceConfig>
    {
        self.voices.values()
    }

    pub fn voices_by_language<'a>(&'a self, language: &str) -> Vec<&'a VoiceConfig>
    {
        let Some(language) = Language::new(language).ok() else {
            return vec![];
        };
        
        self.voices().iter().filter(|v| {
            Language::new(&v.language.get_iso_639_1_code()).unwrap() == language
        }).collect_vec()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceConfig 
{
    pub id: String,
    pub name: String,
    pub onnx_path: String,
    pub config_path: String,
    pub json: VoiceConfigJson,
}

impl VoiceConfig
{
    pub fn new<R>(json: VoiceConfigJson, resolver: &PathResolver<R>, name_map: &HashMap<String, String>) -> Self 
        where R : Runtime
    {
        let onnx_path = json.get_onnx_path(resolver)
            .to_str()
            .unwrap()
            .to_string();

        let config_path = json.get_config_path(resolver)
            .to_str()
            .unwrap()
            .to_string();

        let name = name_map.get(&json.dataset)
            .expect(&format!("Dataset {} does not have a name alias", &json.dataset))
            .clone();

        let id = get_uuid();

        Self {
            id,
            onnx_path,
            config_path,
            name,
            json,
        }
    }
}

impl Deref for VoiceConfig
{
    type Target = VoiceConfigJson;

    fn deref(&self) -> &Self::Target 
    {
        &self.json
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceConfigJson
{
    pub audio: VoiceConfigAudio,
    pub espeak: VoiceConfigEspeak,
    pub inference: VoiceConfigInference,
    pub phoneme_type: Option<String>,
    pub phoneme_map: HashMap<String, Vec<u32>>,
    pub phoneme_id_map: HashMap<String, Vec<u32>>,
    pub num_symbols: u32,
    pub num_speakers: u32,
    pub speaker_id_map: HashMap<String, Vec<u32>>,
    pub piper_version: String,
    pub language: VoiceConfigLanguage,
    pub dataset: String,
}

impl VoiceConfigJson
{
    pub fn load_configs<R>(resolver: &PathResolver<R>) -> Vec<Self>
        where R : Runtime
    {
        let voice_dir = resolver.resolve(VOICES_PATH, BaseDirectory::Resource).unwrap();
        let mut configs = vec![];

        for entry in fs::read_dir(voice_dir).unwrap()
        {
            let path = entry.unwrap().path();
            if path.is_file() && 
               path.extension().is_some_and(|s| s == "json") && 
               path.file_prefix().is_some_and(|p| p != "voice_name_map")
            {
                let contents = fs::read_to_string(path).unwrap();
                let config: Self = serde_json::from_str(&contents).unwrap();
                configs.push(config);
            }
        }

        configs
    }

    pub fn get_onnx_path<R>(&self, resolver: &PathResolver<R>) -> PathBuf 
        where R : Runtime
    {
        let name = format!("{}-{}-{}.onnx",
            self.language.code,
            self.dataset,
            self.audio.quality,
        );
        
        let voice_dir = resolver.resolve(VOICES_PATH, BaseDirectory::Resource).unwrap();
        let path = Path::new(&voice_dir);
        let path = path.join(&name);
        path
    }

    pub fn get_config_path<R>(&self, resolver: &PathResolver<R>) -> PathBuf
        where R : Runtime
    {
        let name = format!("{}-{}-{}.onnx.json",
            self.language.code,
            self.dataset,
            self.audio.quality,
        );
        
        let voice_dir = resolver.resolve(VOICES_PATH, BaseDirectory::Resource).unwrap();
        let path = Path::new(&voice_dir);
        let path = path.join(&name);
        path
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceConfigAudio 
{
    pub sample_rate: u32,
    pub quality: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceConfigEspeak 
{
    pub voice: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceConfigInference 
{
    pub noise_scale: f32,
    pub length_scale: f32,
    pub noise_w: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceConfigLanguage 
{
    pub code: String,
    pub family: String,
    pub region: String,
    pub name_native: String,
    pub name_english: String,
    pub country_english: String,
}

impl VoiceConfigLanguage
{
    pub fn get_iso_639_1_code(&self) -> String 
    {
        self.code[0..2].to_string()
    }
}