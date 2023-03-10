#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod settings;

use crate::settings::G_EDITOR_SETTINGS;

fn main() {
  settings::load_settings().unwrap();
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![list_keyboards, list_keymaps, import_keyboard, update_qmk_path, generate_keymap])
      .run(tauri::generate_context!())
    .expect("error while running QMK Editor");
}

#[tauri::command]
fn list_keymaps(keyboard: String) -> Result<Vec<String>, String> {
  let settings = G_EDITOR_SETTINGS.read().unwrap();
  qmk_editor::list_keymaps(settings.qmk_path.as_str(), &keyboard).map_err(|err| err.to_string())
}

#[tauri::command]
fn list_keyboards() -> Result<Vec<String>, String> {
  let settings = G_EDITOR_SETTINGS.read().unwrap();
  qmk_editor::list_keyboards(settings.qmk_path.as_str()).map_err( |e| e.to_string())
}

#[tauri::command]
fn import_keyboard(keyboard: String) -> Result<qmk_editor::Keyboard, String> {
  println!("Loading keyboard {}", keyboard);
  let settings = G_EDITOR_SETTINGS.read().unwrap();
  qmk_editor::load_keyboard_json(settings.qmk_path.as_str(), &keyboard).map_err(|err| err.to_string())
}

#[tauri::command]
fn update_qmk_path() {
  let mut settings = G_EDITOR_SETTINGS.write().unwrap();
  settings.qmk_path = String::from("dude");
}

#[tauri::command]
fn generate_keymap(keyboard: String, keymap: Vec<Vec<Vec<String>>>) -> Result((), String){
  let settings = G_EDITOR_SETTINGS.read().unwrap();
  qmk_editor::generate_keymap(settings.qmk_path, setings.generated_keymap, keyboard.as_str(), keymap);
}
