"""
Escena 3D de la campaña "25 Canastas Navideñas" (tesis-ia.com / HispanoTech).

Genera por código (sin assets externos) los elementos 3D de la página /navidad:
  canasta  -> canasta navideña con panetón, chocolates, bombones, bastón, ramas de pino
  regalos  -> pila de 3 cajas de regalo con lazos
  esferas  -> 3 esferas navideñas (roja, dorada con glitter, azul con franjas)
  birrete  -> birrete de graduación con nieve y acebo (vínculo académico)
  og       -> escena completa 1200x630 para compartir en redes (Open Graph)
  video    -> escena completa animada (loop perfecto de 6 s, 24 fps, 1920x1080)

Uso (desde tesis-ia/):
  blender -b --factory-startup -P scripts/blender/navidad_scene.py -- <modo> <carpeta_salida> [escala_resolucion]

Los PNG de salida se convierten a WebP/MP4 con scripts/blender/postprocess.py
"""
import bpy
import bmesh
import math
import random
import sys
import os
from mathutils import Vector, Matrix, Euler

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = argv[0] if argv else "canasta"
OUT = os.path.abspath(argv[1] if len(argv) > 1 else "render-out")
RES_SCALE = int(argv[2]) if len(argv) > 2 else 100
os.makedirs(OUT, exist_ok=True)
random.seed(2026)

FONT_PATH = "C:/Windows/Fonts/arialbd.ttf"
LOOP_FRAMES = 144  # 6 s a 24 fps

# ---------------------------------------------------------------- utilidades
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    for eng in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        try:
            sc.render.engine = eng
            break
        except TypeError:
            continue
    try:
        sc.view_settings.view_transform = "AgX"
        for look in ("AgX - Punchy", "Punchy", "AgX - Medium High Contrast"):
            try:
                sc.view_settings.look = look
                break
            except TypeError:
                pass
    except TypeError:
        pass
    return sc


