# QMK Editor
Desktop GUI for editing QMK layouts and flashing keyboard firmware. This is only a frontend and requires that you have the QMK repo and toolchain. https://docs.qmk.fm/#/newbs_getting_started

## Development
`npm run tauri dev`
### Build
`npm run tauri build`
### Build using docker
`docker build --no-cache --file Dockerfile --output target .`
