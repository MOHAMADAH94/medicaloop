"""Build a pickable skeleton GLB from BodyParts3D PART-OF OBJ files (CC BY 4.0).

Requires: numpy, trimesh, and fast-simplification (for web-size meshes).
Source zip stays in tmp_bp3d/ (gitignored). Output: frontend/public/anatomy/skeleton.glb
"""
from __future__ import annotations

import re
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
OUT_GLB = ROOT / "frontend" / "public" / "anatomy" / "skeleton.glb"

SKIP_NAME = re.compile(
    r"artery|vein|nerve|muscle|ligament|disk|disc|symphysis|cartilage of|skin|brain",
    re.I,
)


def zone_for(name: str) -> str | None:
    n = name.strip().lower()
    if SKIP_NAME.search(n) or "column" in n or n.startswith("set of") or "cage" in n:
        return None
    if n == "mandible":
        return "mandible"
    if n == "skull" or n in {"neurocranium", "viscerocranium", "basicranium"}:
        return "skull"
    if n == "sternum" or "of sternum" in n:
        return "sternum"
    if n == "sacrum":
        return "sacrum"
    if n == "pelvis" or n in {"ilium", "ischium", "pubis"} or "hip bone" in n:
        return "pelvis"
    if n in {"atlas", "axis"} or "cervical vertebra" in n:
        return "cspine"
    if "thoracic vertebra" in n:
        return "tspine"
    if "lumbar vertebra" in n:
        return "lspine"
    if "rib" in n and "cage" not in n:
        if n.startswith("right") or " right " in n:
            return "ribs_r"
        if n.startswith("left") or " left " in n:
            return "ribs_l"
        return None
    if "clavicle" in n:
        return "clavicle_r" if "right" in n else "clavicle_l" if "left" in n else None
    if "scapula" in n:
        return "scapula_r" if "right" in n else "scapula_l" if "left" in n else None
    if n.endswith("humerus") or n.startswith("right humerus") or n.startswith("left humerus"):
        return "humerus_r" if "right" in n else "humerus_l"
    if "radius" in n or "ulna" in n:
        if "artery" in n:
            return None
        return "radius_ulna_r" if "right" in n else "radius_ulna_l" if "left" in n else None
    if "hand" in n and "artery" not in n:
        return "hand_r" if "right" in n else "hand_l" if "left" in n else None
    if "femur" in n:
        return "femur_r" if "right" in n else "femur_l"
    if "tibia" in n or "fibula" in n:
        return "tibia_fibula_r" if "right" in n else "tibia_fibula_l" if "left" in n else None
    if "patella" in n:
        return "tibia_fibula_r" if "right" in n else "tibia_fibula_l"
    if "foot" in n:
        return "foot_r" if "right" in n else "foot_l" if "left" in n else None
    return None


def load_fma_names() -> dict[str, str]:
    names: dict[str, str] = {}
    for line in PARTS_LIST.read_text(encoding="utf-8").splitlines()[1:]:
        parts = line.split(" ", 2)
        if len(parts) < 3:
            continue
        fma, _bp, name = parts
        names[fma] = name
    return names


def load_elements() -> dict[str, set[str]]:
    """zone -> set of FJ file ids."""
    names = load_fma_names()
    grouped: dict[str, set[str]] = defaultdict(set)
    for line in ELEMENT_PARTS.read_text(encoding="utf-8").splitlines()[1:]:
        bits = line.split()
        if len(bits) < 3:
            continue
        fma, fj = bits[0], bits[-1]
        name = names.get(fma) or " ".join(bits[1:-1])
        zone = zone_for(name)
        if not zone:
            continue
        grouped[zone].add(fj)
    # Mandible should not also count as skull.
    if "mandible" in grouped and "skull" in grouped:
        grouped["skull"] -= grouped["mandible"]
    if "sacrum" in grouped and "pelvis" in grouped:
        grouped["pelvis"] -= grouped["sacrum"]
    if "sternum" in grouped:
        grouped.get("ribs_r", set()).difference_update(grouped["sternum"])
        grouped.get("ribs_l", set()).difference_update(grouped["sternum"])
    return grouped


MAX_FACES = {
    "skull": 48000,
    "scapula_r": 18000,
    "scapula_l": 18000,
    "ribs_r": 22000,
    "ribs_l": 22000,
    "pelvis": 14000,
    "cspine": 10000,
    "tspine": 14000,
    "lspine": 10000,
    "sacrum": 8000,
    "foot_r": 10000,
    "foot_l": 10000,
    "hand_r": 7000,
    "hand_l": 7000,
    "tibia_fibula_r": 10000,
    "tibia_fibula_l": 10000,
}
DEFAULT_MAX_FACES = 8000
# BodyParts3D is Z-up / Y-anterior-negative. Three.js wants Y-up, +Z toward the camera.
Y_UP = trimesh.transformations.rotation_matrix(np.radians(-90.0), [1.0, 0.0, 0.0])


def merge_meshes(parts: list[trimesh.Trimesh]) -> trimesh.Trimesh:
    verts = [part.vertices for part in parts]
    faces = []
    offset = 0
    for part in parts:
        faces.append(part.faces + offset)
        offset += len(part.vertices)
    return trimesh.Trimesh(
        vertices=np.vstack(verts),
        faces=np.vstack(faces),
        process=False,
    )


def prepare_zone_mesh(mesh: trimesh.Trimesh, zone: str) -> trimesh.Trimesh:
    cap = MAX_FACES.get(zone, DEFAULT_MAX_FACES)
    if len(mesh.faces) > cap:
        mesh = mesh.simplify_quadric_decimation(face_count=cap)
    mesh.apply_transform(Y_UP)
    return mesh


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


def main() -> None:
    if not ZIP_PATH.exists():
        raise SystemExit(f"missing {ZIP_PATH}")
    zones = load_elements()
    print("zones", {k: len(v) for k, v in sorted(zones.items())})
    with zipfile.ZipFile(ZIP_PATH) as zf:
        names = {Path(n).name: n for n in zf.namelist()}
        scene = trimesh.Scene()
        for zone, fjs in sorted(zones.items()):
            parts: list[trimesh.Trimesh] = []
            for fj in sorted(fjs):
                key = f"{fj}.obj"
                path = names.get(key)
                if not path:
                    continue
                loaded = mesh_from_obj(zf.read(path))
                if loaded is not None:
                    parts.append(loaded)
            if not parts:
                print("missing zone", zone)
                continue
            merged = prepare_zone_mesh(merge_meshes(parts), zone)
            scene.add_geometry(merged, geom_name=zone, node_name=zone)
            print(f"  {zone}: {len(parts)} parts, {len(merged.faces)} faces")
    OUT_GLB.parent.mkdir(parents=True, exist_ok=True)
    scene.export(OUT_GLB)
    print("wrote", OUT_GLB, "bytes", OUT_GLB.stat().st_size)


if __name__ == "__main__":
    main()
