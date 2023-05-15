#![feature(let_chains)]
#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

mod config;
mod qmk;
mod command;


use std::path::Path;
use std::sync::{Arc, RwLock, RwLockReadGuard, RwLockWriteGuard};
use std::thread;

use tauri::{State, Window};
use crate::command::BuildProcess;
use crate::qmk::{flash_keyboard, is_path_qmk_root, KeymapDescription};
use crate::config::{config_setup, create_config_file, EditorConfig, EditorState, state_setup};


#[derive(Debug)]
pub struct BuildState {
    pub process: Option<BuildProcess>
}

type EditorConfigRwLock = RwLock<EditorConfig>;
type EditorStateRwLock = RwLock<EditorState>;
type BuildStateRwLock = Arc<RwLock<BuildState>>;

fn main() {
    let config = config_setup().expect("Failed to get program config");
    let config_lock: EditorConfigRwLock = EditorConfigRwLock::new(config);
    let state = state_setup();
    let state_lock: EditorStateRwLock = EditorStateRwLock::new(state);
    let build_state = BuildState {
        process: None,
    };
    let build_state_lock: BuildStateRwLock = Arc::new(RwLock::new(build_state));
    tauri::Builder::default()
        .manage(state_lock)
        .manage(config_lock)
        .manage(build_state_lock)
        .invoke_handler(tauri::generate_handler![
            list_keyboards,
            cache_keyboards,
            list_keymaps,
            import_keyboard,
            need_config_update,
            validate_qmk_path,
            get_state,
            save_config,
            get_config,
            get_qmk_path,
            create_keymap_path,
            generate_keymap,
            save_keymap,
            load_keymap,
            set_current_file,
            start_flash,
            stop_flash
        ])
        .run(tauri::generate_context!())
        .expect("error while running QMK Editor");
}


fn unlock_writable_config<'a, T>(lock: &'a RwLock<T>) -> Result<RwLockWriteGuard<'a, T>, String>
where
T: Send + Sync,
{
    let config_guard = lock.write().map_err(|err| err.to_string())?;
    Ok(config_guard)
}

fn unlock_config<'a, T>(lock: &'a RwLock<T>) -> Result<RwLockReadGuard<'a, T>, String>
where
T: Send + Sync
{
    let config_guard = lock.read().map_err(|err| err.to_string())?;
    Ok(config_guard)
}

#[tauri::command]
fn list_keymaps(config_lock: State<EditorConfigRwLock>, keyboard: String) -> Result<Vec<String>, String> {
    println!("Listing keymaps for {}", &keyboard);
    let config = unlock_config(&config_lock)?;
    let qmk_path = match &config.qmk_path {
        None => { return Err("Missing qmk path".to_string()); }
        Some(s) => s
    };
    qmk::list_keymaps(qmk_path.as_str(), &keyboard).map_err(|err| err.to_string())
}

#[tauri::command]
fn list_keyboards(config_lock: State<EditorConfigRwLock>) -> Result<Vec<String>, String> {
    println!("Listing keyboards");
    let config = unlock_config(&config_lock)?;
    let qmk_path = match &config.qmk_path {
        None => { return Err("Missing qmk path".to_string()); }
        Some(s) => s
    };
    qmk::list_keyboards(qmk_path.as_str()).map_err(|e| e.to_string())
}

#[tauri::command]
fn cache_keyboards(config_lock: State<EditorConfigRwLock>) -> () {
    let qmk_path: String;
    {
        let config = unlock_config(&config_lock).expect("Failed to read config");
        qmk_path = match &config.qmk_path {
            None => { eprintln!("No QMK path configured, keyboards not cached"); return; }
            Some(s) => s.to_owned()
        };
    }

    println!("Caching keyboards");
    thread::spawn(move || {
        let result = qmk::list_keyboards(qmk_path.as_str());
        if let Err(err) = result {
            eprintln!("Keyboard list not cached: {}", err);
        }
    });
}


