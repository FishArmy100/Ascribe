use itertools::Itertools;
use jaq_core::{data, unwrap_valr, Compiler, Ctx, Vars};
use jaq_core::load::{Arena, File, Loader};
use jaq_json::{read, Val};

pub fn run_query(query: &str, json: &str) -> Result<Vec<Val>, String>
{
    let input = read::parse_single(&json.as_bytes()).unwrap();
    let program = File { code: query, path: () };

    // named filters, such as `keys`, `map`, ...
    let defs = jaq_core::defs().chain(jaq_std::defs()).chain(jaq_json::defs());
    let funs = jaq_core::funs().chain(jaq_std::funs()).chain(jaq_json::funs());

    let loader = Loader::new(defs);
    let arena = Arena::default();

    // parse the filter
    let modules = loader.load(&arena, program).unwrap();

    // compile the filter
    let filter = jaq_core::Compiler::default()
        .with_funs(funs)
        .compile(modules)
        .unwrap();

    let ctx = Ctx::<data::JustLut<Val>>::new(&filter.lut, Vars::new([]));
    let result: Result<Vec<_>, _> = filter.id.run((ctx, input)).map(unwrap_valr).collect();

    result.map_err(|e| e.to_string())
}

pub fn get_save_version(src: &str) -> u32 
{
    
}

pub fn migrate_save(src: &str) -> String 
{
    
}