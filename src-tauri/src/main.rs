#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![list_keyboards, list_keymaps, import_keyboard])
      .run(tauri::generate_context!())
    .expect("error while running QMK Editor");
}

#[tauri::command]
fn list_keymaps(keyboard: String) -> Result<Vec<String>, String> {
  qmk_editor::list_keymaps(&keyboard).map_err(|err| err.to_string())
}

#[tauri::command]
fn list_keyboards() -> Result<Vec<String>, String> {
  qmk_editor::list_keyboards().map_err( |e| e.to_string())
}

#[tauri::command]
fn import_keyboard(keyboard: String) -> Result<qmk_editor::Keyboard, String> {
  println!("Loading keyboard {}", keyboard);
  qmk_editor::load_keyboard_json(&keyboard).map_err(|err| err.to_string())
}

