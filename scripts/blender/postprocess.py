"""
Convierte los renders de Blender en los assets web de public/navidad/.

  python scripts/blender/postprocess.py <carpeta_renders> public/navidad

- PNG con transparencia -> WebP (calidad 85, alfa conservado)
- og-navidad.png        -> og-navidad.jpg (1200x630, redes sociales) + og-navidad.webp
- video-poster.png      -> hero-poster.webp (1920x1080)
- frames/f_XXXX.png     -> hero-navidad.mp4 (H.264, sin audio, faststart) + hero-navidad.webm (VP9)
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image

src = Path(sys.argv[1])
dst = Path(sys.argv[2])
dst.mkdir(parents=True, exist_ok=True)


def webp(name: str, out: str, size=None, q=85):
    im = Image.open(src / name)
    if size:
        im = im.resize(size, Image.LANCZOS)
    im.save(dst / out, "WEBP", quality=q, method=6)
    print(f"{out}: {im.size[0]}x{im.size[1]} {(dst / out).stat().st_size / 1024:.0f} KB")


for n in ("canasta-3d", "regalos-3d", "esferas-3d", "birrete-3d"):
    if (src / f"{n}.png").exists():
        webp(f"{n}.png", f"{n}.webp")

if (src / "og-navidad.png").exists():
    og = Image.open(src / "og-navidad.png").convert("RGB")
    og.save(dst / "og-navidad.jpg", "JPEG", quality=86, optimize=True, progressive=True)
    webp("og-navidad.png", "og-navidad.webp", q=80)

if (src / "video-poster.png").exists():
    webp("video-poster.png", "hero-poster.webp", q=72)

frames = src / "frames"
if frames.exists() and any(frames.glob("f_*.png")):
    pattern = str(frames / "f_%04d.png")
    common = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", "24", "-start_number", "1", "-i", pattern, "-an"]
    subprocess.run(common + ["-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p",
                             "-profile:v", "high", "-movflags", "+faststart", str(dst / "hero-navidad.mp4")], check=True)
    subprocess.run(common + ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", "-row-mt", "1", "-deadline", "good",
                             "-cpu-used", "2", "-pix_fmt", "yuv420p", str(dst / "hero-navidad.webm")], check=True)
    for f in ("hero-navidad.mp4", "hero-navidad.webm"):
        print(f"{f}: {(dst / f).stat().st_size / 1024:.0f} KB")

# Galería "Mira nuestras canastas" (fotos referenciales 1080x1350)
gal = src / "galeria"
if gal.exists():
    (dst / "canastas").mkdir(exist_ok=True)
    for f in sorted(gal.glob("canasta-*.png")):
        out = dst / "canastas" / f"{f.stem}.webp"
        Image.open(f).convert("RGB").save(out, "WEBP", quality=80, method=6)
        print(f"canastas/{out.name}: {(out.stat().st_size / 1024):.0f} KB")

# Video vertical de ejemplo para "Cómo participar" (recorte 9:16 del loop) — se reemplaza por el de marketing
if frames.exists() and any(frames.glob("f_*.png")):
    vf = "crop=608:1080:980:0,scale=720:1280:flags=lanczos"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "24", "-start_number", "1",
                    "-i", str(frames / "f_%04d.png"), "-an", "-vf", vf, "-c:v", "libx264", "-preset", "slow",
                    "-crf", "25", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    str(dst / "como-participar.mp4")], check=True)
    Image.open(frames / "f_0001.png").convert("RGB").crop((980, 0, 1588, 1080)).resize((720, 1280), Image.LANCZOS) \
        .save(dst / "como-participar-poster.webp", "WEBP", quality=75, method=6)
    print(f"como-participar.mp4: {(dst / 'como-participar.mp4').stat().st_size / 1024:.0f} KB")
