use std::net::SocketAddr;
use std::time::Duration;

use anyhow::Result;
use axum_server::Handle;
use clap::Parser;
use file_server::Args;
use mimalloc::MiMalloc;

#[global_allocator]
static GLOBAL: MiMalloc = MiMalloc;

#[tokio::main]
async fn main() -> Result<()> {
    let args = Args::parse();
    let _guard = file_server::init_log(&args.verbose, "log", env!("CARGO_CRATE_NAME"));

    if let Some(shell) = args.completion {
        file_server::generate_completion(shell)?;
        return Ok(());
    }

    let handle = Handle::new();
    let handle_clone = handle.clone();
    tokio::spawn(async move {
        file_server::shutdown_signal().await;
        handle_clone.graceful_shutdown(Some(Duration::from_secs(10)));
    });

    let addr = SocketAddr::from((args.host, args.port));
    tracing::info!("listening on {addr}");

    let rustls_config = file_server::rustls_config().await?;
    let router = file_server::router(&args);

    axum_server::bind_rustls(addr, rustls_config)
        .handle(handle)
        .serve(router.into_make_service())
        .await?;

    Ok(())
}
