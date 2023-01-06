#!/bin/awk -f
function ltrim(s) { sub(/^[ \t\r\n]+/, "", s); return s }
function rtrim(s) { sub(/[ \t\r\n]+$/, "", s); return s }
function trim(s) { return rtrim(ltrim(s)); }
# function clean(s) {gsub(/[ \t]/, "", s); return s}
BEGIN {
    FS="|"
    endArrayString = ""
}
{
    if ($0 ~ /^##/) {
        sub("## ","", $0)
        gsub(" ","_", $0)
        variable=tolower($0)
        printf("%s",endArrayString)
        printf("%s=[",variable)
        endArrayString = "];\n"
    } else if ($0 ~ /^\|`/){
        gsub(/`/,"", $2)
        printf("%s","\""trim($2)"\",")
    }
}
END {
print "];"
}
