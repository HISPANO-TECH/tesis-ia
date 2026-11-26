"""
Piezas 3D de la landing del banco de temas (/banco-temas-tesis/), generadas por código.
  portada  -> libro abierto con hojas, birrete, bombilla encendida y fichas de temas flotando
  pdf      -> pila de hojas del PDF con el emblema de Hispano Tech y etiqueta PDF
  icono-idea, icono-balanza, icono-plan -> íconos 3D de la sección "Te sirve si…"
Uso (desde tesis-ia/):
  blender -b --factory-startup -P scripts/blender/banco_scene.py -- <modo> <carpeta_salida> [escala]
"""
import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODO = argv[0] if argv else "portada"
OUT = os.path.abspath(argv[1] if len(argv) > 1 else "render-banco")
ESCALA = int(argv[2]) if len(argv) > 2 else 100
os.makedirs(OUT, exist_ok=True)
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FUENTE = "C:/Windows/Fonts/arialbd.ttf"
SIMBOLOS = "C:/Windows/Fonts/seguisym.ttf"

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"
try:
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Punchy"
except TypeError:
    pass


def enlazar(o):
    sc.collection.objects.link(o)
    return o


def mat(nombre, color, metal=0.0, rugos=0.45, capa=0.0, emision=None, fuerza=0.0):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rugos
    p.inputs["Coat Weight"].default_value = capa
    if emision:
        p.inputs["Emission Color"].default_value = (*emision, 1)
        p.inputs["Emission Strength"].default_value = fuerza
    return m


def vidrio():
    m = bpy.data.materials.new("Vidrio")
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (1.0, 0.86, 0.55, 1)
    p.inputs["Roughness"].default_value = 0.08
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["IOR"].default_value = 1.45
    p.inputs["Emission Color"].default_value = (1.0, 0.78, 0.3, 1)
    p.inputs["Emission Strength"].default_value = 0.25
    m.surface_render_method = "BLENDED" if hasattr(m, "surface_render_method") else m.blend_method
    return m


M = {
    "azul": mat("AzulNoche", (0.012, 0.035, 0.13), rugos=0.35, capa=0.7),
    "azul2": mat("AzulMarca", (0.03, 0.09, 0.42), rugos=0.3, capa=0.8),
    "papel": mat("Papel", (0.93, 0.9, 0.82), rugos=0.75),
    "blanco": mat("Blanco", (0.95, 0.95, 0.96), rugos=0.4, capa=0.3),
    "oro": mat("Oro", (1.0, 0.7, 0.22), metal=1.0, rugos=0.22),
    "ambar": mat("Ambar", (0.98, 0.62, 0.06), rugos=0.35, capa=0.5),
    "rojo": mat("Rojo", (0.75, 0.04, 0.05), rugos=0.3, capa=0.6),
    "gris": mat("Gris", (0.55, 0.58, 0.63), metal=1.0, rugos=0.3),
    "lineas": mat("Lineas", (0.55, 0.6, 0.7), rugos=0.6),
    "verde": mat("Verde", (0.06, 0.62, 0.3), rugos=0.3, capa=0.6),
    "filamento": mat("Filamento", (1, 0.8, 0.3), emision=(1.0, 0.62, 0.15), fuerza=14),
}


def malla(nombre, bm, material, suave=True, loc=(0, 0, 0), rot=(0, 0, 0)):
    me = bpy.data.meshes.new(nombre)
    bm.to_mesh(me)
    bm.free()
    o = enlazar(bpy.data.objects.new(nombre, me))
    o.location, o.rotation_euler = loc, rot
    if suave:
        for f in o.data.polygons:
            f.use_smooth = True
    o.data.materials.append(material)
    return o


def caja(nombre, tam, material, loc=(0, 0, 0), rot=(0, 0, 0), bisel=0.02):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=Vector(tam), verts=bm.verts)
    o = malla(nombre, bm, material, suave=False, loc=loc, rot=rot)
    if bisel:
        b = o.modifiers.new("bisel", "BEVEL")
        b.width, b.segments = bisel, 3
        for f in o.data.polygons:
            f.use_smooth = True
    return o


def esfera(nombre, r, material, loc=(0, 0, 0), escala=(1, 1, 1)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=r)
    o = malla(nombre, bm, material, loc=loc)
    o.scale = escala
    return o


def cilindro(nombre, r, alto, material, loc=(0, 0, 0), rot=(0, 0, 0), r2=None, seg=48):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=alto)
    return malla(nombre, bm, material, loc=loc, rot=rot)


