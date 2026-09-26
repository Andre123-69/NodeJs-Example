import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

// console.log(process.argv);

//1.- Recuperar la carpeta a listar
const dirPath = process.argv[2] || '.';

//2. Formateo simple de los tamaños
const formatBytes = (size) => {
    if (size <= 1024) return `${size} B`;
    return `${(size / 1024).toFixed(2)} KB`;
}

//3. Leer los nombres, sin info
const files = await readdir(dirPath);

//4. Recuperar la info de cada file
const entries = await Promise.all(
    files.map(async (name) => {
        const fullPath = join(dirPath, name);
        const info = await stat(fullPath);
        return {
            name, 
            isDir: info.isDirectory(),
            size: formatBytes(info.size),
        };
    })
);

for (const e of entries) {
    // Renderizar la informacion
    const icon = e.isDir ? '📂' : '📄';
    const sizeStr = e.isDir ? '----' : `(${e.size})`;
    console.log(`${icon} ${e.name.padEnd(25)} ${sizeStr}`);

}


