#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

mod config;
mod qmk;

use std::path::Path;
use std::sync::{RwLock, RwLockReadGuard, RwLockWriteGuard};
use tauri::State;
use crate::qmk::{is_path_qmk_root, KeymapDescription};
use crate::config::{config_setup, create_config_file, EditorConfig, EditorState, state_setup};


type EditorConfigRwLock = RwLock<EditorConfig>;
type EditorStateRwLock = RwLock<EditorState>;

fn main() {
    let config = config_setup().expect("Failed to get program config");
    let config_lock: EditorConfigRwLock = EditorConfigRwLock::new(config);
    let state = state_setup();
    let state_lock: EditorStateRwLock = EditorStateRwLock::new(state);
    tauri::Builder::default()
        .manage(state_lock)
        .manage(config_lock)
        .invoke_handler(tauri::generate_handler![
            list_keyboards,
            list_keymaps,
            import_keyboard,
            need_config_update,
            validate_qmk_path,
            get_state,
            save_config,
            get_config,
            get_qmk_path,
            generate_keymap,
            save_keymap,
            load_keymap
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

fn unlock_state<'a>(lock: &'a State<EditorStateRwLock>) -> Result<RwLockReadGuard<'a, EditorState>, String> {
    let state_guard = lock.read().map_err(|err| err.to_string())?;
    Ok(state_guard)
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
        .map_err(|err| format!("{:?}", err))
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
fn get_state(state_lock: State<EditorStateRwLock>) -> Result<EditorState, String> {
    let state = unlock_state(&state_lock)?;
    Ok(state.clone())
}

#[tauri::command]
fn get_config(config_lock: State<EditorConfigRwLock>) -> Result<EditorConfig, String> {
    let config = unlock_config(&config_lock)?;
    Ok(config.clone())
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
fn generate_keymap(config_lock: State<EditorConfigRwLock>, keyboard: String, layout: String, keymap: qmk::Keymap) -> Result<(), String> {
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
        layout.as_str(),
        keymap,
    )
        .map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_keymap(filename: String, keymap_description: KeymapDescription) -> Result<(), String> {
    qmk::save_keymap(
        Path::new(&filename),
        &keymap_description)
        .map_err(|err| err.to_string())
}

#[tauri::command]
fn load_keymap(filename: String) -> Result<KeymapDescription, String> {
    qmk::load_keymap(
        Path::new(&filename))
        .map_err(|err| err.to_string())
}
