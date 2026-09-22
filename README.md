# Ejemplos de Node.js

Proyecto de práctica con Node.js moderno (ES Modules), manipulación del sistema de archivos (`node:fs/promises`), rutas (`node:path`), información del sistema operativo (`node:os`) y gestión de paquetes con `pnpm`.

## Requisitos previos

- [Node.js](https://nodejs.org/) (versión 18+ recomendada)
- [pnpm](https://pnpm.io/)

## Instalación

Clona el repositorio e instala las dependencias:

```bash
pnpm install
```

## Scripts disponibles

En el directorio del proyecto puedes ejecutar:

- **`pnpm start`**: Ejecuta `index.js` (ejemplo de importación de módulos con `math.js`).
- **`pnpm run files`**: Ejecuta `manage-files.js` (lectura, transformación y escritura de archivos).
- **`pnpm run system`**: Ejecuta `system-info.js` (consulta información del sistema operativo).

## Estructura del proyecto

```text
├── index.js              # Punto de entrada de prueba con funciones matemáticas
├── math.js               # Módulo con operaciones matemáticas básicas
├── manage-files.js       # Manejo asíncrono del sistema de archivos (fs y path)
├── system-info.js        # Consulta del sistema operativo (os)
├── archivo.txt           # Archivo de texto de prueba
├── package.json          # Configuración del proyecto y dependencias
├── pnpm-lock.yaml        # Bloqueo de versiones de pnpm
└── .gitignore            # Archivos y carpetas ignorados por git
```