def texto(nombre, cuerpo, tam, material, loc, rot=(math.radians(90), 0, 0), fuente=FUENTE, extruir=0.01):
    cu = bpy.data.curves.new(nombre, "FONT")
    cu.body = cuerpo
    if os.path.exists(fuente):
        cu.font = bpy.data.fonts.load(fuente, check_existing=True)
    cu.size, cu.extrude, cu.align_x, cu.align_y = tam, extruir, "CENTER", "CENTER"
    o = enlazar(bpy.data.objects.new(nombre, cu))
    o.location, o.rotation_euler = loc, rot
    o.data.materials.append(material)
    return o


def grupo(nombre, hijos, loc=(0, 0, 0), rot=(0, 0, 0), escala=1.0):
    e = enlazar(bpy.data.objects.new(nombre, None))
    for h in hijos:
        h.parent = e
    e.location, e.rotation_euler, e.scale = loc, rot, (escala,) * 3
    return e


# ------------------------------------------------------------------ modelos
def hoja_curva(nombre, ancho, largo, curva, material, loc, rot):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
    o = bpy.context.active_object
    o.name = nombre
    o.scale = (ancho, largo, 1)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.subdivide(number_cuts=24)
    bpy.ops.object.mode_set(mode="OBJECT")
    o.location = (ancho / 2, 0, 0)
    bpy.ops.object.transform_apply(location=True)
    d = o.modifiers.new("curva", "SIMPLE_DEFORM")
    d.deform_method, d.deform_axis, d.angle = "BEND", "Y", curva
    s = o.modifiers.new("grosor", "SOLIDIFY")
    s.thickness = 0.006
    for f in o.data.polygons:
        f.use_smooth = True
    o.data.materials.append(material)
    o.location, o.rotation_euler = loc, rot
    return o


def libro_abierto():
    partes = []
    for lado in (-1, 1):
        rot = (0, math.radians(lado * -9), 0)
        partes.append(caja(f"Tapa{lado}", (1.55, 2.15, 0.05), M["azul"], loc=(lado * 0.78, 0, -0.06), rot=rot, bisel=0.02))
        partes.append(caja(f"Bloque{lado}", (1.45, 2.0, 0.16), M["papel"], loc=(lado * 0.74, 0, 0.06), rot=rot, bisel=0.03))
        for i in range(4):
            partes.append(hoja_curva(f"Hoja{lado}{i}", 1.38, 1.95, math.radians(lado * (28 + i * 14)), M["papel"],
                                     loc=(0, 0, 0.15 + i * 0.012), rot=(0, math.radians(-90 + lado * 90 + lado * (6 + i * 7)), 0) if lado < 0 else (0, math.radians(-(6 + i * 7)), 0)))
        for j in range(6):  # renglones impresos
            partes.append(caja(f"Linea{lado}{j}", (1.0 - (j % 3) * 0.15, 0.04, 0.004), M["lineas"],
                               loc=(lado * 0.74, 0.65 - j * 0.24, 0.15), rot=rot, bisel=0))
    partes.append(cilindro("Lomo", 0.06, 2.15, M["oro"], loc=(0, 0, -0.04), rot=(math.radians(90), 0, 0)))
    return grupo("Libro", partes)


def birrete():
    p = [cilindro("Copa", 0.42, 0.34, M["azul"], loc=(0, 0, 0.17), r2=0.46),
         caja("Tabla", (1.3, 1.3, 0.05), M["azul"], loc=(0, 0, 0.37), rot=(0, 0, math.radians(45)), bisel=0.01),
         cilindro("Boton", 0.05, 0.03, M["oro"], loc=(0, 0, 0.41), seg=24)]
    cu = bpy.data.curves.new("Cordon", "CURVE")
    cu.dimensions, cu.bevel_depth = "3D", 0.012
    sp = cu.splines.new("BEZIER")
    pts = [(0, 0, 0.41), (0.35, -0.05, 0.42), (0.7, -0.08, 0.38), (0.88, -0.06, 0.15)]
    sp.bezier_points.add(len(pts) - 1)
    for bp, pt in zip(sp.bezier_points, pts):
        bp.co = pt
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    c = enlazar(bpy.data.objects.new("Cordon", cu))
    c.data.materials.append(M["oro"])
    p += [c, cilindro("Borla", 0.035, 0.22, M["oro"], loc=(0.88, -0.06, 0.03), r2=0.07, seg=20)]
    return grupo("Birrete", p)


