use std::collections::HashMap;
use std::fmt::Debug;
use std::{fs};
use std::fs::File;
use std::io::{Write};
use std::path::{MAIN_SEPARATOR, Path, PathBuf};
use std::process::{Command};

use anyhow::{anyhow, Context, ensure, Result};
use serde::{Deserialize, Serialize};
use walkdir::WalkDir;
use crate::command::{async_command, BuildEvent, BuildProcess};

pub type Keymap = Vec<Vec<String>>;

#[derive(Serialize, Deserialize, Debug)]
pub struct KeymapDescription {
    pub keyboard_name: String,
    pub layout_name: String,
    pub keymap: Keymap,
}

impl KeymapDescription {
    #[allow(dead_code)]
    pub fn new(keyboard: &str, layout: &str, keymap: Keymap) -> Self {
        Self {
            keyboard_name: keyboard.to_string(),
            layout_name: layout.to_string(),
            keymap,
        }
    }
}

pub fn load_keymap(path: &Path) -> Result<KeymapDescription> {
    let keymap_file = File::open(path).context("Failed to open keymap file")?;
    let keymap: KeymapDescription = serde_yaml::from_reader(keymap_file).context("Failed to load keymap")?;
    Ok(keymap)
}

pub fn save_keymap(path: &Path, keymap: &KeymapDescription) -> Result<()> {
    let file_desc = File::create(&path)?;
    serde_yaml::to_writer(file_desc, keymap).context("Failed to write keymap")?;
    Ok(())
}


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

pub fn flash_keyboard<F: Fn(BuildEvent, String) -> () + Clone + Send + 'static>(io_callback: F, qmk_path: &str, keyboard: &str, keymap: &str) -> Result<BuildProcess> {
    let arg = [keyboard, keymap, "flash"].join(":");
    let program = "make";
    println!("{}: {} {}", qmk_path, program, arg);
    let build_process = async_command(io_callback, qmk_path, program, &arg)?;
    Ok(build_process)
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
pub struct Keyboard {
    layouts: HashMap<String, Layout>,
}


pub fn load_keyboard_json(qmk_path: &str, keyboard: &str) -> Result<Keyboard> {
    let mut path = get_keyboard_path(qmk_path, keyboard)?;
    path.push("info.json");
    let file = fs::read_to_string(&path).context(anyhow!(
        "Failed to read keyboard info from: {}",
        path.display()
    ))?;
    let keyboard = serde_json::from_str::<Keyboard>(&file)
        .context(anyhow!("Failed to deserialize {}\n", path.display()))?;
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

pub fn is_path_qmk_root(qmk_path: &str) -> bool {
    Path::new(qmk_path).join("keyboards").is_dir()
}


pub fn create_keymap_path(qmk_path: &str, keyboard: &str, qmk_keymap_dir: &str) -> Result<PathBuf> {
    Ok(get_keyboard_path(&qmk_path, keyboard)?
        .join("keymaps")
        .join(qmk_keymap_dir))
}

pub fn generate_keymap(qmk_path: &str, qmk_keymap_dir: &str, keyboard: &str, layout: &str, keymap: Keymap) -> Result<String> {
    ensure!(!keymap.is_empty(), "Keymap is empty");

    let path = create_keymap_path(qmk_path, keyboard, qmk_keymap_dir)?;
    if !path.exists() {
        fs::create_dir(&path).context("Failed to create keymap dir")?;
    }
    let keymap_file_path = path.join("keymap.c");
    let mut file = File::create(&keymap_file_path).context("Failed to open keymap file")?;
    let mut file_data = String::new();
    file_data.push_str("#include QMK_KEYBOARD_H\n");
    file_data.push_str("const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {\n");

    for layer in keymap {
        file_data.push_str("\t");
        file_data.push_str(layout);
        file_data.push_str("(");
        file_data.push_str(&layer.join(","));
        file_data.push_str("),\n");
    }
    file_data.push_str("};\n");
    let bytes = file.write(file_data.as_bytes())?;
    println!("wrote {} bytes to {}", bytes, keymap_file_path.canonicalize().unwrap().to_string_lossy().to_string());
    Ok(keymap_file_path.to_string_lossy().to_string())
}



#[cfg(test)]
mod tests {

    use super::*;

    static QMK_TEST_ROOT: &str = "test_data/qmk_firmware";


    fn create_test_keymap() -> Keymap {
        let mut keymap: Keymap = Vec::new();
        keymap.push(Vec::new());

        for i in 0..4 {
            for _j in 0..14 {
                let row = i.to_string();
                let mut key = String::from("KC_");
                key.push_str(&row);
                keymap[0].push(key);
            }
        }
        keymap
    }

    #[test]
    fn test_generate_keymap() {
        let keymap_path = Path::new(QMK_TEST_ROOT).join("keyboards/flat/keymaps/generated/keymap.c");
        if keymap_path.exists() {
            fs::remove_file(keymap_path).unwrap();
        }
        let keymap = create_test_keymap();
        let result = generate_keymap(QMK_TEST_ROOT, "generated", "flat", "LAYOUT", keymap).unwrap();
        assert!(result.len() > 0)
    }

    #[test]
    fn test_list_keyboards() {
        let result = list_keyboards(QMK_TEST_ROOT).unwrap();
        assert_eq!(result.len(), 2);
    }

    #[test]
    fn test_list_keymaps() {
        let km = list_keymaps(QMK_TEST_ROOT, &"bacca70");
        let km = km.unwrap();
        assert_eq!(km.len(), 4);
    }

    #[test]
    fn test_load_keyboard_json() {
        load_keyboard_json(QMK_TEST_ROOT, &"flat").unwrap();
    }
}
