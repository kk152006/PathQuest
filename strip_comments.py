import sys, re

def strip_c_style(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()

        # matches comments and strings
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

def strip_html_style(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()

        new_text = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
        new_text = '\n'.join([line for line in new_text.splitlines() if line.strip() != ''])

        with open(file_path, 'w', encoding='utf-8') as f:
             f.write(new_text)
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

java_js_css_files = [
    'algorithms.js',
    'game.js',
    'style.css',
    'ui.js',
    'backend/src/main/java/com/pathquest/PathQuestApplication.java',
    'backend/src/main/java/com/pathquest/algorithms/AStar.java',
    'backend/src/main/java/com/pathquest/algorithms/BFS.java',
    'backend/src/main/java/com/pathquest/algorithms/DFS.java',
    'backend/src/main/java/com/pathquest/algorithms/Dijkstra.java',
    'backend/src/main/java/com/pathquest/controller/PathfindingController.java',
    'backend/src/main/java/com/pathquest/model/PathRequest.java',
    'backend/src/main/java/com/pathquest/model/PathResult.java'
]

html_xml_files = [
    'index.html',
    'backend/pom.xml'
]

for f in java_js_css_files:
    strip_c_style(f)

for f in html_xml_files:
    strip_html_style(f)

print('Done stripping comments.')
