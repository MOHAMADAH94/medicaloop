"""Build extra BodyParts3D GLBs (CC BY 4.0) for GI / ENT / endocrine charts."""
from __future__ import annotations

import zipfile
from collections import defaultdict
from pathlib import Path

import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "tmp_bp3d"
ZIP_PATH = DATA / "partof_BP3D_4.0_obj_99.zip"
PARTS_LIST = DATA / "partof_parts_list_e.txt"
ELEMENT_PARTS = DATA / "partof_element_parts.txt"
OUT_DIR = ROOT / "frontend" / "public" / "anatomy"

Y_UP = trimesh.transformations.rotation_matrix(np.radians(-90.0), [1.0, 0.0, 0.0])


def zone_gi(name: str) -> str | None:
    n = name.strip().lower()
    if any(k in n for k in ("artery", "vein", "nerve", "mesentery", "mesocolon", "wall of", "muscle layer")):
        return None
    if n == "esophagus" or n.endswith(" esophagus"):
        return "esophagus"
    if n == "stomach" or "of stomach" in n:
        return "stomach"
    if n == "liver" or "lobe of liver" in n or "hemiliver" in n or "sector of" in n and "liver" in n:
        return "liver"
    if n == "gallbladder" or "of gallbladder" in n:
        return "gallbladder"
    if n == "duodenum" or "of duodenum" in n:
        return "duodenum"
    if n == "pancreas" or "of pancreas" in n:
        return "pancreas"
    if n in {"jejunum", "ileum", "small intestine"} or "part of ileum" in n or "part of jejunum" in n:
        return "small_bowel"
    if "colon" in n or n in {"cecum", "caecum", "large intestine"}:
        return "colon"
    if n == "rectum" or "of rectum" in n:
        return "rectum"
    return None


def zone_ent(name: str) -> str | None:
    n = name.strip().lower()
    if "artery" in n or "vein" in n or "nerve" in n or "muscle" in n:
        return None
    if n == "mandible":
        return "mandible"
    if n == "skull" or n in {"neurocranium", "viscerocranium", "basicranium"}:
        return "skull"
    if "nasal" in n or n in {"external nose", "osseous skeleton of external nose", "cartilaginous skeleton of external nose"}:
        return "nose"
    if n == "hyoid bone" or n == "hyoid":
        return "hyoid"
    if n == "trachea" or "trachea" in n:
        return "trachea"
    if n == "esophagus" or n.endswith(" esophagus"):
        return "esophagus"
    return None


def zone_endo(name: str) -> str | None:
    n = name.strip().lower()
    if "artery" in n or "vein" in n:
        return None
    if n == "pituitary gland" or n == "pituitary":
        return "pituitary"
    if "adrenal" in n:
        return "adrenal_r" if "right" in n else "adrenal_l" if "left" in n else None
    if n == "pancreas" or "of pancreas" in n:
        return "pancreas"
    if n == "trachea":
        return "trachea"
    if n == "hyoid bone" or n == "hyoid":
        return "hyoid"
    if n == "esophagus":
        return "esophagus"
    return None


CATALOGS = [
    ("digestive.glb", zone_gi, 16000),
    ("ent.glb", zone_ent, 18000),
    ("endocrine.glb", zone_endo, 10000),
]


def load_fma_names() -> dict[str, str]:
    names: dict[str, str] = {}
    for line in PARTS_LIST.read_text(encoding="utf-8").splitlines()[1:]:
        parts = line.split(" ", 2)
        if len(parts) < 3:
            continue
        fma, _bp, name = parts
        names[fma] = name
    return names


def grouped_for(zone_for) -> dict[str, set[str]]:
    names = load_fma_names()
    grouped: dict[str, set[str]] = defaultdict(set)
    for line in ELEMENT_PARTS.read_text(encoding="utf-8").splitlines()[1:]:
        bits = line.split()
        if len(bits) < 3:
            continue
        fma, fj = bits[0], bits[-1]
        name = names.get(fma) or " ".join(bits[1:-1])
        zone = zone_for(name)
        if zone:
            grouped[zone].add(fj)
    if "mandible" in grouped and "skull" in grouped:
        grouped["skull"] -= grouped["mandible"]
    return grouped


def merge_meshes(parts: list[trimesh.Trimesh]) -> trimesh.Trimesh:
    verts = [part.vertices for part in parts]
    faces = []
    offset = 0
    for part in parts:
        faces.append(part.faces + offset)
        offset += len(part.vertices)
    return trimesh.Trimesh(vertices=np.vstack(verts), faces=np.vstack(faces), process=False)


def mesh_from_obj(data: bytes) -> trimesh.Trimesh | None:
    mesh = trimesh.load(
        file_obj=trimesh.util.wrap_as_stream(data),
        file_type="obj",
        force="mesh",
        process=False,
    )
    if isinstance(mesh, trimesh.Scene):
        geoms = [g for g in mesh.geometry.values() if isinstance(g, trimesh.Trimesh)]
        if not geoms:
            return None
        mesh = merge_meshes(geoms)
    if not isinstance(mesh, trimesh.Trimesh) or mesh.is_empty:
        return None
    return mesh


def prepare(mesh: trimesh.Trimesh, cap: int) -> trimesh.Trimesh:
    if len(mesh.faces) > cap:
        mesh = mesh.simplify_quadric_decimation(face_count=cap)
    mesh.apply_transform(Y_UP)
    return mesh


def export_catalog(filename: str, zone_for, cap: int, zf: zipfile.ZipFile, zip_names: dict[str, str]) -> None:
    zones = grouped_for(zone_for)
    print(filename, {k: len(v) for k, v in sorted(zones.items())})
    scene = trimesh.Scene()
    for zone, fjs in sorted(zones.items()):
        parts: list[trimesh.Trimesh] = []
        for fj in sorted(fjs):
            path = zip_names.get(f"{fj}.obj")
            if not path:
                continue
            loaded = mesh_from_obj(zf.read(path))
            if loaded is not None:
                parts.append(loaded)
        if not parts:
            print("  missing", zone)
            continue
        merged = prepare(merge_meshes(parts), cap)
        scene.add_geometry(merged, geom_name=zone, node_name=zone)
        print(f"  {zone}: {len(parts)} parts, {len(merged.faces)} faces")
    if not scene.geometry:
        print("  empty, skip")
        return
    out = OUT_DIR / filename
    out.parent.mkdir(parents=True, exist_ok=True)
    scene.export(out)
    print("  wrote", out, out.stat().st_size)


def main() -> None:
    if not ZIP_PATH.exists():
        raise SystemExit(f"missing {ZIP_PATH}")
    with zipfile.ZipFile(ZIP_PATH) as zf:
        zip_names = {Path(n).name: n for n in zf.namelist()}
        for filename, zone_for, cap in CATALOGS:
            export_catalog(filename, zone_for, cap, zf, zip_names)


if __name__ == "__main__":
    main()
