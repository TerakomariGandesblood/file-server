use std::env;
use std::path::PathBuf;

use anyhow::Result;

fn main() -> Result<()> {
    cmd_lib::run_cmd! {
        cd web;
        bun install;
        bun run build;
    }?;

    unsafe {
        env::set_var("MEMORY_SERVE_QUIET", "1");
    }
    memory_serve::load_directory(PathBuf::from("web").join("out"));

    Ok(())
}
