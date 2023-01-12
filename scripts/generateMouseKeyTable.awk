#!/bin/awk -f
function ltrim(s) { sub(/^[ \t\r\n]+/, "", s); return s }
function rtrim(s) { sub(/[ \t\r\n]+$/, "", s); return s }
function trim(s) { return rtrim(ltrim(s)); }
# function clean(s) {gsub(/[ \t]/, "", s); return s}
BEGIN {
    FS="|"
    printf("%s", "[")
}
/## Mouse Keys/,/## Modifi/ {
    if (match($0, "KC_MS")) {
        gsub("`", "\"",$2)

        printf("%s,", trim($2))
    }
}
END {
    printf("%s", "];")
}
