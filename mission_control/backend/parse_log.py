
import json
import sys

def parse_log(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Find the JSON part
        start = content.find('Payload: {')
        if start == -1:
            print("Could not find Payload start")
            return
        
        start += 9 # length of "Payload: "
        
        # Simple brace counting to find the end of JSON
        count = 0
        end = -1
        for i in range(start, len(content)):
            if content[i] == '{':
                count += 1
            elif content[i] == '}':
                count -= 1
                if count == 0:
                    end = i + 1
                    break
        
        if end != -1:
            json_str = content[start:end]
            data = json.loads(json_str)
            print(json.dumps(data, indent=2))
        else:
            print("Could not find JSON end")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    parse_log('full_log.txt')