def bombilla():
    p = [esfera("Globo", 0.42, vidrio(), loc=(0, 0, 0.55), escala=(1, 1, 1.08)),
         esfera("Luz", 0.16, M["filamento"], loc=(0, 0, 0.5)),
         cilindro("Cuello", 0.2, 0.22, M["gris"], loc=(0, 0, 0.05), r2=0.24)]
    for k in range(3):
        p.append(cilindro(f"Rosca{k}", 0.215, 0.035, M["oro"], loc=(0, 0, -0.03 - k * 0.06)))
    p.append(cilindro("Punta", 0.12, 0.08, M["azul"], loc=(0, 0, -0.22), r2=0.04))
    luz = bpy.data.lights.new("LuzBombilla", "POINT")
    luz.energy, luz.color, luz.shadow_soft_size = 40, (1.0, 0.75, 0.35), 0.3
    lo = enlazar(bpy.data.objects.new("LuzBombilla", luz))
    lo.location = (0, 0, 0.5)
    p.append(lo)
    return grupo("Bombilla", p)


def ficha(nombre, color_barra, loc, rot):
    p = [caja(nombre + "Base", (1.0, 0.66, 0.035), M["blanco"], bisel=0.03),
         caja(nombre + "Barra", (0.08, 0.66, 0.04), color_barra, loc=(-0.46, 0, 0.003), bisel=0.01)]
    for k, w in enumerate((0.62, 0.74, 0.5)):
        p.append(caja(f"{nombre}L{k}", (w, 0.055, 0.01), M["lineas"] if k else M["azul2"],
                      loc=(-0.36 + w / 2, 0.18 - k * 0.17, 0.022), bisel=0))
    return grupo(nombre, p, loc=loc, rot=rot)


def hoja_pdf(nombre, loc, rot, logo=False, etiqueta=False):
    p = [caja(nombre, (1.3, 1.75, 0.02), M["blanco"], bisel=0.012)]
    for k in range(9):
        w = 0.95 if k % 4 else 0.6
        p.append(caja(f"{nombre}L{k}", (w, 0.04, 0.006), M["lineas"], loc=(-0.52 + w / 2, 0.15 - k * 0.12, 0.013), bisel=0))
    if logo:
        ruta = os.path.join(RAIZ, "public", "logo-hispano-tech-emblema.webp")
        img = bpy.data.images.load(ruta)
        m = bpy.data.materials.new("Logo")
        m.use_nodes = True
        nt = m.node_tree
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = img
        pr = nt.nodes["Principled BSDF"]
        nt.links.new(t.outputs["Color"], pr.inputs["Base Color"])
        nt.links.new(t.outputs["Alpha"], pr.inputs["Alpha"])
        pr.inputs["Roughness"].default_value = 0.5
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.5, 0.014))
        lg = bpy.context.active_object
        lg.scale = (0.55, 0.55 * img.size[1] / img.size[0], 1)
        lg.data.materials.append(m)
        p.append(lg)
        p.append(caja(nombre + "Titulo", (0.8, 0.07, 0.008), M["azul"], loc=(0, 0.2, 0.013), bisel=0))
    if etiqueta:
        p.append(caja(nombre + "Tag", (0.5, 0.26, 0.04), M["rojo"], loc=(0.5, -0.62, 0.03), bisel=0.02))
        p.append(texto(nombre + "TagTxt", "PDF", 0.17, M["blanco"], loc=(0.5, -0.62, 0.052), rot=(0, 0, 0), extruir=0.004))
    return grupo(nombre + "Grupo", p, loc=loc, rot=rot)


def balanza():
    p = [cilindro("Base", 0.4, 0.08, M["azul"], loc=(0, 0, 0.04)), cilindro("Poste", 0.05, 1.1, M["oro"], loc=(0, 0, 0.6)),
         caja("Brazo", (1.5, 0.07, 0.07), M["oro"], loc=(0, 0, 1.12), rot=(0, math.radians(-6), 0), bisel=0.02),
         esfera("Pomo", 0.08, M["oro"], loc=(0, 0, 1.2))]
    for s, z in ((-1, 1.2), (1, 1.04)):
        for k in (-1, 1):
            p.append(cilindro(f"Hilo{s}{k}", 0.008, 0.5, M["gris"], loc=(s * 0.72 + k * 0.1, 0, z - 0.25), rot=(0, math.radians(-k * 11), 0), seg=8))
        p.append(cilindro(f"Plato{s}", 0.3, 0.05, M["ambar"], loc=(s * 0.72, 0, z - 0.5), r2=0.22))
    return grupo("Balanza", p)


