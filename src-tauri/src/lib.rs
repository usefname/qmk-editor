use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use serde::{Deserialize, Serialize};
use anyhow::{bail, ensure, Result, Context, anyhow};
use walkdir::WalkDir;

pub fn list_keyboards() -> Result<Vec<String>> {
    let mut command = Command::new("qmk");
    command.arg("list-keyboards");

    let output = command
        .output()
        .context("Failed to run qmk")?;

    if !output.status.success() {
        bail!(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let lines = String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(|s| s.to_string())
        .collect::<Vec<String>>();
    ensure!(lines.len() > 0, "No keyboards found");
    Ok(lines)
}

fn qmk_root_dir() -> Result<PathBuf> {
    let command = Command::new("qmk")
        .arg("env")
        .arg("QMK_HOME")
        .output()
        .context("Failed to run qmk")?;
    ensure!(command.status.success(), "Failed to get qmk env `QMK_HOME`");

    let path_string = String::from_utf8_lossy(&command.stdout)
        .trim_end()
        .to_string();
    let path = PathBuf::from(path_string);

    let meta_data = std::fs::metadata(&path).context(format!(
        "Failed to get metadata for path {}",
        path.display()
    ))?;

    if meta_data.is_dir() {
        Ok(path)
    } else {
        Err(anyhow!(
            "Qmk path returned from `qmk env QMK_HOME`: '{}' is not a directory",
            path.display()
        ))
    }
}

fn get_keyboard_path(keyboard: &str) -> Result<PathBuf> {
    let mut path = qmk_root_dir()?;
    path.push("keyboards");
    path.push(keyboard);
    ensure!(
        path.is_dir(),
        anyhow!(
            "Could not find keyboard '{}' in path '{}'",
            keyboard,
            path.display()
        )
    );
    Ok(path)
}

#[derive(Serialize, Deserialize, Debug)]
struct Button {
    x: f32,
    y: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    w: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    h: Option<f32>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Layout {
    layout: Vec<Button>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Keyboard {
    keyboard_name: String,
    url: String,
    maintainer: String,
    layouts: HashMap<String, Layout>,
}


pub fn load_keyboard_json(keyboard: &str) -> Result<Keyboard> {
    let mut path = get_keyboard_path(keyboard)?;
    path.push("info.json");
    let file = fs::read_to_string(&path).context(anyhow!(
        "Failed to read keyboard info from: {}",
        path.display()
    ))?;
    let keyboard = serde_json::from_str::<Keyboard>(&file)
        .context(anyhow!("Failed to deserialize {}", path.display()))?;
    ensure!(keyboard.layouts.len() > 0, "Keyboard is missing layouts");
    Ok(keyboard)
}

pub fn list_keymaps(keyboard: &str) -> Result<Vec<String>> {
    let keymaps = list_keymap_c_files(keyboard)?
        .filter_map(|f| f.parent().map(|parent| parent.to_owned()))
        .filter_map(|f| {
            f.file_stem()
                .map(|dir_name| dir_name.to_string_lossy().to_string())
        })
        .collect::<Vec<String>>();

    Ok(keymaps)
}

fn list_keymap_c_files(keyboard: &str) -> Result<impl Iterator<Item = PathBuf>> {
    let path = get_keyboard_path(keyboard)?;

    Ok(WalkDir::new(path)
        .max_depth(20)
        .min_depth(0)
        .into_iter()
        .filter_map(|f| f.ok())
        .filter(|f| f.file_name() == "keymap.c")
        .map(|f| f.into_path()))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_list_keyboards() {
        let result = list_keyboards();
        assert!(result.unwrap().len() > 0);
    }

    #[test]
    fn test_list_keymaps() {
        let km = list_keymaps(&"ergodox_ez");
        let km = km.unwrap();
        assert!(km.len() > 0);
    }

    #[test]
    fn test_load_keyboard() {
        let keyboard = load_keyboard_json(&"capsunlocked/cu80/v2_ansi");
        assert!(keyboard.is_ok());
    }
}
