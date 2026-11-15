"""Recorta una lámina de objetos (cuadrícula) en archivos sueltos con fondo transparente.

Uso:
  python3 herramientas/recortar_lamina.py LAMINA.png COLUMNAS FILAS CARPETA_SALIDA nombre1 nombre2 ...

- Acepta fondo transparente o fondo liso (blanco o magenta #FF00FF), que se vuelve transparente.
- Limpia el velo casi invisible que dejan los generadores de imágenes.
- Cada objeto se recorta a su contenido, con un margen pequeño, y se guarda en WebP.
"""
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

MARGEN = 8


def quitar_fondo_liso(rgba: np.ndarray) -> np.ndarray:
    """Si el fondo es opaco y liso, lo vuelve transparente rellenando desde los bordes."""
    alto, ancho = rgba.shape[:2]
    if rgba[:, :, 3].min() < 250:
        return rgba  # ya trae transparencia
    fondo = rgba[0, 0, :3].astype(int)
    parecido = np.abs(rgba[:, :, :3].astype(int) - fondo).sum(axis=2) < 60
    visto = np.zeros((alto, ancho), bool)
    cola = deque([(y, x) for x in range(ancho) for y in (0, alto - 1)] + [(y, x) for y in range(alto) for x in (0, ancho - 1)])
    while cola:
        y, x = cola.popleft()
        if visto[y, x] or not parecido[y, x]:
            continue
        visto[y, x] = True
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < alto and 0 <= nx < ancho and not visto[ny, nx]:
                cola.append((ny, nx))
    rgba = rgba.copy()
    rgba[visto, 3] = 0
    return rgba


def limpiar_alfa(rgba: np.ndarray) -> np.ndarray:
    a = rgba[:, :, 3].astype(float)
    a = np.clip((a - 16) / (240 - 16), 0, 1) * 255  # fuera el velo, dentro opaco
    rgba = rgba.copy()
    rgba[:, :, 3] = a.astype(np.uint8)
    return rgba


def main() -> None:
    lamina, cols, filas, salida, *nombres = sys.argv[1:]
    cols, filas = int(cols), int(filas)
    rgba = limpiar_alfa(quitar_fondo_liso(np.array(Image.open(lamina).convert('RGBA'))))
    alto, ancho = rgba.shape[:2]
    Path(salida).mkdir(parents=True, exist_ok=True)
    for i, nombre in enumerate(nombres):
        f, c = divmod(i, cols)
        celda = rgba[f * alto // filas:(f + 1) * alto // filas, c * ancho // cols:(c + 1) * ancho // cols]
        ys, xs = np.nonzero(celda[:, :, 3] > 0)
        y0, y1 = max(ys.min() - MARGEN, 0), min(ys.max() + MARGEN + 1, celda.shape[0])
        x0, x1 = max(xs.min() - MARGEN, 0), min(xs.max() + MARGEN + 1, celda.shape[1])
        img = Image.fromarray(celda[y0:y1, x0:x1])
        img.save(Path(salida) / f'{nombre}.webp', 'WEBP', quality=90, method=6)
        print(f'{nombre}: {img.size[0]}×{img.size[1]}')


if __name__ == '__main__':
    main()
