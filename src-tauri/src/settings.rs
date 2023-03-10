
use anyhow::Result;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::sync::RwLock;

#[derive(Serialize, Deserialize, Debug)]
pub struct EditorConfig {
  pub qmk_path: String,
  pub generated_keymap: String,
}


lazy_static! {
  pub static ref G_EDITOR_SETTINGS: RwLock<EditorConfig> = RwLock::new(EditorConfig {
    qmk_path: String::from("/home/joe/qmk_firmware"),
    generated_keymap: String::from("generated")
  });
}

pub fn load_settings() -> Result<()> {
  {
    let mut settings = G_EDITOR_SETTINGS.write().unwrap();
    // settings = EditorConfig {
    //   qmk_path: String::from("/home/joe/qmk_firmware"),
    //   generated_keymap: String::from("generated")
    // };
    let x = EditorConfig {
      qmk_path: "dudewtf".to_string(),
      generated_keymap: "".to_string(),
    };
    *settings = x;
  }
  let s = G_EDITOR_SETTINGS.read().unwrap();
  println!("{}", &s.qmk_path);
  Ok(())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_load_settings() {
    let x = load_settings().is_ok();
    assert!(x);
  }
}

