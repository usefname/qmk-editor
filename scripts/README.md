## Generate Keycode description table
awk -f generateQMKKeycodeTable.awk ~/qmk_firmware/docs/keycodes.md

## Extract basic keycodes
awk -f generateBasicKeyCodeTables.awk ~/qmk_firmware/docs/keycodes_basic.md
