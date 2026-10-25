import zipfile, pathlib

src = pathlib.Path('/home/ubuntu/workspace/project')
out = pathlib.Path('/home/ubuntu/workspace/project/attachements/DiamondBoost-fixed.zip')

EXCLUDE_DIRS = {'.wrangler', 'node_modules', '.next', '.output', 'attachements', '__pycache__'}
EXCLUDE_FILES = {'tsconfig.tsbuildinfo', 'pnpm-lock.yaml', 'makezip.py', '.env'}

with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for path in sorted(src.rglob('*')):
        if not path.is_file():
            continue
        rel = path.relative_to(src)
        parts = set(rel.parts)
        if parts & EXCLUDE_DIRS:
            continue
        if path.name in EXCLUDE_FILES:
            continue
        zf.write(path, rel)

size_mb = out.stat().st_size / 1024 / 1024
count = sum(1 for _ in zipfile.ZipFile(out).infolist())
print(f"Done: {out.name}  ({size_mb:.1f} MB, {count} files)")
