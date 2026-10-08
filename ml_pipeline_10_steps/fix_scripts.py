import os
import sys
import glob

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIPELINE_DIR = os.path.join(BASE_DIR, "ml_pipeline_10_steps")

SAFE_PATH_HEADER = """import os
import sys

# Robust path detection for both standalone scripts and Jupyter Notebook
try:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
except NameError:
    cur = os.path.abspath(".")
    BASE_DIR = cur if os.path.exists(os.path.join(cur, "data")) else os.path.dirname(cur)

PIPELINE_DIR = os.path.join(BASE_DIR, "ml_pipeline_10_steps")
for p in [BASE_DIR, PIPELINE_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)
"""

print(f"Fixing scripts in {PIPELINE_DIR}...")
for script in sorted(glob.glob(os.path.join(PIPELINE_DIR, "step*.py"))):
    with open(script, "r", encoding="utf-8") as f:
        code = f.read()

    # Clean previous base_dir lines
    lines = code.splitlines()
    cleaned_lines = []
    header_inserted = False
    
    for line in lines:
        if "BASE_DIR = os.path.dirname" in line or "PIPELINE_DIR = os.path.join" in line:
            if not header_inserted:
                cleaned_lines.append(SAFE_PATH_HEADER)
                header_inserted = True
            continue
        elif "try:" in line and "except NameError:" in line:
            continue
        elif 'BASE_DIR = cur if os.path.exists' in line:
            continue
        else:
            cleaned_lines.append(line)
            
    with open(script, "w", encoding="utf-8") as f:
        f.write("\n".join(cleaned_lines))
    print(f"Fixed: {os.path.basename(script)}")

print("All scripts updated.")
