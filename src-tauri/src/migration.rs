use jaq_core::{data, unwrap_valr, Ctx, Vars};
use jaq_core::load::{Arena, File, Loader};
use jaq_json::{read, Val};
use jaq_std::ValT;

pub const V0_TO_V1_MIGRATION: &str = include_str!("../../migrations/v0-to-v1.jq");

lazy_static::lazy_static! 
{
    static ref CONVERSIONS: Vec<String> = vec![
        V0_TO_V1_MIGRATION.to_string(),
    ];
}


pub fn run_query(query: &str, json: &str) -> Result<Vec<Val>, String>
{
    let input = read::parse_single(&json.as_bytes()).unwrap();
    let program = File { code: query, path: () };

    // named filters, such as `keys`, `map`, ...
    let defs = jaq_core::defs().chain(jaq_std::defs()).chain(jaq_json::defs());
    let funcs = jaq_core::funs().chain(jaq_std::funs()).chain(jaq_json::funs());

    let loader = Loader::new(defs);
    let arena = Arena::default();

    // parse the filter
    let modules = loader.load(&arena, program).unwrap();

    // compile the filter
    let filter = jaq_core::Compiler::default()
        .with_funs(funcs)
        .compile(modules)
        .unwrap();

    let ctx = Ctx::<data::JustLut<Val>>::new(&filter.lut, Vars::new([]));
    let result: Result<Vec<_>, _> = filter.id.run((ctx, input)).map(unwrap_valr).collect();

    result.map_err(|e| e.to_string())
}

pub fn get_save_version(src: &str) -> u32 
{
    const QUERY: &str = ".save_version";
    run_query(QUERY, src).ok()
        .and_then(|v| v.first().cloned())
        .and_then(|v| v.as_isize())
        .map(|v| v as u32)
        .unwrap_or_default()
}

pub fn migrate_save(src: &str) -> Result<String, String> 
{
    let version = get_save_version(src);
    let mut json = src.to_string();

    for i in version..(CONVERSIONS.len() as u32)
    {
        
        let pp = if cfg!(debug_assertions)
        {
            jaq_json::write::Pp {
                indent: Some("  ".to_string()),
                sep_space: true,
                ..Default::default()
            }
        }
        else { jaq_json::write::Pp::default() };

        let level = 0;
        let query = &CONVERSIONS[i as usize];
        
        let res = run_query(&query, &json)?;
        let val = res.first().unwrap();
        assert_eq!(res.len(), 1);

        let mut buffer: Vec<u8> = vec![];
        jaq_json::write::write(&mut buffer, &pp, level, val).map_err(|e| e.to_string())?;
        json = String::from_utf8(buffer).map_err(|e| e.to_string())?;
    }

    Ok(json)
}