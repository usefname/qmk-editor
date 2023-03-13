#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

mod config;
mod qmk;

use std::sync::{RwLock, RwLockReadGuard, RwLockWriteGuard};
use tauri::State;
use crate::qmk::is_path_qmk_root;
use crate::config::{config_setup, create_config_file, EditorConfig};


type EditorConfigRwLock = RwLock<EditorConfig>;

fn main() {
    let config = config_setup().expect("Failed to get program config");
    let config_lock: EditorConfigRwLock = EditorConfigRwLock::new(config);
    tauri::Builder::default()
        .manage(config_lock)
        .invoke_handler(tauri::generate_handler![
            list_keyboards,
            list_keymaps,
            import_keyboard,
            need_config_update,
            validate_qmk_path,
            save_config,
            get_config,
            get_qmk_path,
            generate_keymap,
        ])
        .run(tauri::generate_context!())
        .expect("error while running QMK Editor");
}


fn unlock_writable_config<'a>(lock: &'a State<EditorConfigRwLock>) -> Result<RwLockWriteGuard<'a, EditorConfig>, String> {
    let config_guard = lock.write().map_err(|err| err.to_string())?;
    Ok(config_guard)
}

fn unlock_config<'a>(lock: &'a State<EditorConfigRwLock>) -> Result<RwLockReadGuard<'a, EditorConfig>, String> {
    let config_guard = lock.read().map_err(|err| err.to_string())?;
    Ok(config_guard)
}

#[tauri::command]
fn list_keymaps(config_lock: State<EditorConfigRwLock>, keyboard: String) -> Result<Vec<String>, String> {
    let config = unlock_config(&config_lock)?;
    let qmk_path = match &config.qmk_path {
        None => { return Err("Missing qmk path".to_string()); }
        Some(s) => s
    };
    qmk::list_keymaps(qmk_path.as_str(), &keyboard).map_err(|err| err.to_string())
}

#[tauri::command]
fn list_keyboards(config_lock: State<EditorConfigRwLock>) -> Result<Vec<String>, String> {
    let config = unlock_config(&config_lock)?;
    let qmk_path = match &config.qmk_path {
        None => { return Err("Missing qmk path".to_string()); }
        Some(s) => s
    };
    qmk::list_keyboards(qmk_path.as_str()).map_err(|e| e.to_string())
}

#[tauri::command]
fn import_keyboard(config_lock: State<EditorConfigRwLock>, keyboard: String) -> Result<qmk::Keyboard, String> {
    println!("Loading keyboard {}", keyboard);
    let config = unlock_config(&config_lock)?;
    let qmk_path = match &config.qmk_path {
        None => { return Err("Missing qmk path".to_string()); }
        Some(s) => s
    };
    qmk::load_keyboard_json(qmk_path.as_str(), &keyboard)
        .map_err(|err| err.to_string())
}

#[tauri::command]
fn need_config_update(config_lock: State<EditorConfigRwLock>) -> Result<bool, String> {
    let config = unlock_config(&config_lock)?;
    let need_update = match &config.qmk_path {
        None => true,
        Some(path) => !is_path_qmk_root(path)
    };
    Ok(need_update)
}

#[tauri::command]
fn validate_qmk_path(qmk_path: String) -> bool {
    is_path_qmk_root(&qmk_path)
}


#[tauri::command]
fn get_config(config_lock: State<EditorConfigRwLock>) -> Result<EditorConfig, String> {
    let config = unlock_config(&config_lock)?;
    let a = config.clone();
    Ok(a)
}

#[tauri::command]
fn save_config(config_lock: State<EditorConfigRwLock>, new_config: EditorConfig) -> Result<(), String> {
    let mut config = unlock_writable_config(&config_lock)?;
    config.replace(&new_config);
    create_config_file(&config).map_err(|err|err.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_qmk_path(config_lock: State<EditorConfigRwLock>) -> Result<Option<String>, String> {
    let config = unlock_config(&config_lock)?;
    Ok(config.qmk_path.clone())
}

#[tauri::command]
fn generate_keymap(config_lock: State<EditorConfigRwLock>, keyboard: String, keymap: Vec<Vec<Vec<String>>>) -> Result<(), String> {
    let qmk_path;
    let generated_keymap_path;
    {
        let config = unlock_config(&config_lock)?;
        qmk_path = match &config.qmk_path {
            None => { return Err("Missing qmk path".to_string()); }
            Some(s) => s.clone()
        };
        generated_keymap_path = config.generated_keymap.clone();
    }

    qmk::generate_keymap(
        qmk_path.as_str(),
        generated_keymap_path.as_str(),
        keyboard.as_str(),
        keymap,
    )
        .map(|_| ())
        .map_err(|err| err.to_string())
}
