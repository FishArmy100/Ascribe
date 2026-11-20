fn main() 
{
    // Silence LNK4098 (defaultlib conflict) on MSVC; harmless in debug builds here
    if std::env::var("CARGO_CFG_TARGET_ENV").as_deref() == Ok("msvc") 
    {
        println!("cargo:rustc-link-arg=/IGNORE:4098");
    }
    
    tauri_build::build()
}
