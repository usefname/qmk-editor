mod settings;

use std::collections::{HashMap};
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::{MAIN_SEPARATOR, Path, PathBuf};
use std::process::Command;

use anyhow::{anyhow, Context, ensure, Result};
use serde::{Deserialize, Serialize};
use walkdir::WalkDir;


pub fn list_keyboards(qmk_path: &str) -> Result<Vec<String>> {
    let keyboard_path = PathBuf::from(qmk_path).join("keyboards");
    ensure!(keyboard_path.exists(), "Qmk keyboards path not found");

    let keyboard_path_str = keyboard_path.to_str().context("Failed to convert keyboard path string")?;
    let mut keyboard_path_string_prefix = String::with_capacity(keyboard_path_str.len() + 1);
    keyboard_path_string_prefix.push_str(keyboard_path_str);
    keyboard_path_string_prefix.push(MAIN_SEPARATOR);
    let paths = WalkDir::new(&keyboard_path)
        .max_depth(20)
        .min_depth(0)
        .into_iter()
        .filter_map(|f| f.ok())
        .filter(|f| f.file_name() == "rules.mk")
        .map(|f| f.into_path());


    let mut keyboards: Vec<String> = paths
        .filter(|p| !p.ancestors()
            .map(|s| s.file_name())
            .any(|s| s.map_or(false, |s| s == "keymaps")))
        .filter_map(|p| p.parent().map(|p| p.to_path_buf()))
        .filter(|p| p.join("keymaps").exists())
        .filter(|p| p.join("info.json").exists())
        .map(|p|
                p.to_string_lossy()
                    .strip_prefix(&keyboard_path_string_prefix)
                    .unwrap_or(&p.to_string_lossy())
                    .to_string()
        )
        .collect::<Vec<String>>();
    keyboards.sort();
    keyboards.dedup();
    Ok(keyboards)
}

#[allow(dead_code)]
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

    let meta_data = fs::metadata(&path).context(format!(
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


fn get_keyboard_path(qmk_path: &str, keyboard: &str) -> Result<PathBuf> {
    let path = Path::new(qmk_path)
        .join("keyboards")
        .join(keyboard);
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
struct MatrixPins {
    cols: Vec<String>,
    rows: Vec<String>
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Keyboard {
    keyboard_name: String,
    url: String,
    maintainer: String,
    layouts: HashMap<String, Layout>,
    matrix_pins: MatrixPins
}

pub fn load_keyboard_json(qmk_path: &str, keyboard: &str) -> Result<Keyboard> {
    let mut path = get_keyboard_path(qmk_path, keyboard)?;
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

pub fn list_keymaps(qmk_path: &str, keyboard: &str) -> Result<Vec<String>> {
    let keymaps = list_keymap_c_files(qmk_path, keyboard)?
        .filter_map(|f| f.parent().map(|parent| parent.to_owned()))
        .filter_map(|f| {
            f.file_stem()
                .map(|dir_name| dir_name.to_string_lossy().to_string())
        })
        .collect::<Vec<String>>();

    Ok(keymaps)
}

fn list_keymap_c_files(qmk_path: &str, keyboard: &str) -> Result<impl Iterator<Item=PathBuf>> {
    let path = get_keyboard_path(qmk_path, keyboard)?;

    Ok(WalkDir::new(path)
        .max_depth(20)
        .min_depth(0)
        .into_iter()
        .filter_map(|f| f.ok())
        .filter(|f| f.file_name() == "keymap.c")
        .map(|f| f.into_path()))
}

fn generate_keymap(qmk_path: &str, qmk_keymap_dir: &str, keyboard: &str, keymap: Vec<Vec<Vec<String>>>) -> Result<usize> {
    ensure!(!keymap.is_empty(), "Keymap is empty");
    ensure!(!keymap[0].is_empty(), "Keymap has no layers");
    let layer_row_length = keymap[0][0].len();
    for layer in &keymap {
        for row in layer {
            ensure!(layer_row_length == row.len(), "Inconsistent row length");
        }
    }

    ensure!(!keymap.is_empty(), "Keymap is empty");

    let path = get_keyboard_path(&qmk_path, keyboard)?
        .join("keymaps")
        .join(qmk_keymap_dir);
    if !path.exists() {
        fs::create_dir(&path).context("Failed to create keymap dir")?;
    }
    let keymap_file_path = path.join("keymap.c");
    let mut file = File::create(&keymap_file_path).context("Failed to open keymap file")?;
    let mut file_data = String::new();
    file_data.push_str("const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {\n");

    for (layer_index, layer) in keymap.iter().enumerate() {
        file_data.push_str("\t[");
        file_data.push_str(layer_index.to_string().as_str());
        file_data.push_str("] = {\n");
        for column in layer {
            file_data.push_str("\t\t{");
            for key in column {
                file_data.push_str(key);
                file_data.push_str(",");
            }
            file_data.push_str("},\n");
        }
        file_data.push_str("\t},\n");
    }
    file_data.push_str("}\n");
    let bytes = file.write(file_data.as_bytes())?;
    println!("wrote {} bytes to {}", bytes, keymap_file_path.canonicalize().unwrap().to_string_lossy().to_string());
    Ok(bytes)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_keymap() {
        let keymap_path = Path::new("test_data/qmk_firmware/keyboards/flat/keymaps/generated/keymap.c");
        if keymap_path.exists() {
            fs::remove_file(keymap_path).unwrap();
        }
        let mut keymap: Vec<Vec<Vec<String>>> = Vec::new();
        keymap.push(Vec::new());
        keymap[0].push(Vec::new());
        keymap[0].push(Vec::new());
        keymap[0].push(Vec::new());
        for _i in 0..4 {
            keymap[0][0].push(String::from("KC_NO"));
            keymap[0][1].push(String::from("KC_NO"));
            keymap[0][2].push(String::from("KC_NO"));
        }
        let result= generate_keymap("test_data/qmk_firmware", "generated", "flat", keymap).unwrap();
        assert_eq!(result, 168)
    }

    #[test]
    fn test_list_keyboards() {
        let result = list_keyboards("test_data/qmk_firmware").unwrap();
        assert!(result.len() == 2);
        assert_eq!(result.len(), 2)
    }

    #[test]
    fn test_list_keymaps() {
        let km = list_keymaps(&"test_data/qmk_firmware/", &"bacca70");
        let km = km.unwrap();
        assert_eq!(km.len(), 4);
    }

    #[test]
    fn test_load_keyboard_json() {
        let keyboard = load_keyboard_json("test_data/qmk_firmware/", &"flat").unwrap();
        assert_eq!(&keyboard.keyboard_name.as_str(), &"flat");
    }
}