#[tauri::command]
fn import_keyboard(config_lock: State<EditorConfigRwLock>, keyboard: String) -> Result<qmk::Keyboard, String> {
    println!("Importing keyboard {}", keyboard);
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
    let state = unlock_config(&state_lock)?;
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
fn create_keymap_path(config_lock: State<EditorConfigRwLock>, keyboard_name: String) -> Result<String, String> {
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

    let keymap_path = qmk::create_keymap_path(&qmk_path,
                                              &keyboard_name,
                                              &generated_keymap_path)
        .map_err(|err| err.to_string())?;
    Ok(keymap_path.join("keymap.c").to_string_lossy().to_string())
}

#[tauri::command]
fn generate_keymap(config_lock: State<EditorConfigRwLock>, keymap_description: KeymapDescription) -> Result<String, String> {
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

    let keymap_file = qmk::generate_keymap(
        qmk_path.as_str(),
        generated_keymap_path.as_str(),
        keymap_description.keyboard_name.as_str(),
        keymap_description.layout_name.as_str(),
        keymap_description.keymap,
    )
        .map_err(|err| err.to_string())?;
    println!("Generated {}", &keymap_file);
    Ok(keymap_file)
}

// This should probably return filename from file desc metadata
#[tauri::command]
fn save_keymap(filename: String, keymap_description: KeymapDescription) -> Result<(), String> {
    println!("Saving keymap to {}", &filename);
    qmk::save_keymap(
        Path::new(&filename),
        &keymap_description)
        .map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_keymap(filename: String) -> Result<KeymapDescription, String> {
    println!("Loading keymap from {}", &filename);
    qmk::load_keymap(
        Path::new(&filename))
        .map_err(|err| err.to_string())
}

#[tauri::command]
fn set_current_file(state_lock: State<EditorStateRwLock>, filename: Option<String>) -> Result<(), String> {
    let mut state = unlock_writable_config(&state_lock)?;
    state.filename = filename;
    config::create_state_file(&state)
        .map_err(|err| err.to_string())?;
    Ok(())
}

#[tauri::command]
fn start_flash(window: Window, config_lock: State<EditorConfigRwLock>, build_state_lock: State<BuildStateRwLock>, keyboard: String) -> Result<String, String> {
    println!("Flashing {}", keyboard);
    let config = unlock_config(&config_lock)?;
    let qmk_path = match &config.qmk_path {
        None => {return Err("Config missing qmk firmware directory".to_string());}
        Some(qmk_path) => qmk_path
    };

    let mut build_state = unlock_writable_config(&build_state_lock)?;
    if let Some(process) = &mut build_state.process {
        let finished = match &process.thread_id {
            None => false,
            Some(x) => x.is_finished()
        };
        if finished && let Some(thread_handle) = process.thread_id.take() {
            thread_handle.join().map_err(|_| "Unable to finish previous build")?;
        } else {
            return Ok(process.command.clone());
        }
    }
    let process = flash_keyboard(move |event, output| { window.emit(event.as_str(), output).unwrap(); }, &qmk_path, &keyboard, &config.generated_keymap).map_err(|err| err.to_string())?;
    let command = process.command.clone();
    build_state.process = Some(process);
    Ok(command)
}

#[tauri::command]
fn stop_flash(build_state_lock: State<BuildStateRwLock>) -> Result<bool, String> {
    let mut build_state = unlock_writable_config(&build_state_lock)?;
    let mut result = true;
    if let Some(process) = &mut build_state.process {
        println!("Stopping flash process");
        {
            let mut stop_flag = process.stop.lock().map_err(|err| err.to_string())?;
            *stop_flag = true;
        }
        if let Some(thread_handle) = process.thread_id.take() {
            result = thread_handle.join().map_err(|_| "Failed to get build result".to_string())?;
        } else {
            println!("No build thread to join");
        }
    } else {
        println!("No flash process to stop");
    }
    build_state.process = None;
    Ok(result)
}

