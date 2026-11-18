import pathlib, shutil

ROOT = pathlib.Path(__file__).parent
src = ROOT / "src"
tpl = (src / "template.html").read_text()
css = (src / "style.css").read_text()
js = "\n".join(p.read_text() for p in sorted((src / "js").glob("*.js")))
out = tpl.replace("/*__CSS__*/", css).replace("/*__JS__*/", js)
dist = ROOT / "dist"
dist.mkdir(exist_ok=True)
(dist / "index.html").write_text(out)
# fichiers statiques (musique…) copiés tels quels
if (src / "assets").exists():
    shutil.copytree(src / "assets", dist / "assets", dirs_exist_ok=True)
print("built", len(out), "bytes")
