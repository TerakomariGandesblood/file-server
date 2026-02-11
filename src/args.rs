use std::io;
use std::net::Ipv4Addr;

use anyhow::Result;
use clap::builder::Styles;
use clap::builder::styling::{AnsiColor, Style};
use clap::{CommandFactory, Parser, ValueEnum};
use clap_complete::Generator;
use clap_verbosity_flag::Verbosity;
use supports_color::Stream;

#[derive(Parser)]
#[command(version, about, long_about = None, styles = get_styles())]
pub struct Args {
    /// 监听地址
    #[arg(long, default_value_t = Ipv4Addr::new(127,0,0,1))]
    pub host: Ipv4Addr,

    /// 监听端口
    #[arg(long, default_value_t = 8001)]
    pub port: u16,

    /// 上传文件使用的用户名
    #[arg(long, default_value_t = String::from("terakomari"))]
    pub upload_username: String,

    /// 上传文件使用的密码
    #[arg(long, default_value_t = String::from("orange"))]
    pub upload_password: String,

    /// 生成 shell 补全到标准输出
    #[arg(long, value_enum)]
    pub completion: Option<Shell>,

    #[command(flatten)]
    pub verbose: Verbosity,
}

const HEADER: Style = AnsiColor::Green.on_default().bold();
const USAGE: Style = AnsiColor::Green.on_default().bold();
const LITERAL: Style = AnsiColor::Cyan.on_default().bold();
const PLACEHOLDER: Style = AnsiColor::Cyan.on_default();
const ERROR: Style = AnsiColor::Red.on_default().bold();
const VALID: Style = AnsiColor::Cyan.on_default().bold();
const INVALID: Style = AnsiColor::Yellow.on_default().bold();
const HELP_STYLES: Styles = Styles::styled()
    .header(HEADER)
    .usage(USAGE)
    .literal(LITERAL)
    .placeholder(PLACEHOLDER)
    .error(ERROR)
    .valid(VALID)
    .invalid(INVALID);

fn get_styles() -> Styles {
    if supports_color::on(Stream::Stdout).is_some() {
        HELP_STYLES
    } else {
        Styles::plain()
    }
}

#[must_use]
#[derive(Clone, ValueEnum)]
pub enum Shell {
    Bash,
    Elvish,
    Fish,
    PowerShell,
    Zsh,
    Nushell,
}

impl Shell {
    fn to_clap_type(&self) -> Box<dyn Generator> {
        match self {
            Self::Bash => Box::new(clap_complete::Shell::Bash),
            Self::Elvish => Box::new(clap_complete::Shell::Elvish),
            Self::Fish => Box::new(clap_complete::Shell::Fish),
            Self::PowerShell => Box::new(clap_complete::Shell::PowerShell),
            Self::Zsh => Box::new(clap_complete::Shell::Zsh),
            Self::Nushell => Box::new(clap_complete_nushell::Nushell),
        }
    }
}

pub fn generate_completion(shell: Shell) -> Result<()> {
    let mut cmd = Args::command();
    let bin_name = cmd.get_name().to_string();

    cmd.set_bin_name(bin_name);
    cmd.build();

    shell.to_clap_type().generate(&cmd, &mut io::stdout());

    Ok(())
}
