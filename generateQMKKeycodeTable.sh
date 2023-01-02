grep -e "^|`KC_.*|.*|.*|.*|.*|" keycodes.md | awk -F '\|' '/^\|`KC/ {gsub("`", "", $0); print $2 $4; if(index($3, " ") != 1) {print $3 $4}}' - | less
