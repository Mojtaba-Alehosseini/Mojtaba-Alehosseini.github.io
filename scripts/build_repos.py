#!/usr/bin/env python3
"""Regenerate repos-data.js from the GitHub REST API. Standard library only."""

import datetime
import json
import os
import re
import urllib.error
import urllib.request

USER = "Mojtaba-Alehosseini"
API = "https://api.github.com/users/{}/repos?per_page=100&type=owner&page={}"
MAX_TOPICS = 8

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIELDS_PATH = os.path.join(ROOT, "scripts", "fields.json")
DATA_PATH = os.path.join(ROOT, "repos-data.js")
SYNC_PATH = os.path.join(ROOT, "data", "last-sync.txt")

# Fallback classification for a repo that is not in fields.json yet.
# Checked in this order, first hit wins.
HEURISTIC = [
    ("ML & Data", ["machine learning", "deep learning", "pytorch", "data",
                   "nlp", "computer vision", "forecasting", "sql", "spark"]),
    ("Systems & Algorithms", ["cuda", "mpi", "openmp", "hpc", "algorithm",
                              "c", "cpp"]),
    ("Simulation & OR", ["simulation", "agent", "optimisation", "optimization",
                         "game", "prolog", "jade"]),
    ("Web & Interactive", ["unity", "ar", "web", "javascript", "html", "d3",
                           "react", "site"]),
    ("Blockchain", ["blockchain", "ethereum", "solidity", "mining"]),
]


def words(*parts):
    """Lowercase the given strings and keep only word characters."""
    text = " ".join(p for p in parts if p)
    return re.sub(r"[^a-z0-9+#]+", " ", text.lower()).strip()


def guess_field(repo):
    """Guess the editorial field from topics, language and description."""
    tags = words(" ".join(repo.get("topics") or []), repo.get("language") or "")
    full = words(tags, repo.get("description") or "")
    for field, keys in HEURISTIC:
        for key in keys:
            # A very short key only counts in the topics or the language,
            # because in prose it matches by accident.
            hay = tags if len(key) <= 3 else full
            if re.search(r"\b" + re.escape(key) + r"\b", hay):
                return field
    return None


def fetch_repos():
    """Fetch every page of the public repository list."""
    token = os.environ.get("GITHUB_TOKEN")
    repos = []
    page = 1
    while page < 50:
        request = urllib.request.Request(API.format(USER, page))
        request.add_header("Accept", "application/vnd.github+json")
        request.add_header("User-Agent", "repos-data-sync")
        if token:
            request.add_header("Authorization", "Bearer " + token)
        with urllib.request.urlopen(request, timeout=60) as response:
            batch = json.loads(response.read().decode("utf-8"))
        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return repos


def record(repo, fields):
    """Build one output record. Key order must stay as it is."""
    known = fields.get(repo["name"])
    field = known["d"] if known else guess_field(repo)
    featured = bool(known["f"]) if known else False
    created = repo["created_at"]
    homepage = (repo.get("homepage") or "").strip()
    topics = repo.get("topics") or []
    return {
        "n": repo["name"],
        "d": field,
        "l": repo.get("language"),
        "s": repo.get("size", 0),
        "y": int(created[0:4]),
        "py": int(repo["pushed_at"][0:4]),
        "m": int(created[5:7]),
        "f": featured,
        "fork": bool(repo.get("fork")),
        "u": repo["html_url"],
        "hp": homepage or None,
        "t": len(topics),
        "desc": repo.get("description"),
        "tp": topics[:MAX_TOPICS],
    }


def previous_payload():
    """Return the JSON array text of the current repos-data.js, or None."""
    try:
        with open(DATA_PATH, encoding="utf-8") as handle:
            text = handle.read()
    except OSError:
        return None
    start = text.find("[")
    end = text.rfind("]")
    if start < 0 or end < start:
        return None
    return text[start:end + 1]


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)


def main():
    with open(FIELDS_PATH, encoding="utf-8") as handle:
        fields = json.load(handle)

    repos = [r for r in fetch_repos() if not r.get("archived")]
    # Newest repository first, by creation date.
    repos.sort(key=lambda r: r["created_at"], reverse=True)
    records = [record(r, fields) for r in repos]

    payload = json.dumps(records, ensure_ascii=False, separators=(",", ":"))
    old = previous_payload()
    today = datetime.datetime.now(datetime.timezone.utc)
    header = ("/* Generated {} from the GitHub REST API. {} public repos. "
              "d = field (editorial), f = featured. */").format(
        today.strftime("%Y-%m-%d"), len(records))

    if payload != old:
        write(DATA_PATH, header + "\nwindow.REPOS = " + payload + ";\n")
        print("repos-data.js rewritten")
    else:
        print("repos-data.js unchanged")

    write(SYNC_PATH, "{} - {} public repos\n".format(
        today.strftime("%Y-%m-%d %H:%M UTC"), len(records)))

    old_names = set()
    if old:
        old_names = {r["n"] for r in json.loads(old)}
    new_names = {r["n"] for r in records}
    added = sorted(new_names - old_names)
    removed = sorted(old_names - new_names)
    print("{} repositories".format(len(records)))
    print("added: " + (", ".join(added) if added else "none"))
    print("removed: " + (", ".join(removed) if removed else "none"))

    missing = sorted(n for n in new_names if n not in fields)
    if missing:
        print("not in fields.json, field guessed: " + ", ".join(missing))


if __name__ == "__main__":
    main()
