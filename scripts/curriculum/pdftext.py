# -*- coding: utf-8 -*-
"""Text out of the resource PDFs: inflate the streams, decode the hex strings
through the ToUnicode CMap the file carries."""
import re, zlib, sys

def inflated(data):
    for m in re.finditer(rb'stream', data):
        start = data.find(b'\n', m.end()) + 1
        end = data.find(b'endstream', start)
        if end < 0:
            continue
        try:
            yield zlib.decompress(data[start:end])
        except Exception:
            pass

def cmap(streams):
    out = {}
    for s in streams:
        for m in re.finditer(rb'beginbfchar(.*?)endbfchar', s, re.S):
            for a, b in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', m.group(1)):
                out[int(a, 16)] = ''.join(chr(int(b[i:i+4], 16)) for i in range(0, len(b), 4))
        for m in re.finditer(rb'beginbfrange(.*?)endbfrange', s, re.S):
            for a, b, c in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', m.group(1)):
                lo, hi, dst = int(a, 16), int(b, 16), int(c, 16)
                for k in range(lo, hi + 1):
                    out[k] = chr(dst + k - lo)
    return out

def text(path):
    data = open(path, 'rb').read()
    streams = list(inflated(data))
    cm = cmap(streams)
    lines = []
    for s in streams:
        if b'TJ' not in s and b'Tj' not in s:
            continue
        for chunk in re.split(rb'\bBT\b', s)[1:]:
            chunk = re.split(rb'\bET\b', chunk)[0]
            buf = []
            for hx in re.findall(rb'<([0-9A-Fa-f]+)>', chunk):
                for i in range(0, len(hx), 4):
                    buf.append(cm.get(int(hx[i:i+4], 16), ''))
            t = ''.join(buf).strip()
            if t:
                lines.append(t)
    return '\n'.join(lines)

if __name__ == '__main__':
    print(text(sys.argv[1]))
