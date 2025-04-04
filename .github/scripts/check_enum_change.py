import os
import subprocess
import re
import json
from github import Github

def get_diff():
    base_branch = os.environ.get("GITHUB_BASE_REF")
    if not base_branch:
        raise RuntimeError("GITHUB_BASE_REF is not set.")
    
    diff_cmd = f"git fetch origin {base_branch} && git diff origin/{base_branch} -- Checkinsource.java"
    result = subprocess.run(diff_cmd, shell=True, capture_output=True, text=True)

    print("=== GIT DIFF ===")
    print(result.stdout)
    print("================")

    return result.stdout

def extract_enum_entries(diff_output):
    added_lines = [
        line[1:].strip() for line in diff_output.splitlines()
        if line.startswith('+') and not line.startswith('+++')
    ]

    # Regex pattern for matching enum lines like:
    # - YAY,
    # - YAY("web"),
    # - YAY("web", true);
    pattern = re.compile(r'^([A-Z0-9_]+)(\s*\(.*?\))?\s*[;,]?$')

    entries = []
    for line in added_lines:
        match = pattern.match(line)
        if match:
            entries.append(match.group(1))  # Capture only the enum name
    return entries

def get_pr_number_from_event():
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    with open(event_path, 'r') as f:
        event_data = json.load(f)
    return event_data["number"]

def update_pr_description(token, repo_name, pr_number, enum_entries):
    g = Github(token)
    repo = g.get_repo(repo_name)
    pr = repo.get_pull(pr_number)

    # Generate TODOs for each new enum entry
    todos = "\n".join(f"- [ ] Handle logic for new check-in source: `{entry}`" for entry in enum_entries)

    todo_section = f"\n\n### 📝 TODOs Added by Bot:\n{todos}"
    new_body = f"{pr.body}{todo_section}" if pr.body else todo_section

    pr.edit(body=new_body)
    print("✅ PR description updated.")

def main():
    diff_output = get_diff()
    enum_entries = extract_enum_entries(diff_output)

    if not enum_entries:
        print("No enum additions detected.")
        return

    token = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY")
    pr_number = get_pr_number_from_event()

    update_pr_description(token, repo, pr_number, enum_entries)

if __name__ == "__main__":
    main()
