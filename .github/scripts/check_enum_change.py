import os
import subprocess
import re
from github import Github

def get_diff():
    base_branch = os.environ.get("GITHUB_BASE_REF")
    diff_cmd = f"git fetch origin {base_branch} && git diff origin/{base_branch} -- Checkinsource.java"
    result = subprocess.run(diff_cmd, shell=True, capture_output=True, text=True)
    return result.stdout

def extract_enum_entries(diff_output):
    added_lines = [line[1:].strip() for line in diff_output.splitlines() if line.startswith('+') and not line.startswith('+++')]
    return [line.rstrip(',;') for line in added_lines if re.match(r'^[A-Z0-9_]+\s*[;,]?\s*$', line)]

def update_pr_description(token, repo_name, pr_number, enum_entries):
    g = Github(token)
    repo = g.get_repo(repo_name)
    pr = repo.get_pull(int(pr_number))

    todos = "\n".join(f"- [ ] Handle logic for new check-in source: `{entry}`" for entry in enum_entries)
    new_body = f"{pr.body}\n\n### 📝 TODOs Added by Bot:\n{todos}" if pr.body else f"### 📝 TODOs Added by Bot:\n{todos}"

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
    pr_number = os.environ.get("GITHUB_REF").split('/')[-1]

    update_pr_description(token, repo, pr_number, enum_entries)

if __name__ == "__main__":
    main()
