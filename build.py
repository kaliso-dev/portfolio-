"""Assemble le site : src/template.html + style.css + js/*.js + projets (src/projets/*.md) -> dist/index.html

Variables d'environnement facultatives :
  SITE_URL  adresse publique du site (ex. https://kaliso.pages.dev), pour l'image d'aperçu des réseaux sociaux.
            Netlify fournit URL automatiquement ; sur Cloudflare, définis SITE_URL dans les variables de build.
"""
import html
import json
import os
import pathlib
import re
import shutil
import sys

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
LANGS = ("fr", "en")
SECTIONS = ("quete", "claude", "decisions", "resultats")
UNITES = ("heures", "jours", "semaines", "mois")
EMBLEMS = ("sword", "tower", "crown", "key", "shield", "chalice", "helm")


def warn(f, msg):
    print(f"  ⚠ {f.name} : {msg}", file=sys.stderr)


# --- markdown minimal (paragraphes, listes, gras, italique, code, liens) -------
def inline(s):
    s = html.escape(s, quote=True)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", s)
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", r'<a href="\2" target="_blank" rel="noopener noreferrer">\1</a>', s)
    return s


def md_to_html(text):
    out, para, items, kind = [], [], [], None

    def flush():
        nonlocal para, items, kind
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para = []
        if items:
            out.append(f"<{kind}>" + "".join(f"<li>{inline(i)}</li>" for i in items) + f"</{kind}>")
            items, kind = [], None

    for raw in text.strip().splitlines():
        line = raw.strip()
        m_ul = re.match(r"^[-*]\s+(.*)", line)
        m_ol = re.match(r"^\d+[.)]\s+(.*)", line)
        if not line:
            flush()
        elif line.startswith("### "):
            flush()
            out.append("<h4>" + inline(line[4:]) + "</h4>")
        elif m_ul or m_ol:
            k = "ul" if m_ul else "ol"
            if para or (kind and kind != k):
                flush()
            kind = k
            items.append((m_ul or m_ol).group(1))
        elif items and raw.startswith(("  ", "\t")):
            items[-1] += " " + line
        else:
            if items:
                flush()
            para.append(line)
    flush()
    return "".join(out)


# --- une fiche projet -----------------------------------------------------------
def parse_projet(f):
    text = f.read_text(encoding="utf-8")
    m = re.search(r"```json\s*\n(.*?)\n```", text, re.S)
    if not m:
        warn(f, "bloc ```json introuvable, fichier ignoré")
        return None
    try:
        fiche = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        warn(f, f"JSON invalide ({e}), fichier ignoré")
        return None
    rest = text[: m.start()] + text[m.end():]

    # sections de premier niveau : # fr, # en, # code
    parts = re.split(r"^#\s+(fr|en|code)\s*$", rest, flags=re.M | re.I)
    story, code = {}, fiche.get("code", "")
    for i in range(1, len(parts), 2):
        key, body = parts[i].lower(), parts[i + 1]
        if key == "code":
            cm = re.search(r"```[\w+-]*\s*\n(.*?)\n```", body, re.S)
            if cm:
                code = cm.group(1)
            continue
        secs = re.split(r"^##\s+(\w+)\s*$", body, flags=re.M)
        st = {}
        for j in range(1, len(secs), 2):
            sid = secs[j].lower()
            if sid in SECTIONS and secs[j + 1].strip():
                st[sid] = md_to_html(secs[j + 1])
        if st:
            story[key] = st

    p = {
        "slug": re.sub(r"[^a-z0-9-]", "", str(fiche.get("slug") or f.stem).lower()),
        "name": str(fiche.get("name") or f.stem).upper(),
        "ext": fiche.get("ext", ""),
        "year": fiche.get("year", ""),
        "order": fiche.get("order", 99),
        "hue": int(fiche.get("hue", 160)) % 360,
        "emblem": fiche.get("emblem") if fiche.get("emblem") in EMBLEMS else "sword",
        "stack": fiche.get("stack", []),
        "code": code,
    }
    for k in ("url", "repo", "cover", "shots", "exemple"):
        if fiche.get(k):
            p[k] = fiche[k]
    t = fiche.get("temps")
    if isinstance(t, dict) and t.get("estime") and t.get("reel"):
        p["temps"] = {"estime": t["estime"], "reel": t["reel"], "unite": t.get("unite") if t.get("unite") in UNITES else "semaines"}
    i18n = {}
    for lang in LANGS:
        b = fiche.get(lang)
        if isinstance(b, dict):
            i18n[lang] = {k: b[k] for k in ("type", "services", "description", "notes", "stats") if k in b}
    if "fr" not in i18n:
        warn(f, "bloc \"fr\" manquant, fichier ignoré")
        return None
    for k in ("type", "services", "description", "notes", "stats"):
        if k not in i18n["fr"]:
            warn(f, f"champ fr.{k} manquant")
    for lang in ("en",):
        if lang not in i18n:
            warn(f, f"pas de traduction {lang} (le français sera affiché)")
    for lang, b in i18n.items():
        for k, n in (("services", 3), ("description", 2), ("notes", 2), ("stats", 4)):
            if k in b and len(b[k]) != n:
                warn(f, f"{lang}.{k} : {len(b[k])} élément(s) au lieu de {n}")
        if any("?" in str(v) for v in b.get("stats", [])):
            warn(f, f"{lang}.stats contient encore des « ? » à compléter")
    p["i18n"] = i18n
    if story:
        p["story"] = story
    if not p["stack"]:
        warn(f, "stack vide")
        p["stack"] = ["—"]
    return p


