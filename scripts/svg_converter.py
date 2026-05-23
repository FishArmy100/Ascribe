from pathlib import Path
import re

SVG_FOLDER = "./src/assets/images"

path = Path(SVG_FOLDER)

if not path.exists():
    print(f"Path does not exist: {SVG_FOLDER}")
    exit()


svg_files = path.glob("*.svg")

for svg_file in svg_files:
    content = svg_file.read_text(encoding="utf-8")

    # Remove existing fill attributes
    content = re.sub(r'fill="[^"]*"', '', content)

    # Add fill="currentColor" to all path tags
    content = re.sub(
        r'<path([^>]*)>',
        r'<path\1 fill="currentColor">',
        content
    )

    svg_file.write_text(content, encoding="utf-8")

    print(f"Updated: {svg_file.name}")

print("Done.")