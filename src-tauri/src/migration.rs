use jaq_core::Compiler;


pub fn get_compiler() -> Compiler<String>
{
    let input = r#"["Hello", "world"]"#;
    let input = read::parse_single(&input.as_bytes()).unwrap();
    let program = File { code: ".[]", path: () };

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
}

pub fn get_save_version(src: &str) -> u32 
{

}

pub fn migrate_save(src: &str) -> String 
{
    
}