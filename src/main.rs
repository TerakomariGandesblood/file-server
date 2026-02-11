use std::net::{IpAddr, SocketAddr};

use anyhow::Result;
use clap::Parser;
use file_server::Args;
use mimalloc::MiMalloc;
use tokio::net::TcpListener;

#[global_allocator]
static GLOBAL: MiMalloc = MiMalloc;

#[tokio::main]
async fn main() -> Result<()> {
    let args = Args::parse();
    let _guard = file_server::init_log(&args.verbose, "log", env!("CARGO_CRATE_NAME"));

    let router = file_server::router(&args);
    let listener = TcpListener::bind(SocketAddr::new(IpAddr::V4(args.host), args.port)).await?;
    tracing::info!("listening on {}", listener.local_addr()?);

    axum::serve(listener, router)
        .with_graceful_shutdown(file_server::shutdown_signal())
        .await?;

    Ok(())
}
