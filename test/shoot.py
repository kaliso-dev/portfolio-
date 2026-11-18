"""Headless check: serves CDN deps from node_modules, captures console + screenshots."""
import asyncio, pathlib, sys, json
from playwright.async_api import async_playwright

T = pathlib.Path(__file__).parent
NM = T / "node_modules"
DIST = T.parent / "dist" / "index.html"
OUT = T / "shots"
OUT.mkdir(exist_ok=True)

FONT_CSS = """
@font-face{font-family:'Geist Mono';font-weight:300;src:url(https://fonts.gstatic.com/l/geist-mono/geist-mono-latin-300-normal.woff2)}
@font-face{font-family:'Geist Mono';font-weight:400;src:url(https://fonts.gstatic.com/l/geist-mono/geist-mono-latin-400-normal.woff2)}
@font-face{font-family:'Geist Mono';font-weight:500;src:url(https://fonts.gstatic.com/l/geist-mono/geist-mono-latin-500-normal.woff2)}
@font-face{font-family:'Geist';font-weight:300;src:url(https://fonts.gstatic.com/l/geist-sans/geist-sans-latin-300-normal.woff2)}
@font-face{font-family:'Geist';font-weight:400;src:url(https://fonts.gstatic.com/l/geist-sans/geist-sans-latin-400-normal.woff2)}
@font-face{font-family:'Geist';font-weight:500;src:url(https://fonts.gstatic.com/l/geist-sans/geist-sans-latin-500-normal.woff2)}
@font-face{font-family:'Geist';font-weight:800;src:url(https://fonts.gstatic.com/l/geist-sans/geist-sans-latin-800-normal.woff2)}
@font-face{font-family:'Geist';font-weight:900;src:url(https://fonts.gstatic.com/l/geist-sans/geist-sans-latin-900-normal.woff2)}
@font-face{font-family:'Instrument Serif';font-weight:400;src:url(https://fonts.gstatic.com/l/instrument-serif/instrument-serif-latin-400-normal.woff2)}
@font-face{font-family:'Jacquard 24';font-weight:400;src:url(https://fonts.gstatic.com/l/jacquard-24/jacquard-24-latin-400-normal.woff2)}
@font-face{font-family:'UnifrakturMaguntia';font-weight:400;src:url(https://fonts.gstatic.com/l/unifrakturmaguntia/unifrakturmaguntia-latin-400-normal.woff2)}
"""


async def route(r):
    url = r.request.url
    if url.startswith("https://cdn.jsdelivr.net/npm/"):
        rest = url.split("/npm/", 1)[1]
        pkg_ver, path = rest.split("/", 1)
        if pkg_ver.startswith("@"):
            scope, rest2 = rest.split("/", 1)
            pkg_ver, path = rest2.split("/", 1)
            pkg = scope + "/" + pkg_ver.rsplit("@", 1)[0]
        else:
            pkg = pkg_ver.rsplit("@", 1)[0]
        f = NM / pkg / path
        if f.exists():
            return await r.fulfill(path=str(f), headers={"content-type": "application/javascript", "access-control-allow-origin": "*"})
        return await r.fulfill(status=404, body="nf")
    if url.startswith("https://fonts.googleapis.com/"):
        return await r.fulfill(body=FONT_CSS, headers={"content-type": "text/css", "access-control-allow-origin": "*"})
    if url.startswith("https://fonts.gstatic.com/l/"):
        fam, fn = url.split("/l/", 1)[1].split("/", 1)
        f = NM / "@fontsource" / fam / "files" / fn
        return await r.fulfill(path=str(f), headers={"content-type": "font/woff2", "access-control-allow-origin": "*"})
    if url.startswith("http://local/assets/"):
        f = DIST.parent / url.split("http://local/", 1)[1].split("?")[0].split("#")[0]
        if f.exists():
            ct = "audio/mpeg" if f.suffix == ".mp3" else "application/octet-stream"
            return await r.fulfill(path=str(f), headers={"content-type": ct, "accept-ranges": "bytes"})
        return await r.fulfill(status=404, body="nf")
    if url.startswith("http://local/"):
        return await r.fulfill(path=str(DIST), headers={"content-type": "text/html"})
    return await r.continue_()


async def main(plan):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=" + ("no-user-gesture-required" if plan.get("autoplay", True) else "document-user-activation-required")])
        vw, vh = plan.get("viewport", [1440, 900])
        ctx = await b.new_context(viewport={"width": vw, "height": vh}, device_scale_factor=1, reduced_motion="reduce" if plan.get("reduced") else "no-preference")
        page = await ctx.new_page()
        logs = []
        page.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))
        page.on("pageerror", lambda e: logs.append(f"[pageerror] {e}"))
        await page.route("**/*", route)
        await page.add_init_script("(()=>{const f=()=>{ if (window.gsap && gsap.ticker) { gsap.ticker.lagSmoothing(0); const o=gsap.ticker.lagSmoothing.bind(gsap.ticker); gsap.ticker.lagSmoothing=()=>o(0); } else setTimeout(f,5); }; f(); /*nolag*/})()")
        await page.goto("http://local/" + plan.get("hash", ""))
        for step in plan["steps"]:
            kind = step[0]
            if kind == "wait":
                await page.wait_for_timeout(step[1])
            elif kind == "shot":
                await page.screenshot(path=str(OUT / step[1]))
            elif kind == "click":
                await page.mouse.click(step[1], step[2])
            elif kind == "move":
                await page.mouse.move(step[1], step[2], steps=step[3] if len(step) > 3 else 8)
            elif kind == "js":
                r = await page.evaluate(step[1])
                logs.append(f"[js] {r}")
            elif kind == "wheel":
                await page.mouse.wheel(step[1], step[2])
            elif kind == "type":
                await page.keyboard.type(step[1], delay=8)
            elif kind == "key":
                await page.keyboard.press(step[1])
            elif kind == "drag":
                _, x0, y0, x1, y1 = step
                await page.mouse.move(x0, y0); await page.mouse.down()
                await page.mouse.move(x1, y1, steps=12); await page.mouse.up()
        print("\n".join(logs[-60:]))
        await b.close()


if __name__ == "__main__":
    a=sys.argv[1]; asyncio.run(main(json.loads(open(a).read() if a.endswith(".json") else a)))
