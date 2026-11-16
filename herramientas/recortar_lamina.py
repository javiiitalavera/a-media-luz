"""Recorta una lámina de objetos (cuadrícula) en archivos sueltos con fondo transparente.

Uso:
  python3 herramientas/recortar_lamina.py LAMINA.png COLUMNAS FILAS CARPETA_SALIDA nombre1 nombre2 ...
  python3 herramientas/recortar_lamina.py --personaje LAMINA.png COLUMNAS FILAS CARPETA_SALIDA nombre1 ...
  python3 herramientas/recortar_lamina.py --sin-halo LAMINA.png ...   (quita el resplandor que rodea los objetos)

Con --personaje (expresiones de un mismo personaje) todas se recortan con el MISMO encuadre y se
guardan en un cuadrado de 600 × 600 con los pies abajo, como las del cachorro, para que al cambiar
de expresión el personaje no se mueva ni cambie de tamaño.

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
    """Si el fondo es opaco, lo vuelve transparente rellenando desde los bordes.

    Sirve para fondo liso (blanco o magenta) y para el falso «cuadriculado de transparencia» que a
    veces DIBUJA el generador: blancos y grises claros sin color. También se lleva el borde blanco
    tipo pegatina que suele rodear al personaje, y suaviza el canto para que no quede halo claro.
    """
    alto, ancho = rgba.shape[:2]
    if rgba[:, :, 3].min() < 250:
        return rgba  # ya trae transparencia
    rgb = rgba[:, :, :3].astype(int)
    fondo = rgb[0, 0]
    claro_neutro = (rgb.min(axis=2) >= 215) & (rgb.max(axis=2) - rgb.min(axis=2) <= 22)
    parecido = (np.abs(rgb - fondo).sum(axis=2) < 60) | claro_neutro
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
    # Canto: los píxeles claros pegados al fondo se vuelven semitransparentes según lo claros que son.
    cerca = np.zeros_like(visto)
    for dy in (-2, -1, 0, 1, 2):
        for dx in (-2, -1, 0, 1, 2):
            cerca |= np.roll(np.roll(visto, dy, 0), dx, 1)
    canto = cerca & ~visto
    # (el contorno de los dibujos es oscuro: lo claro que queda en el canto es resto del fondo)
    claridad = rgb.min(axis=2)
    a = np.clip((170 - claridad) / 50, 0, 1)
    rgba[canto, 3] = np.minimum(rgba[canto, 3], (a[canto] * 255).astype(np.uint8))
    return rgba


def quitar_halo(rgba: np.ndarray) -> np.ndarray:
    """Quita el resplandor crema que rodea a los objetos: avanza desde lo transparente por píxeles claros
    (o semitransparentes) hasta toparse con el contorno oscuro. Lo de dentro del contorno no se toca."""
    alto, ancho = rgba.shape[:2]
    rgb = rgba[:, :, :3].astype(int)
    claro = (rgb.min(axis=2) >= 170) & (rgb.max(axis=2) - rgb.min(axis=2) <= 90)
    pasable = (rgba[:, :, 3] < 250) | claro
    visto = rgba[:, :, 3] < 8
    cola = deque(zip(*np.nonzero(visto)))
    while cola:
        y, x = cola.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < alto and 0 <= nx < ancho and not visto[ny, nx] and pasable[ny, nx]:
                visto[ny, nx] = True
                cola.append((ny, nx))
    rgba = rgba.copy()
    rgba[visto, 3] = 0
    return rgba


def limpiar_alfa(rgba: np.ndarray, desde: int = 16) -> np.ndarray:
    """Fuera el velo (alfa por debajo de `desde`), dentro opaco. Con --sin-halo, `desde` sube y se va
    también el resplandor semitransparente que a veces rodea los objetos."""
    a = rgba[:, :, 3].astype(float)
    a = np.clip((a - desde) / (240 - desde), 0, 1) * 255
    rgba = rgba.copy()
    rgba[:, :, 3] = a.astype(np.uint8)
    return rgba


LADO = 600
ALTO_PERSONAJE = 0.92  # el personaje ocupa este alto del cuadrado (como el cachorro)
PIES = 0.972  # y apoya los pies a esta altura


def main() -> None:
    args = sys.argv[1:]
    personaje = '--personaje' in args
    sin_halo = '--sin-halo' in args
    args = [x for x in args if x not in ('--personaje', '--sin-halo')]
    lamina, cols, filas, salida, *nombres = args
    cols, filas = int(cols), int(filas)
    rgba = limpiar_alfa(quitar_fondo_liso(np.array(Image.open(lamina).convert('RGBA'))))
    if sin_halo:
        rgba = quitar_halo(rgba)
    alto, ancho = rgba.shape[:2]
    Path(salida).mkdir(parents=True, exist_ok=True)
    celdas = []
    for i in range(len(nombres)):
        f, c = divmod(i, cols)
        celdas.append(rgba[f * alto // filas:(f + 1) * alto // filas, c * ancho // cols:(c + 1) * ancho // cols])
    if personaje:
        cajas = [np.nonzero(cd[:, :, 3] > 0) for cd in celdas]
        y0 = min(ys.min() for ys, _ in cajas); y1 = max(ys.max() for ys, _ in cajas) + 1
        x0 = min(xs.min() for _, xs in cajas); x1 = max(xs.max() for _, xs in cajas) + 1
        escala = LADO * ALTO_PERSONAJE / (y1 - y0)
        for celda, nombre in zip(celdas, nombres):
            img = Image.fromarray(celda[y0:y1, x0:x1])
            img = img.resize((round(img.width * escala), round(img.height * escala)), Image.LANCZOS)
            lienzo = Image.new('RGBA', (LADO, LADO), (0, 0, 0, 0))
            lienzo.alpha_composite(img, ((LADO - img.width) // 2, round(LADO * PIES) - img.height))
            lienzo.save(Path(salida) / f'{nombre}.webp', 'WEBP', quality=90, method=6)
            print(f'{nombre}: {LADO}×{LADO} (mismo encuadre)')
        return
    for celda, nombre in zip(celdas, nombres):
        ys, xs = np.nonzero(celda[:, :, 3] > 0)
        y0, y1 = max(ys.min() - MARGEN, 0), min(ys.max() + MARGEN + 1, celda.shape[0])
        x0, x1 = max(xs.min() - MARGEN, 0), min(xs.max() + MARGEN + 1, celda.shape[1])
        img = Image.fromarray(celda[y0:y1, x0:x1])
        img.save(Path(salida) / f'{nombre}.webp', 'WEBP', quality=90, method=6)
        print(f'{nombre}: {img.size[0]}×{img.size[1]}')


if __name__ == '__main__':
    main()
