"""Refresh SHA-256 inventory after intentionally editing this release."""
from pathlib import Path
import hashlib
root=Path(__file__).resolve().parents[1]
files=sorted(p for p in root.rglob('*') if p.is_file() and p.name!='SHA256SUMS.txt' and not any(x in p.parts for x in ['.git','__pycache__']) and p.suffix!='.pyc')
(root/'SHA256SUMS.txt').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.relative_to(root).as_posix()+'\n' for p in files),encoding='utf-8')
print('Recorded',len(files),'files')