def plan():
    p = [caja("Doc", (1.1, 1.45, 0.05), M["blanco"], bisel=0.03), caja("Clip", (0.4, 0.14, 0.08), M["oro"], loc=(0, 0.72, 0.04), bisel=0.03)]
    for k in range(3):
        y = 0.35 - k * 0.38
        p.append(cilindro(f"Circulo{k}", 0.14, 0.03, M["verde"], loc=(-0.3, y, 0.035), seg=32))
        p.append(caja(f"CheckA{k}", (0.1, 0.035, 0.03), M["blanco"], loc=(-0.335, y - 0.015, 0.055), rot=(0, 0, math.radians(-45)), bisel=0.008))
        p.append(caja(f"CheckB{k}", (0.17, 0.035, 0.03), M["blanco"], loc=(-0.275, y + 0.01, 0.055), rot=(0, 0, math.radians(50)), bisel=0.008))
        p.append(caja(f"DocL{k}", (0.5, 0.07, 0.012), M["lineas"], loc=(0.16, y, 0.03), bisel=0))
    return grupo("Plan", p)


# ------------------------------------------------------------------ luces y cámara
def luces():
    for n, loc, rot, e, c, t in (("Clave", (-3.5, -4, 5), (50, 0, -40), 900, (1, 0.92, 0.82), 4),
                                 ("Relleno", (4.5, -3, 2.5), (68, 0, 55), 380, (0.8, 0.87, 1), 5),
                                 ("Contra", (1, 4.5, 4), (-55, 0, 165), 700, (1, 0.82, 0.55), 3)):
        d = bpy.data.lights.new(n, "AREA")
        d.energy, d.color, d.size = e, c, t
        o = enlazar(bpy.data.objects.new(n, d))
        o.location, o.rotation_euler = loc, [math.radians(a) for a in rot]
    w = bpy.data.worlds.new("Mundo")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.45, 0.5, 0.62, 1)
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.45
    sc.world = w


def camara(loc, mira, lente=50):
    d = bpy.data.cameras.new("Cam")
    d.lens = lente
    o = enlazar(bpy.data.objects.new("Cam", d))
    o.location = loc
    o.rotation_euler = (Vector(mira) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    sc.camera = o


def render(nombre, w, h, muestras=96):
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = w, h, ESCALA
    sc.render.film_transparent = True
    sc.render.image_settings.file_format, sc.render.image_settings.color_mode = "PNG", "RGBA"
    sc.eevee.taa_render_samples = muestras
    for a in ("use_shadows", "use_raytracing", "use_gtao"):
        if hasattr(sc.eevee, a):
            setattr(sc.eevee, a, True)
    sc.render.filepath = os.path.join(OUT, nombre)
    bpy.ops.render.render(write_still=True)
    print("[banco] render:", sc.render.filepath)


luces()
if MODO == "portada":
    libro_abierto()
    grupo("BirreteG", [birrete()], loc=(-0.15, 0.25, 1.45), rot=(math.radians(12), math.radians(-14), math.radians(-25)), escala=1.05)
    grupo("BombillaG", [bombilla()], loc=(1.75, 0.55, 1.15), rot=(math.radians(8), math.radians(14), 0), escala=0.95)
    ficha("Ficha1", M["ambar"], loc=(-1.95, -0.6, 1.0), rot=(math.radians(70), math.radians(-12), math.radians(18)))
    ficha("Ficha2", M["azul2"], loc=(1.95, -0.85, 0.55), rot=(math.radians(68), math.radians(16), math.radians(-22)))
    ficha("Ficha3", M["rojo"], loc=(-1.25, 0.95, 2.15), rot=(math.radians(62), math.radians(-6), math.radians(8)))
    camara((0, -6.2, 3.6), (0, 0.1, 0.75), lente=40)
    render("banco-portada.png", 1200, 1000)
elif MODO == "pdf":
    hoja_pdf("H3", (0.22, 0.16, -0.06), (0, 0, math.radians(9)))
    hoja_pdf("H2", (0.1, 0.06, -0.03), (0, 0, math.radians(4)))
    hoja_pdf("H1", (0, 0, 0), (0, 0, math.radians(-3)), logo=True, etiqueta=True)
    camara((0.9, -3.6, 3.3), (0.05, -0.05, 0), lente=50)
    render("banco-pdf.png", 900, 900)
elif MODO in ("icono-idea", "icono-balanza", "icono-plan"):
    if MODO == "icono-idea":
        bombilla()
        camara((0, -3.4, 1.4), (0, 0, 0.3), lente=50)
    elif MODO == "icono-balanza":
        balanza()
        camara((0, -4.2, 1.6), (0, 0, 0.65), lente=50)
    else:
        grupo("PlanG", [plan()], rot=(math.radians(60), 0, math.radians(-12)))
        camara((0, -3.6, 1.2), (0, 0, 0.1), lente=50)
    render(f"{MODO}.png", 500, 500)
else:
    raise SystemExit(f"Modo desconocido: {MODO}")
