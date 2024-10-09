#!/bin/bash

# This works for Vite React projects
# Put this in the root folder of your project
# Run the command chmod +x get_code_context.sh to make it executable
# Then run ./get_code_context.sh to generate the code context

# Use the current directory as the project directory
project_dir=$(pwd)

# Use a fixed name for the output file in the current directory
output_file="${project_dir}/code_context.txt"

# Check if the output file exists and remove it if it does
if [ -f "$output_file" ]; then
  rm "$output_file"
fi

# List of directories to look for, updated for Vite React projects
directories=("src" "server" "components" "pages" "styles" "utils" "hooks" "constants" "services" "types")

# List of file types to ignore
ignore_files=("*.ico" "*.png" "*.jpg" "*.jpeg" "*.gif" "*.svg")

# Maximum number of lines to include from each file
max_lines=50

# Recursive function to read files and append their content
read_files() {
  for entry in "$1"/*
  do
    if [ -d "$entry" ]; then
      # Skip the node_modules directory to avoid including large files
      if [[ "$entry" == *"node_modules"* ]]; then
        continue
      fi
      # If entry is a directory, call this function recursively
      read_files "$entry"
    elif [ -f "$entry" ]; then
      # Check if the file type should be ignored
      should_ignore=false
      for ignore_pattern in "${ignore_files[@]}"; do
        if [[ "$entry" == $ignore_pattern ]]; then
          should_ignore=true
          break
        fi
      done

      # If the file type should not be ignored, append its relative path and a portion of its content to the output file
      if ! $should_ignore; then
        relative_path=${entry#"$project_dir/"}
        echo "// File: $relative_path" >> "$output_file"
        head -n "$max_lines" "$entry" >> "$output_file"
        echo "" >> "$output_file"
      fi
    fi
  done
}

# Call the recursive function for each specified directory in the project directory
for dir in "${directories[@]}"; do
  if [ -d "${project_dir}/${dir}" ]; then
    read_files "${project_dir}/${dir}"
  fi
done