def link(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj


def new_mat(name, color=(0.8, 0.8, 0.8), metallic=0.0, rough=0.5, coat=0.0, emission=None, estr=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Roughness"].default_value = rough
    if coat:
        p.inputs["Coat Weight"].default_value = coat
    if emission:
        p.inputs["Emission Color"].default_value = (*emission, 1)
        p.inputs["Emission Strength"].default_value = estr
    return m


def sock(node, name, kind=None, out=False):
    socks = node.outputs if out else node.inputs
    for s in socks:
        if s.name == name and (kind is None or s.type == kind):
            return s
    raise KeyError(name)


def add_bump(m, tex_out, strength=0.3, distance=0.02):
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = strength
    b.inputs["Distance"].default_value = distance
    nt.links.new(tex_out, b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    return b


def emission_mat(name, color, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    o = nt.nodes.new("ShaderNodeOutputMaterial")
    e = nt.nodes.new("ShaderNodeEmission")
    e.name = "Emission"
    e.inputs["Color"].default_value = (*color, 1)
    e.inputs["Strength"].default_value = strength
    nt.links.new(e.outputs[0], o.inputs["Surface"])
    return m


def set_mat(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


def shade_smooth(obj):
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def mesh_from_bm(name, bm):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return link(bpy.data.objects.new(name, me))


def uv_sphere(name, r, loc, mat, seg=32, rings=16, scale=(1, 1, 1)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)
    o = mesh_from_bm(name, bm)
    o.location = loc
    o.scale = scale
    shade_smooth(o)
    return set_mat(o, mat)


def cylinder(name, r, depth, loc, mat, seg=48, r2=None, rot=(0, 0, 0), caps=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=caps, cap_tris=False, segments=seg,
                          radius1=r, radius2=r if r2 is None else r2, depth=depth)
    o = mesh_from_bm(name, bm)
    o.location = loc
    o.rotation_euler = rot
    shade_smooth(o)
    o.data.polygons.foreach_set("use_smooth", [len(p.vertices) == 4 for p in o.data.polygons])
    return set_mat(o, mat)


def box(name, size, loc, mat, rot=(0, 0, 0), bevel=0.012):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    o = mesh_from_bm(name, bm)
    o.location = loc
    o.rotation_euler = rot
    if bevel:
        md = o.modifiers.new("bevel", "BEVEL")
        md.width = bevel
        md.segments = 3
        md.limit_method = "ANGLE"
        shade_smooth(o)
        o.data.polygons.foreach_set("use_smooth", [True] * len(o.data.polygons))
        try:
            o.data.set_sharp_from_angle(angle=math.radians(40))
        except AttributeError:
            pass
    return set_mat(o, mat)


def torus(name, R, r, loc, mat, rot=(0, 0, 0), seg=64, mseg=16, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=seg,
                                     minor_segments=mseg, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    shade_smooth(o)
    return set_mat(o, mat)


def text_obj(name, body, size, loc, rot, mat, extrude=0.004, align="CENTER"):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    if os.path.exists(FONT_PATH):
        cu.font = bpy.data.fonts.load(FONT_PATH, check_existing=True)
    cu.size = size
    cu.extrude = extrude
    cu.align_x = align
    cu.align_y = "CENTER"
    o = link(bpy.data.objects.new(name, cu))
    o.location = loc
    o.rotation_euler = rot
    o.data.materials.append(mat)
    return o


def parent_to(children, parent):
    for c in children:
        c.parent = parent
    return parent


def empty(name, loc=(0, 0, 0), rot=(0, 0, 0)):
    e = link(bpy.data.objects.new(name, None))
    e.location = loc
    e.rotation_euler = rot
    return e


def curve_tube(name, pts, bevel, mat, resolution=12):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = bevel
    cu.bevel_resolution = 6
    cu.use_fill_caps = True
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    sp.resolution_u = resolution
    o = link(bpy.data.objects.new(name, cu))
    o.data.materials.append(mat)
    return o


# ---------------------------------------------------------------- materiales
def materials():
    M = {}
    # Mimbre rojo con franjas blancas (como la referencia de topcestas)
    m = new_mat("Mimbre", rough=0.62)
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "CONSTANT"
    els = ramp.color_ramp.elements
    els[0].position, els[0].color = 0.0, (0.92, 0.9, 0.86, 1)
    els[1].position, els[1].color = 0.1, (0.62, 0.035, 0.05, 1)
    e = els.new(0.9)
    e.color = (0.92, 0.9, 0.86, 1)
    nt.links.new(sep.outputs["Z"], ramp.inputs["Factor"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    # Tejido: anillos horizontales + varillas verticales
    w1 = nt.nodes.new("ShaderNodeTexWave")
    w1.wave_type = "BANDS"; w1.bands_direction = "Z"
    w1.inputs["Scale"].default_value = 22
    w1.inputs["Distortion"].default_value = 1.2
    w2 = nt.nodes.new("ShaderNodeTexWave")
    w2.wave_type = "RINGS"; w2.rings_direction = "Z"
    w2.inputs["Scale"].default_value = 0.0
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.inputs["Scale"].default_value = 18
    br.inputs["Mortar Size"].default_value = 0.035
    br.inputs["Brick Width"].default_value = 0.4
    br.inputs["Row Height"].default_value = 0.12
    nt.links.new(tc.outputs["Generated"], br.inputs["Vector"])
    nt.links.new(tc.outputs["Generated"], w1.inputs["Vector"])
    mathn = nt.nodes.new("ShaderNodeMath"); mathn.operation = "MULTIPLY"
    nt.links.new(br.outputs["Factor"], mathn.inputs[0])
    nt.links.new(w1.outputs["Factor"], mathn.inputs[1])
    add_bump(m, mathn.outputs[0], strength=0.55, distance=0.03)
    M["mimbre"] = m

    # Mimbre blanco del borde / asa
    m = new_mat("MimbreBlanco", (0.9, 0.88, 0.84), rough=0.55)
    nt = m.node_tree
    w = nt.nodes.new("ShaderNodeTexWave")
    w.wave_type = "BANDS"; w.bands_direction = "DIAGONAL"
    w.inputs["Scale"].default_value = 14
    add_bump(m, w.outputs["Factor"], 0.6, 0.02)
    M["mimbre_blanco"] = m

    M["cinturon"] = new_mat("Cinturon", (0.02, 0.02, 0.025), rough=0.35, coat=0.6)
    M["oro"] = new_mat("Oro", (1.0, 0.72, 0.28), metallic=1.0, rough=0.22)
    M["oro_suave"] = new_mat("OroSatinado", (0.95, 0.68, 0.3), metallic=1.0, rough=0.38)
    m = new_mat("OroArrugado", (1.0, 0.76, 0.32), metallic=1.0, rough=0.25)
    nz = m.node_tree.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 30
    nz.inputs["Detail"].default_value = 6
    add_bump(m, nz.outputs["Factor"], 0.45, 0.01)
    M["oro_arrugado"] = m
    M["azul_marca"] = new_mat("AzulMarca", (0.012, 0.035, 0.2), rough=0.3, coat=0.8)
    M["azul_noche"] = new_mat("AzulNoche", (0.012, 0.03, 0.085), rough=0.4, coat=0.4)
    M["rojo"] = new_mat("Rojo", (0.55, 0.01, 0.02), rough=0.25, coat=0.8)
    M["rojo_brillante"] = new_mat("RojoBrillante", (0.7, 0.01, 0.015), rough=0.08, coat=1.0)
    M["blanco"] = new_mat("Blanco", (0.9, 0.9, 0.88), rough=0.4)
    M["crema"] = new_mat("Crema", (0.95, 0.86, 0.66), rough=0.5)
    M["chocolate"] = new_mat("Chocolate", (0.09, 0.035, 0.015), rough=0.3)
    M["papel_marron"] = new_mat("PapelMarron", (0.18, 0.08, 0.03), rough=0.7)
    M["verde_acebo"] = new_mat("VerdeAcebo", (0.01, 0.12, 0.03), rough=0.3, coat=0.5)
    M["verde_pino"] = new_mat("VerdePino", (0.01, 0.09, 0.03), rough=0.55)
    M["marron"] = new_mat("Tallo", (0.12, 0.06, 0.025), rough=0.8)
    M["baya"] = new_mat("Baya", (0.6, 0.0, 0.02), rough=0.12, coat=1.0)

    # Relleno de paja dorada
    m = new_mat("Paja", (0.85, 0.62, 0.25), metallic=0.4, rough=0.45)
    nz = m.node_tree.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 60
    nz.inputs["Detail"].default_value = 10
    add_bump(m, nz.outputs["Factor"], 0.9, 0.03)
    M["paja"] = m

    # Bastón de caramelo: franjas diagonales rojo/blanco
    m = new_mat("Baston", rough=0.18, coat=1.0)
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    w = nt.nodes.new("ShaderNodeTexWave")
    w.wave_type = "BANDS"; w.bands_direction = "DIAGONAL"
    w.inputs["Scale"].default_value = 9
    r = nt.nodes.new("ShaderNodeValToRGB")
    r.color_ramp.interpolation = "CONSTANT"
    r.color_ramp.elements[0].color = (0.95, 0.95, 0.93, 1)
    r.color_ramp.elements[1].position = 0.5
    r.color_ramp.elements[1].color = (0.7, 0.01, 0.02, 1)
    nt.links.new(w.outputs["Factor"], r.inputs["Factor"])
    nt.links.new(r.outputs["Color"], p.inputs["Base Color"])
    M["baston"] = m

    # Glitter dorado
    m = new_mat("Glitter", (1.0, 0.7, 0.25), metallic=1.0, rough=0.3)
    v = m.node_tree.nodes.new("ShaderNodeTexVoronoi")
    v.inputs["Scale"].default_value = 260
    add_bump(m, sock(v, "Distance", out=True), 0.8, 0.004)
    M["glitter"] = m

    # Esfera azul con franjas blancas
    m = new_mat("EsferaAzul", rough=0.12, coat=1.0)
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    w = nt.nodes.new("ShaderNodeTexWave")
    w.wave_type = "BANDS"; w.bands_direction = "Z"
    w.inputs["Scale"].default_value = 3.2
    nt.links.new(tc.outputs["Object"], w.inputs["Vector"])
    r = nt.nodes.new("ShaderNodeValToRGB")
    r.color_ramp.interpolation = "CONSTANT"
    r.color_ramp.elements[0].color = (0.04, 0.12, 0.5, 1)
    r.color_ramp.elements[1].position = 0.82
    r.color_ramp.elements[1].color = (0.95, 0.95, 0.95, 1)
    nt.links.new(w.outputs["Factor"], r.inputs["Factor"])
    nt.links.new(r.outputs["Color"], p.inputs["Base Color"])
    M["esfera_azul"] = m

    # Nieve
    m = new_mat("Nieve", (0.95, 0.97, 1.0), rough=0.55)
    p = m.node_tree.nodes["Principled BSDF"]
    try:
        p.inputs["Subsurface Weight"].default_value = 0.25
    except KeyError:
        pass
    nz = m.node_tree.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 45
    add_bump(m, nz.outputs["Factor"], 0.35, 0.01)
    M["nieve"] = m

    # Madera de la mesa
    m = new_mat("Madera", rough=0.45)
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (0.35, 6.0, 1.0)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    w = nt.nodes.new("ShaderNodeTexWave")
    w.wave_type = "BANDS"; w.bands_direction = "X"
    w.inputs["Scale"].default_value = 0.8
    w.inputs["Distortion"].default_value = 5
    w.inputs["Detail"].default_value = 4
    nt.links.new(mp.outputs[0], w.inputs["Vector"])
    r = nt.nodes.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = (0.06, 0.025, 0.01, 1)
    r.color_ramp.elements[1].color = (0.16, 0.07, 0.03, 1)
    nt.links.new(w.outputs["Factor"], r.inputs["Factor"])
    nt.links.new(r.outputs["Color"], p.inputs["Base Color"])
    add_bump(m, w.outputs["Factor"], 0.15, 0.01)
    M["madera"] = m
    return M


# ---------------------------------------------------------------- modelos
def pine_branch(name, length, mat_needle, mat_stem, needles=110, seed=0):
    """Rama de pino: tallo + agujas (conos finos) en un solo mesh."""
    rnd = random.Random(seed)
    bm = bmesh.new()
    for i in range(needles):
        t = i / needles
        x = t * length
        ang = rnd.uniform(0, 2 * math.pi)
        tilt = math.radians(rnd.uniform(35, 60))
        nlen = 0.11 * (1 - 0.45 * t) + rnd.uniform(-0.015, 0.015)
        mat = (Matrix.Translation((x, 0, 0))
               @ Matrix.Rotation(ang, 4, "X")
               @ Matrix.Rotation(-tilt, 4, "Y")
               @ Matrix.Translation((0, 0, nlen / 2)))
        bmesh.ops.create_cone(bm, cap_ends=True, segments=5, radius1=0.006,
                              radius2=0.0015, depth=nlen, matrix=mat)
    o = mesh_from_bm(name, bm)
    set_mat(o, mat_needle)
    stem = cylinder(name + "_tallo", 0.008, length, (length / 2, 0, 0), mat_stem, seg=8,
                    rot=(0, math.pi / 2, 0))
    stem.parent = o
    return o


def candy_cane(name, M, h=0.75):
    pts = [(0, 0, 0), (0, 0, h * 0.5), (0, 0, h * 0.85), (0.08, 0, h + 0.03),
           (0.17, 0, h * 0.97), (0.2, 0, h * 0.85)]
    o = curve_tube(name, pts, 0.028, M["baston"])
    return o


def bow(name, mat, size=0.12):
    """Lazo: dos lóbulos (toros aplanados) + nudo + cintas."""
    root = empty(name)
    parts = []
    for s in (-1, 1):
        t = torus(name + f"_lobulo{s}", size, size * 0.28, (s * size * 0.95, 0, 0), mat,
                  rot=(math.radians(90), math.radians(s * 25), 0), seg=32, mseg=10,
                  scale=(1.0, 0.55, 1.0))
        parts.append(t)
        tail = box(name + f"_cinta{s}", (size * 0.35, 0.01, size * 1.2),
                   (s * size * 0.35, 0, -size * 0.6), mat, rot=(0, s * 0.45, 0), bevel=0.003)
        parts.append(tail)
    knot = uv_sphere(name + "_nudo", size * 0.32, (0, 0, 0), mat, scale=(1, 0.8, 0.9))
    parts.append(knot)
    parent_to(parts, root)
    return root


def gift_box(name, size, loc, mat_box, mat_ribbon, rot_z=0.0):
    root = empty(name, loc, (0, 0, rot_z))
    sx, sy, sz = size
    b = box(name + "_caja", (sx, sy, sz * 0.86), (0, 0, sz * 0.43), mat_box, bevel=0.01)
    lid = box(name + "_tapa", (sx * 1.04, sy * 1.04, sz * 0.18), (0, 0, sz * 0.91), mat_box, bevel=0.012)
    r1 = box(name + "_cinta1", (sx * 0.16, sy * 1.06, sz * 1.002), (0, 0, sz * 0.5), mat_ribbon, bevel=0.002)
    r2 = box(name + "_cinta2", (sx * 1.06, sy * 0.16, sz * 1.002), (0, 0, sz * 0.5), mat_ribbon, bevel=0.002)
    bw = bow(name + "_lazo", mat_ribbon, size=min(sx, sy) * 0.22)
    bw.location = (0, 0, sz * 1.05)
    bw.rotation_euler = (0, 0, math.radians(30))
    parent_to([b, lid, r1, r2, bw], root)
    return root


def ornament(name, r, loc, mat, M):
    root = empty(name, loc)
    s = uv_sphere(name + "_esfera", r, (0, 0, 0), mat, seg=48, rings=24)
    cap = cylinder(name + "_tapa", r * 0.22, r * 0.22, (0, 0, r * 1.02), M["oro_suave"], seg=24)
    ring = torus(name + "_aro", r * 0.1, r * 0.025, (0, 0, r * 1.2), M["oro"],
                 rot=(math.radians(90), 0, 0), seg=24, mseg=8)
    parent_to([s, cap, ring], root)
    return root


def holly(name, M, loc, rot=(0, 0, 0), scale=1.0):
    root = empty(name, loc, rot)
    parts = []
    for i, a in enumerate((-35, 35, 160)):
        bm = bmesh.new()
        # Hoja: elipse aplanada y dentada
        pts = []
        n = 18
        for k in range(n):
            t = k / (n - 1) * math.pi
            rad = 0.05 * (1.0 + (0.18 if k % 3 == 0 else 0))
            pts.append((0.13 * (1 - math.cos(t)) / 2 * 2, rad * math.sin(t), 0))
        verts = [bm.verts.new(p) for p in pts]
        verts += [bm.verts.new((p[0], -p[1], 0)) for p in reversed(pts[1:-1])]
        bm.faces.new(verts)
        bmesh.ops.triangulate(bm, faces=bm.faces[:])
        leaf = mesh_from_bm(f"{name}_hoja{i}", bm)
        md = leaf.modifiers.new("solid", "SOLIDIFY"); md.thickness = 0.006
        leaf.rotation_euler = (math.radians(15), math.radians(-10), math.radians(a))
        set_mat(leaf, M["verde_acebo"])
        parts.append(leaf)
    for j in range(3):
        parts.append(uv_sphere(f"{name}_baya{j}", 0.022, (0.018 * math.cos(j * 2.1), 0.018 * math.sin(j * 2.1), 0.02),
                               M["baya"], seg=16, rings=8))
    parent_to(parts, root)
    root.scale = (scale, scale, scale)
    return root


def basket(M, with_contents=True):
    """Canasta navideña completa. Base en z=0, centro en el origen."""
    root = empty("Canasta")
    parts = []
    H, RB, RT = 0.85, 0.82, 1.0
    # Cuerpo de mimbre (cono abierto arriba)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=96, radius1=RB, radius2=RT, depth=H)
    top = [f for f in bm.faces if f.normal.z > 0.9]
    bmesh.ops.delete(bm, geom=top, context="FACES")
    bmesh.ops.translate(bm, vec=(0, 0, H / 2), verts=bm.verts)
    body = mesh_from_bm("Canasta_cuerpo", bm)
    md = body.modifiers.new("grosor", "SOLIDIFY"); md.thickness = 0.05
    shade_smooth(body)
    body.data.polygons.foreach_set("use_smooth", [len(p.vertices) == 4 for p in body.data.polygons])
    set_mat(body, M["mimbre"])
    parts.append(body)
    # Borde superior trenzado + base
    parts.append(torus("Canasta_borde", RT, 0.055, (0, 0, H), M["mimbre_blanco"], seg=96, mseg=12))
    parts.append(torus("Canasta_base", RB, 0.045, (0, 0, 0.03), M["mimbre_blanco"], seg=96, mseg=12))
    # Cinturón negro con hebilla dorada
    zc = H * 0.5
    rc = RB + (RT - RB) * 0.5 + 0.008
    parts.append(cylinder("Canasta_cinturon", rc, 0.16, (0, 0, zc), M["cinturon"], seg=96,
                          r2=rc + 0.02, caps=False))
    parts.append(torus("Canasta_hebilla", 0.085, 0.018, (0, -rc - 0.02, zc), M["oro"],
                       rot=(math.radians(90), 0, 0), seg=48, mseg=12))
    # Asa en arco con envoltura dorada arriba
    bpy.ops.mesh.primitive_torus_add(major_radius=RT * 0.97, minor_radius=0.035, major_segments=96,
                                     minor_segments=12, rotation=(math.radians(90), 0, 0))
    handle = bpy.context.active_object
    handle.name = "Canasta_asa"
    bpy.ops.object.transform_apply(rotation=True)
    bm = bmesh.new(); bm.from_mesh(handle.data)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, 0),
                           plane_no=(0, 0, 1), clear_inner=True)
    bm.to_mesh(handle.data); bm.free()
    handle.location = (0, 0, H)
    handle.scale = (1, 1, 1.35)
    shade_smooth(handle)
    set_mat(handle, M["mimbre_blanco"])
    parts.append(handle)
    parts.append(cylinder("Canasta_asa_oro", 0.05, 0.28, (0, 0, H + RT * 0.97 * 1.35), M["oro_arrugado"],
                          seg=24, rot=(0, math.pi / 2, 0)))

    if with_contents:
        parts += basket_contents(M, H)
    parent_to(parts, root)
    return root


def basket_contents(M, H):
    parts = []
    z0 = H - 0.02
    # Relleno de paja
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=16, radius=0.97)
    o = mesh_from_bm("Relleno", bm)
    o.location = (0, 0, z0)
    o.scale = (1, 1, 0.12)
    shade_smooth(o); set_mat(o, M["paja"])
    parts.append(o)

    # Panetón en caja azul de marca con detalles dorados
    pan = empty("Paneton", (-0.18, 0.12, z0), (math.radians(-6), math.radians(-8), math.radians(-12)))
    w, d, h = 0.62, 0.44, 0.86
    p_parts = [
        box("Paneton_caja", (w, d, h), (0, 0, h / 2), M["azul_marca"], bevel=0.015),
        box("Paneton_franja", (w * 1.004, d * 1.004, 0.07), (0, 0, h * 0.2), M["oro"], bevel=0.003),
        box("Paneton_franja2", (w * 1.004, d * 1.004, 0.025), (0, 0, h * 0.88), M["oro"], bevel=0.002),
        text_obj("Paneton_txt", "Panetón", 0.13, (0, -d / 2 - 0.004, h * 0.6),
                 (math.radians(90), 0, 0), M["oro"]),
        text_obj("Paneton_sub", "NAVIDEÑO", 0.05, (0, -d / 2 - 0.004, h * 0.45),
                 (math.radians(90), 0, 0), M["crema"]),
    ]
    star = text_obj("Paneton_estrella", "★", 0.12, (0, -d / 2 - 0.004, h * 0.76),
                    (math.radians(90), 0, 0), M["oro"])
    if star.data.font and star.data.font.filepath.endswith("arialbd.ttf"):
        star.data.font = bpy.data.fonts.load("C:/Windows/Fonts/seguisym.ttf", check_existing=True) \
            if os.path.exists("C:/Windows/Fonts/seguisym.ttf") else star.data.font
    p_parts.append(star)
    parent_to(p_parts, pan)
    parts.append(pan)

    # Caja de chocolates dorada inclinada
    cho = empty("Chocolates", (0.42, 0.2, z0), (math.radians(-18), math.radians(10), math.radians(18)))
    c_parts = [
        box("Choco_caja", (0.5, 0.12, 0.42), (0, 0, 0.21), M["oro_suave"], bevel=0.01),
        box("Choco_cinta", (0.06, 0.125, 0.425), (0.12, 0, 0.21), M["rojo"], bevel=0.002),
        text_obj("Choco_txt", "Chocolates", 0.055, (-0.04, -0.064, 0.24), (math.radians(90), 0, 0),
                 M["chocolate"]),
    ]
    parent_to(c_parts, cho)
    parts.append(cho)

    # Lata de chocolate para taza
    lata = empty("Lata", (-0.55, -0.22, z0 - 0.03), (math.radians(8), math.radians(-14), 0))
    l_parts = [
        cylinder("Lata_cuerpo", 0.16, 0.42, (0, 0, 0.21), M["rojo"], seg=48),
        cylinder("Lata_tapa", 0.165, 0.05, (0, 0, 0.44), M["oro"], seg=48),
        cylinder("Lata_franja", 0.162, 0.05, (0, 0, 0.12), M["oro_suave"], seg=48),
    ]
    parent_to(l_parts, lata)
    parts.append(lata)

    # Bombones envueltos en dorado
    for i, (x, y) in enumerate([(0.15, -0.42), (0.3, -0.33), (0.0, -0.5), (0.42, -0.18),
                                (-0.15, -0.5), (0.22, -0.55), (0.55, -0.35)]):
        zz = z0 + 0.13 + 0.03 * (i % 2)
        parts.append(uv_sphere(f"Bombon{i}", 0.075, (x, y, zz), M["oro_arrugado"], seg=24, rings=12))
        parts.append(cylinder(f"Bombon{i}_capsula", 0.07, 0.04, (x, y, zz - 0.06), M["papel_marron"],
                              seg=20, r2=0.085))

    # Caramelos envueltos rojos
    for i, (x, y, rz) in enumerate([(-0.4, -0.55, 0.4), (0.6, -0.05, -0.6), (-0.65, 0.25, 1.1)]):
        g = empty(f"Caramelo{i}", (x, y, z0 + 0.05), (0, math.radians(90), rz))
        cp = [cylinder(f"Caramelo{i}_c", 0.04, 0.12, (0, 0, 0), M["baston"], seg=20)]
        for s in (-1, 1):
            # envoltura que se abre hacia afuera (estrecha junto al caramelo)
            inner, outer = 0.012, 0.045
            cp.append(cylinder(f"Caramelo{i}_p{s}", outer if s < 0 else inner, 0.06, (0, 0, s * 0.09),
                               M["rojo_brillante"], seg=16, r2=inner if s < 0 else outer))
        parent_to(cp, g)
        parts.append(g)

    # Regalito dentro de la canasta
    mini = gift_box("RegaloMini", (0.3, 0.3, 0.26), (0.5, -0.32, z0 + 0.06), M["rojo"], M["oro"], rot_z=0.5)
    mini.rotation_euler = (math.radians(-10), math.radians(8), 0.5)
    parts.append(mini)
    # Galletas navideñas (estrella de jengibre)
    for i, (x, y) in enumerate([(-0.35, -0.55), (-0.05, -0.62)]):
        st = text_obj(f"Galleta{i}", "★", 0.22, (x, y, z0 + 0.16), (math.radians(70), 0, 0.3 * i),
                      M["papel_marron"], extrude=0.012)
        if os.path.exists("C:/Windows/Fonts/seguisym.ttf"):
            st.data.font = bpy.data.fonts.load("C:/Windows/Fonts/seguisym.ttf", check_existing=True)
        parts.append(st)
    # Bastón de caramelo
    cane = candy_cane("Baston", M, h=0.8)
    cane.location = (0.08, -0.1, z0 - 0.05)
    cane.rotation_euler = (math.radians(-14), math.radians(16), math.radians(-30))
    parts.append(cane)

    # Ramas de pino alrededor del borde
    for i, (ang, ln, tilt) in enumerate([(200, 0.75, 18), (235, 0.6, 30), (150, 0.55, 26),
                                         (300, 0.62, 20), (20, 0.5, 30), (110, 0.55, 24),
                                         (260, 0.7, 12), (340, 0.55, 16), (70, 0.6, 20)]):
        br = pine_branch(f"Pino{i}", ln, M["verde_pino"], M["marron"], needles=130, seed=i)
        a = math.radians(ang)
        br.location = (0.55 * math.cos(a), 0.55 * math.sin(a), H - 0.02)
        br.rotation_euler = (0, math.radians(-tilt), a)
        parts.append(br)
    # Acebo y piña
    parts.append(holly("Acebo1", M, (-0.62, -0.62, H + 0.05), (0.2, 0, 0.6), 1.3))
    parts.append(holly("Acebo2", M, (0.72, -0.48, H + 0.06), (0.3, -0.2, -0.4), 1.1))
    pc = uv_sphere("Pina", 0.09, (-0.78, -0.38, H + 0.05), M["marron"], seg=24, rings=16,
                   scale=(0.8, 0.8, 1.25))
    pc.rotation_euler = (math.radians(70), 0, math.radians(30))
    m = pc.active_material
    if not any(n.type == "TEX_VORONOI" for n in m.node_tree.nodes):
        v = m.node_tree.nodes.new("ShaderNodeTexVoronoi")
        v.inputs["Scale"].default_value = 14
        add_bump(m, sock(v, "Distance", out=True), 0.9, 0.04)
    parts.append(pc)
    # Esferitas rojas
    parts.append(ornament("EsferaMini1", 0.09, (0.82, 0.2, H + 0.04), M["rojo_brillante"], M))
    parts.append(ornament("EsferaMini2", 0.075, (-0.5, 0.7, H + 0.02), M["glitter"], M))
    return parts


def graduation_cap(M):
    root = empty("Birrete")
    parts = []
    parts.append(cylinder("Birrete_copa", 0.42, 0.34, (0, 0, 0.17), M["azul_noche"], seg=64, r2=0.46))
    parts.append(box("Birrete_tabla", (1.3, 1.3, 0.05), (0, 0, 0.37), M["azul_noche"],
                     rot=(0, 0, math.radians(45)), bevel=0.01))
    parts.append(cylinder("Birrete_boton", 0.05, 0.03, (0, 0, 0.41), M["oro"], seg=24))
    # Borla dorada que cae por un lado
    cord = curve_tube("Birrete_cordon", [(0, 0, 0.41), (0.3, -0.05, 0.415), (0.6, -0.08, 0.40),
                                         (0.86, -0.06, 0.3), (0.88, -0.05, 0.1)], 0.012, M["oro"])
    parts.append(cord)
    parts.append(cylinder("Borla", 0.035, 0.22, (0.88, -0.05, 0.0), M["oro_arrugado"], seg=20, r2=0.06))
    # Capa de nieve sobre la tabla
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=24, radius=1.0)
    rnd = random.Random(7)
    for v in bm.verts:
        n = 1 + 0.08 * math.sin(v.co.x * 9 + rnd.random()) * math.cos(v.co.y * 7)
        v.co *= n
    snow = mesh_from_bm("Birrete_nieve", bm)
    snow.location = (-0.05, 0.05, 0.4)
    snow.scale = (0.62, 0.55, 0.09)
    snow.rotation_euler = (0, 0, math.radians(45))
    shade_smooth(snow); set_mat(snow, M["nieve"])
    parts.append(snow)
    parts.append(holly("Birrete_acebo", M, (-0.25, -0.3, 0.47), (0.1, 0, 0.3), 1.6))
    parent_to(parts, root)
    return root


# ---------------------------------------------------------------- entorno
def bokeh_set(M, animated=False):
    """Árbol navideño desenfocado + guirnaldas de luces al fondo."""
    cols = {"calida": ((1.0, 0.72, 0.35), 9), "oro": ((1.0, 0.55, 0.12), 9),
            "roja": ((1.0, 0.08, 0.06), 9), "fria": ((0.65, 0.8, 1.0), 6)}
    mats = {}
    for i, (k, (c, s)) in enumerate(cols.items()):
        m = emission_mat("Luz_" + k, c, s)
        if animated:
            fc = m.node_tree.nodes["Emission"].inputs["Strength"].driver_add("default_value")
            fc.driver.type = "SCRIPTED"
            k2 = 2 * math.pi / LOOP_FRAMES * (2 + i % 2)
            fc.driver.expression = f"{s}+{s*0.55:.2f}*sin(frame*{k2:.6f}+{i*1.7:.2f})"
        mats[k] = m
    keys = list(mats)
    # Árbol a la izquierda, al fondo
    tree = empty("Arbol", (-3.0, 3.2, 0))
    tparts = []
    for i in range(5):
        r = 1.25 - i * 0.22
        tparts.append(cylinder(f"Arbol_nivel{i}", r, 0.9, (0, 0, 0.75 + i * 0.6), M["verde_pino"], seg=32,
                               r2=0.05))
    rnd = random.Random(3)
    for j in range(90):
        h = rnd.uniform(0.35, 3.4)
        rr = max(0.1, 1.2 * (1 - h / 3.7)) + 0.05
        a = rnd.uniform(0, 2 * math.pi)
        tparts.append(uv_sphere(f"Arbol_luz{j}", 0.045, (rr * math.cos(a), rr * math.sin(a), h),
                                mats[rnd.choice(keys)], seg=12, rings=6))
    parent_to(tparts, tree)
    # Guirnaldas en el fondo
    for row in range(4):
        y = 5.5 + row * 0.6
        for j in range(46):
            x = -9 + j * 0.42 + (row % 2) * 0.2
            z = 3.4 - row * 0.65 - 0.35 * math.cos((x + row) * 0.7) ** 2
            uv_sphere(f"Guirnalda{row}_{j}", 0.05, (x, y, z), mats[keys[(j + row) % len(keys)]], seg=10, rings=5)
    # Mesa y pared
    floor = box("Mesa", (24, 14, 0.1), (0, 2, -0.05), M["madera"], bevel=0)
    wall = box("Pared", (30, 0.2, 14), (0, 9, 5), new_mat("ParedMate", (0.01, 0.022, 0.06), rough=1.0), bevel=0)
    return mats


def snow_particles(n=90):
    m = emission_mat("CopoNieve", (0.9, 0.95, 1.0), 1.4)
    rnd = random.Random(11)
    top, bottom = 4.2, -0.2
    for i in range(n):
        x = rnd.uniform(-5.5, 5.5)
        y = rnd.uniform(-3.4, 4.5)
        r = rnd.uniform(0.006, 0.016)
        o = uv_sphere(f"Copo{i}", r, (x, y, top), m, seg=8, rings=4)
        phase = rnd.uniform(0, LOOP_FRAMES)
        # loop perfecto: cae de top a bottom en LOOP_FRAMES y se repite
        o.location.z = top
        o.keyframe_insert("location", index=2, frame=1 - phase)
        o.location.z = bottom
        o.keyframe_insert("location", index=2, frame=1 - phase + LOOP_FRAMES)
        o.location.x = x + rnd.uniform(-0.3, 0.3)
        o.keyframe_insert("location", index=0, frame=1 - phase + LOOP_FRAMES / 2)
        o.location.x = x
        o.keyframe_insert("location", index=0, frame=1 - phase)
        o.keyframe_insert("location", index=0, frame=1 - phase + LOOP_FRAMES)
        ad = o.animation_data
        fcurves = ad.action.fcurves if hasattr(ad.action, "fcurves") else []
        if not fcurves:
            try:
                fcurves = ad.action.layers[0].strips[0].channelbag(ad.action_slot).fcurves
            except Exception:
                fcurves = []
        for fc in fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR" if fc.array_index == 2 else "SINE"
            fc.modifiers.new("CYCLES")


def lights(sc, strength=1.0, world=(0.02, 0.035, 0.08), world_strength=0.6):
    def area(name, loc, rot, energy, color, size):
        d = bpy.data.lights.new(name, "AREA")
        d.energy = energy * strength
        d.color = color
        d.size = size
        o = link(bpy.data.objects.new(name, d))
        o.location = loc
        o.rotation_euler = rot
        return o
    area("Key", (-3.2, -3.5, 4.2), (math.radians(50), 0, math.radians(-42)), 900, (1.0, 0.86, 0.7), 3.0)
    area("Fill", (4.0, -3.0, 2.0), (math.radians(70), 0, math.radians(52)), 260, (0.75, 0.85, 1.0), 4.0)
    area("Rim", (1.5, 4.0, 3.6), (math.radians(-55), 0, math.radians(160)), 700, (1.0, 0.75, 0.5), 2.5)
    w = bpy.data.worlds.new("Mundo")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*world, 1)
    bg.inputs["Strength"].default_value = world_strength
    sc.world = w


def camera(sc, loc, target, lens=50, fstop=None, focus=None, shift_x=0.0, parent=None):
    cd = bpy.data.cameras.new("Cam")
    cd.lens = lens
    cd.shift_x = shift_x
    cam = link(bpy.data.objects.new("Cam", cd))
    cam.location = loc
    direction = Vector(target) - Vector(loc)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        cd.dof.focus_distance = focus or direction.length
    if parent:
        cam.parent = parent
    sc.camera = cam
    return cam


def setup_render(sc, w, h, samples=64, transparent=False):
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = RES_SCALE
    sc.render.film_transparent = transparent
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    try:
        sc.eevee.taa_render_samples = samples
    except AttributeError:
        pass
    for attr, val in (("use_shadows", True), ("use_raytracing", True), ("use_gtao", True),
                      ("use_bokeh_jittered", True), ("bokeh_max_size", 160.0)):
        try:
            setattr(sc.eevee, attr, val)
        except AttributeError:
            pass


def render_still(sc, name):
    sc.render.filepath = os.path.join(OUT, name)
    bpy.ops.render.render(write_still=True)
    print("[navidad] render:", sc.render.filepath)


# ---------------------------------------------------------------- modos
sc = reset_scene()
M = materials()

if MODE == "canasta":
    basket(M)
    lights(sc, world=(0.5, 0.55, 0.65), world_strength=0.5)
    camera(sc, (0, -5.2, 2.5), (0, 0, 0.98), lens=60)
    setup_render(sc, 1200, 1200, samples=96, transparent=True)
    render_still(sc, "canasta-3d.png")

elif MODE == "regalos":
    gift_box("RegaloAzul", (0.9, 0.9, 0.7), (0, 0, 0), M["azul_marca"], M["oro"], rot_z=0.3)
    gift_box("RegaloRojo", (0.6, 0.6, 0.5), (0.05, 0.0, 0.72), M["rojo"], M["blanco"], rot_z=-0.35)
    gift_box("RegaloOro", (0.45, 0.45, 0.42), (0.85, -0.35, 0), M["oro_suave"], M["rojo_brillante"], rot_z=0.6)
    lights(sc, world=(0.5, 0.55, 0.65), world_strength=0.5)
    camera(sc, (1.5, -4.6, 2.4), (0.35, 0, 0.7), lens=50)
    setup_render(sc, 1000, 1000, samples=96, transparent=True)
    render_still(sc, "regalos-3d.png")

elif MODE == "esferas":
    ornament("EsferaRoja", 0.42, (-0.55, 0, 0.6), M["rojo_brillante"], M)
    ornament("EsferaOro", 0.36, (0.45, 0.25, 0.85), M["glitter"], M)
    ornament("EsferaAzul", 0.3, (0.3, -0.45, 0.2), M["esfera_azul"], M)
    holly("EsferasAcebo", M, (-0.1, -0.5, 0.05), (0.8, 0, 0.2), 2.2)
    lights(sc, world=(0.5, 0.55, 0.65), world_strength=0.5)
    camera(sc, (0, -5.0, 1.4), (0, 0, 0.55), lens=55)
    setup_render(sc, 800, 800, samples=96, transparent=True)
    render_still(sc, "esferas-3d.png")

elif MODE == "birrete":
    cap = graduation_cap(M)
    cap.rotation_euler = (math.radians(8), math.radians(-6), math.radians(-20))
    lights(sc, world=(0.5, 0.55, 0.65), world_strength=0.5)
    camera(sc, (0, -4.2, 2.7), (0.1, 0, 0.25), lens=55)
    setup_render(sc, 800, 800, samples=96, transparent=True)
    render_still(sc, "birrete-3d.png")

elif MODE in ("og", "video", "poster"):
    basket(M)
    gift_box("RegaloAzul", (0.6, 0.6, 0.48), (-1.55, 0.35, 0), M["azul_marca"], M["oro"], rot_z=0.4)
    gift_box("RegaloRojo", (0.42, 0.42, 0.36), (-1.25, -0.45, 0), M["rojo"], M["blanco"], rot_z=-0.3)
    gift_box("RegaloOro", (0.5, 0.5, 0.4), (1.5, 0.6, 0), M["oro_suave"], M["rojo_brillante"], rot_z=0.2)
    ornament("MesaEsfera1", 0.14, (1.05, -0.75, 0.14), M["rojo_brillante"], M)
    ornament("MesaEsfera2", 0.11, (1.35, -0.45, 0.11), M["glitter"], M)
    ornament("MesaEsfera3", 0.12, (-0.95, -0.95, 0.12), M["esfera_azul"], M)
    animated = MODE == "video"
    bokeh_set(M, animated=animated)
    lights(sc, strength=0.85, world=(0.02, 0.035, 0.09), world_strength=0.5)
    if MODE == "og":
        camera(sc, (0, -7.6, 2.0), (0, 0, 0.75), lens=50, fstop=0.35, shift_x=-0.14)
        setup_render(sc, 1200, 630, samples=64)
        render_still(sc, "og-navidad.png")
    else:
        snow_particles()
        rig = empty("CamRig", (0, 0, 0.9))
        # Cámara: canasta en el tercio derecho (deja espacio al texto del banner)
        camera(sc, (0, -7.6, 1.1), (0, 0, 0.0), lens=45, fstop=0.3, focus=7.6, shift_x=-0.16,
               parent=rig)
        # Órbita suave ±10° en loop perfecto
        rig.rotation_euler.z = math.radians(-10)
        rig.keyframe_insert("rotation_euler", index=2, frame=1)
        rig.rotation_euler.z = math.radians(10)
        rig.keyframe_insert("rotation_euler", index=2, frame=1 + LOOP_FRAMES // 2)
        rig.rotation_euler.z = math.radians(-10)
        rig.keyframe_insert("rotation_euler", index=2, frame=1 + LOOP_FRAMES)
        sc.frame_start = 1
        sc.frame_end = LOOP_FRAMES
        sc.render.fps = 24
        setup_render(sc, 1920, 1080, samples=24)
        if MODE == "poster":
            sc.frame_set(1)
            render_still(sc, "video-poster.png")
        else:
            sc.render.filepath = os.path.join(OUT, "frames", "f_")
            bpy.ops.render.render(animation=True)
            print("[navidad] video frames listos")
elif MODE == "galeria":
    # Fotos referenciales para el carrusel "Mira nuestras canastas" (1080x1350, 4:5).
    # Misma canasta desde distintos ángulos; marketing puede reemplazarlas por fotos reales.
    basket(M)
    gift_box("RegaloAzul", (0.6, 0.6, 0.48), (-1.55, 0.35, 0), M["azul_marca"], M["oro"], rot_z=0.4)
    gift_box("RegaloRojo", (0.42, 0.42, 0.36), (-1.25, -0.45, 0), M["rojo"], M["blanco"], rot_z=-0.3)
    gift_box("RegaloOro", (0.5, 0.5, 0.4), (1.5, 0.6, 0), M["oro_suave"], M["rojo_brillante"], rot_z=0.2)
    ornament("MesaEsfera1", 0.14, (1.05, -0.75, 0.14), M["rojo_brillante"], M)
    ornament("MesaEsfera2", 0.11, (1.35, -0.45, 0.11), M["glitter"], M)
    ornament("MesaEsfera3", 0.12, (-0.95, -0.95, 0.12), M["esfera_azul"], M)
    bokeh_set(M)
    lights(sc, strength=0.9, world=(0.02, 0.035, 0.09), world_strength=0.5)
    setup_render(sc, 1080, 1350, samples=48)
    tomas = [
        ("canasta-1", (0, -5.6, 1.7), (0, 0, 0.85), 50, 0.5),
        ("canasta-2", (3.7, -3.9, 2.3), (0, 0, 0.8), 50, 0.5),
        ("canasta-3", (0, -2.2, 3.9), (0, 0.05, 0.85), 38, 0.6),
        ("canasta-4", (-0.75, -2.1, 1.45), (-0.2, 0.1, 1.15), 60, 1.2),
        ("canasta-5", (0.9, -1.75, 1.45), (0.22, -0.42, 0.98), 60, 2.0),
        ("canasta-6", (-3.2, -4.6, 1.3), (-0.5, 0, 0.6), 40, 0.6),
    ]
    for name, loc, target, lens, fstop in tomas:
        cam = camera(sc, loc, target, lens=lens, fstop=fstop)
        render_still(sc, name + ".png")
        bpy.data.objects.remove(cam, do_unlink=True)
else:
    raise SystemExit(f"Modo desconocido: {MODE}")
