#![allow(dead_code)]
#![allow(unused_imports)]

extern crate xdg;

use std::fs::File;
use std::path::PathBuf;
use anyhow::Context;
use serde::{Deserialize, Serialize};
use crate::generate_keymap;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct EditorConfig {
    pub qmk_path: Option<String>,
    pub generated_keymap: String,
}

impl EditorConfig {
    pub fn new() -> Self {
        Self {
            qmk_path: None,
            generated_keymap: "generated_keymap".to_string(),
        }
    }
    pub fn replace(&mut self, other: &EditorConfig) {
        self.qmk_path = other.qmk_path.clone();
        self.generated_keymap = other.generated_keymap.clone();
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct EditorState {
    pub keyboard: String,
}

static CONFIG_DIR_NAME: &str = "qmk_editor";
static CONFIG_FILE_NAME: &str = "config.yaml";

pub fn load_config_from_file() -> anyhow::Result<EditorConfig> {
    let xdg_dirs = xdg::BaseDirectories::with_prefix(CONFIG_DIR_NAME).context("Failed to find xdg dir")?;
    let config_file_path = xdg_dirs.find_config_file(CONFIG_FILE_NAME).context("Failed to find config file")?;
    let config_file_desc = std::fs::File::open(config_file_path).context("Failed to open config file")?;
    let yaml_config: EditorConfig = serde_yaml::from_reader(config_file_desc).context("Failed to read config")?;
    Ok(yaml_config)
}

pub fn create_config_file(config: &EditorConfig) -> anyhow::Result<()> {
    let xdg_dirs = xdg::BaseDirectories::with_prefix(CONFIG_DIR_NAME).context("Failed to find xdg dir")?;
    let config_file_path = xdg_dirs.place_config_file(CONFIG_FILE_NAME)?;
    let file_desc = File::create(&config_file_path)?;
    serde_yaml::to_writer(file_desc, &config).context("Failed to write to config file")?;
    Ok(())
}

pub fn config_setup() -> anyhow::Result<EditorConfig> {
    let mut config =  match load_config_from_file() {
        Ok(config) => {config},
        Err(_) => {
            let default_config = EditorConfig::new();
            let config_file_result = create_config_file(&default_config);
            if config_file_result.is_err() {
                eprintln!("{}", config_file_result.unwrap_err().to_string());
            }
            default_config
        }
    };

    match &config.qmk_path {
        Some(path) => {
            let remove_path = crate::qmk::is_path_qmk_root(path.as_str());
            println!("remove path: {}", remove_path);
            if remove_path {
                config.qmk_path = None;
            }
        },
        None => {}
    }
    Ok(config)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_load_config() {
        let config = config_setup().unwrap();
        assert_eq!(config.generated_keymap, "generated_keymap");
    }
}
