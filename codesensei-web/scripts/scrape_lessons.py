import os
import requests
from bs4 import BeautifulSoup
import markdownify

topics = [
    ("variables", "https://www.learnpython.org/en/Variables_and_Types"),
    ("lists", "https://www.learnpython.org/en/Lists"),
    ("loops", "https://www.learnpython.org/en/Loops"),
    ("functions", "https://www.learnpython.org/en/Functions"),
    ("string_indexing", "https://www.learnpython.org/en/Basic_String_Operations"),
    ("string_formatting", "https://www.learnpython.org/en/String_Formatting"),
    ("dictionaries", "https://www.learnpython.org/en/Dictionaries"),
    ("conditions", "https://www.learnpython.org/en/Conditions"),
    ("classes", "https://www.learnpython.org/en/Classes_and_Objects"),
    ("modules", "https://www.learnpython.org/en/Modules_and_Packages"),
    ("comprehensions", "https://www.learnpython.org/en/List_Comprehensions"),
    ("lambda", "https://www.learnpython.org/en/Lambda_functions"),
    ("exceptions", "https://www.learnpython.org/en/Exception_Handling"),
    ("sets", "https://www.learnpython.org/en/Sets"),
    ("generators", "https://www.learnpython.org/en/Generators"),
]

gfg_topics = [
    ("recursion", "https://www.geeksforgeeks.org/recursion-in-python/"),
    ("sorting", "https://www.geeksforgeeks.org/sorting-algorithms-in-python/"),
    ("nested_loops", "https://www.geeksforgeeks.org/python-nested-loops/"),
    ("array_boundaries", "https://www.geeksforgeeks.org/python-list-index/"),
]

all_topics = topics + gfg_topics

headers = {"User-Agent": "Mozilla/5.0 (educational prototype)"}

output_dir = os.path.join("content", "lessons")
os.makedirs(output_dir, exist_ok=True)

success_count = 0
placeholder_count = 0

def clean_markdown(md_text):
    lines = md_text.split('\n')
    cleaned_lines = []
    
    # words to filter out
    filter_words = ["Next →", "Previous →", "Copyright", "This site is", "Advertisement", "Exercise"]
    
    for line in lines:
        if any(word in line for word in filter_words):
            continue
            
        # Remove empty link lines
        stripped = line.strip()
        if stripped.startswith('[') and stripped.endswith(']()'):
            continue
            
        cleaned_lines.append(line)
        
    cleaned_text = '\n'.join(cleaned_lines)
    
    # cut off at Exercise if it exists
    exec_idx = cleaned_text.find("Exercise")
    if exec_idx != -1:
        cleaned_text = cleaned_text[:exec_idx]
        
    exec_idx = cleaned_text.find("## Exercise")
    if exec_idx != -1:
         cleaned_text = cleaned_text[:exec_idx]
         
    # collapse 3+ blank lines to 2
    while '\n\n\n' in cleaned_text:
        cleaned_text = cleaned_text.replace('\n\n\n', '\n\n')
        
    return cleaned_text.strip()


for topic_id, url in all_topics:
    topic_name = topic_id.replace("_", " ").title()
    template = f"# {topic_name}\n\n{{content}}\n\n---\nReady for a challenge? Hit the button below."
    
    try:
        print(f"Scraping {topic_id}...", end=" ", flush=True)
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        content_html = ""
        
        if "learnpython.org" in url:
            div = soup.find("div", id="inner-text")
            if div:
                content_html = str(div)
        elif "geeksforgeeks.org" in url:
            div = soup.find("div", class_="article--viewer_content")
            if not div:
                div = soup.find("article")
            if div:
                content_html = str(div)
                
        if content_html:
            md_content = markdownify.markdownify(content_html, heading_style="ATX", code_language="python")
            cleaned_content = clean_markdown(md_content)
            
            final_content = template.format(content=cleaned_content)
            success_count += 1
            print("done")
        else:
            raise Exception("Content div not found")
            
    except Exception as e:
        final_content = template.format(content="This lesson is coming soon.")
        placeholder_count += 1
        print(f"failed: {e}")
        
    filepath = os.path.join(output_dir, f"{topic_id}.md")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(final_content)

print(f"\nSuccessfully scraped: {success_count} topics")
print(f"Placeholders used: {placeholder_count} topics")
print(f"Files saved to {output_dir}/")
