import sys, re

def strip_c_style(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()

        pattern = re.compile(
            r'//.*?$|/\*.*?\*/|\'(?:\\.|[^\\\'])*\'|"(?:\\.|[^\\"])*"',
            re.DOTALL | re.MULTILINE
        )

        def replacer(match):
            s = match.group(0)
            if s.startswith('/') and not s.startswith('//'):
                return '' 
            elif s.startswith('//'):
                return ''
            else:
                return s

        new_text = re.sub(pattern, replacer, text)
        new_text = '\n'.join([line for line in new_text.splitlines() if line.strip() != ''])
        
        with open(file_path, 'w', encoding='utf-8') as f:
             f.write(new_text)
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

java_js_css_files = [
    'animator.js',
    'player.js'
]

for f in java_js_css_files:
    strip_c_style(f)

print('Done stripping comments.')
