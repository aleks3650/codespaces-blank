#!/bin/bash
OUTPUT="frontend-code.txt"
rm -f "$OUTPUT"

find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  echo "===== $file =====" >> "$OUTPUT"
  cat "$file" >> "$OUTPUT"
  echo -e "\n" >> "$OUTPUT"
done

echo "Gotowe! Wszystkie pliki zostały połączone do $OUTPUT"
