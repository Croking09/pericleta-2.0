# Rift Draft

Sorteo aleatorio de equipos para League of Legends (2 equipos de 5).

## Cómo funciona

1. Escribe los nombres de los jugadores en el cuadro de texto, uno por línea.
2. Pulsa **SORTEAR SIGUIENTE PAREJA**: se abre un popup con una animación de
   nombres deslizándose, con un sonido "tac" en cada paso, cada vez más lento
   hasta bloquearse en un nombre para el equipo azul y otro para el rojo.
3. Repite hasta que no queden jugadores. Si el número de jugadores es impar,
   el último se queda sin pareja y el botón se bloquea con un aviso.
4. **Reiniciar sorteo** vuelve a dejar los dos equipos vacíos y permite editar
   el pool de nuevo.

## Arrancar el proyecto

```bash
npm install
npm start
```

Esto levanta un servidor de desarrollo en `http://localhost:4200`.

## Compilar para producción

```bash
npm run build
```

Los archivos generados quedan en `dist/rift-draft`.

## Estructura

```
src/app/
  services/
    draft.service.ts       # estado del pool, equipos y lógica de sorteo
    tac-sound.service.ts   # sonido "tac" generado con Web Audio API
  components/
    player-pool/           # caja de texto con los nombres
    team-column/           # columna reutilizable (azul / rojo)
    draw-popup/             # popup con la animación del sorteo
  app.component.*          # orquesta todo lo anterior
```