def load_projets():
    d = SRC / "projets"
    projets = []
    for f in sorted(d.glob("*.md")) if d.exists() else []:
        if f.name.startswith("_"):
            continue
        p = parse_projet(f)
        if p:
            projets.append(p)
    projets.sort(key=lambda p: (p["order"], -int(p["year"] or 0)))
    slugs = [p["slug"] for p in projets]
    if len(set(slugs)) != len(slugs):
        sys.exit("✗ deux projets ont le même slug")
    return projets


def main():
    tpl = (SRC / "template.html").read_text(encoding="utf-8")
    css = (SRC / "style.css").read_text(encoding="utf-8")
    js = "\n".join(p.read_text(encoding="utf-8") for p in sorted((SRC / "js").glob("*.js")))
    projets = load_projets()
    data = json.dumps(projets, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    if "/*__PROJETS__*/[]" not in js:
        sys.exit("✗ marqueur /*__PROJETS__*/[] introuvable dans src/js")
    js = js.replace("/*__PROJETS__*/[]", data)
    # illustrations du compte rendu de la forge : src/assets/forge/<diapo>.(webp|avif|png|jpg|svg)
    art = {}
    fdir = SRC / "assets" / "forge"
    if fdir.exists():
        for f in sorted(fdir.iterdir()):
            if f.suffix.lower() in (".webp", ".avif", ".png", ".jpg", ".jpeg", ".svg") and f.stem in ("plan", "features", "stack", "steps", "range", "questions"):
                art.setdefault(f.stem, "assets/forge/" + f.name)
    js = js.replace("/*__FORGE_ART__*/{}", json.dumps(art))
    site_url = (os.environ.get("SITE_URL") or os.environ.get("URL") or "").rstrip("/")
    out = tpl.replace("/*__CSS__*/", css).replace("/*__JS__*/", js).replace("__SITE_URL__", site_url)
    dist = ROOT / "dist"
    dist.mkdir(exist_ok=True)
    (dist / "index.html").write_text(out, encoding="utf-8")
    if (SRC / "assets").exists():
        shutil.copytree(SRC / "assets", dist / "assets", dirs_exist_ok=True, ignore=shutil.ignore_patterns("*.md"))
    for extra in ("robots.txt", "_headers"):
        if (SRC / extra).exists():
            shutil.copy(SRC / extra, dist / extra)
    print(f"built {len(out)} bytes — {len(projets)} projets" + (f" — {site_url}" if site_url else ""))


if __name__ == "__main__":
    main()
