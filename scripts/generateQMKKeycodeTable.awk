#!/bin/awk -f
function ltrim(s) { sub(/^[ \t\r\n]+/, "", s); return s }
function rtrim(s) { sub(/[ \t\r\n]+$/, "", s); return s }
function trim(s) { return rtrim(ltrim(s)); }
# function clean(s) {gsub(/[ \t]/, "", s); return s}
function createArray(col1, col2) {
    print "[\"" trim(col1) "\", \"" trim(col2) "\"],"
}
BEGIN {FS="|"}
/^\|`KC/ {
    gsub("`", "", $0)
    # print removeWhiteSpace($2) "\t" $4
    createArray($2, $4)
    if(index($3, " ") != 1) {
        n = split($3, a, ",")
        for(i in a) {
            # print "'" removeWhiteSpace(a[i]) "'\t" $4
            createArray(a[i], $4)
        }
    }
}
