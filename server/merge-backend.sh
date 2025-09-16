#!/bin/bash

OUTPUT="backend-code.txt"
rm -f "$OUTPUT"

if [ -f "main.ts" ]; then
  echo "===== main.ts =====" >> "$OUTPUT"
  cat main.ts >> "$OUTPUT"
  echo -e "\n" >> "$OUTPUT"
fi

find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  echo "===== $file =====" >> "$OUTPUT"
  cat "$file" >> "$OUTPUT"
  echo -e "\n" >> "$OUTPUT"
done

echo "Gotowe! Wszystkie pliki backendu zostały połączone do $OUTPUT"
