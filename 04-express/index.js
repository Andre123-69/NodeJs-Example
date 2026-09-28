import express from "express";
import jsonjobs from "./jobs.json" with { type: "json" };
import { DEFAULTS } from "./config.js";

// Cargar variables de entorno si existen
try {
  process.loadEnvFile();
} catch {
  // Ignorar si no existe el archivo .env
}

const PORT = process.env.PORT || DEFAULTS.PORT;
const app = express();

// Middlewares globales
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  const timeString = new Date().toLocaleTimeString();
  console.log(`${timeString} - ${req.method} ${req.url}`);
  next();
});

// Middleware específico de ejemplo
const previousHomeMiddleware = (req, res, next) => {
  console.log("Previous home middleware");
  next();
};

// Rutas base
app.get("/", previousHomeMiddleware, (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

/**
 * Controlador para listar y filtrar ofertas de empleo
 */
const handleGetJobs = (req, res) => {
  const { text, title, level, technology, limit = DEFAULTS.LIMIT_PAGINATION, offset = DEFAULTS.LIMIT_OFFSET } = req.query;

  let filteredJobs = [...jsonjobs];

  // 1. Filtro general de texto (busca en título, descripción y empresa)
  if (text) {
    const searchTerm = text.trim().toLowerCase();
    filteredJobs = filteredJobs.filter((job) =>
      job.titulo?.toLowerCase().includes(searchTerm) ||
      job.descripcion?.toLowerCase().includes(searchTerm) ||
      job.empresa?.toLowerCase().includes(searchTerm)
    );
  }

  // 2. Filtro específico por título
  if (title) {
    const searchTitle = title.trim().toLowerCase();
    filteredJobs = filteredJobs.filter((job) =>
      job.titulo?.toLowerCase().includes(searchTitle)
    );
  }

  // 3. Filtro por nivel (junior, mid-level, senior, etc.)
  if (level) {
    const searchLevel = level.trim().toLowerCase();
    filteredJobs = filteredJobs.filter((job) =>
      job.data?.nivel?.toLowerCase() === searchLevel
    );
  }

  // 4. Filtro por tecnología
  if (technology) {
    const searchTechnology = technology.trim().toLowerCase();
    filteredJobs = filteredJobs.filter((job) =>
      Array.isArray(job.data?.technology) &&
      job.data.technology.some((tech) => tech.toLowerCase().includes(searchTechnology))
    );
  }

  // 5. Paginación (offset y limit)
  const total = filteredJobs.length;
  const parsedOffset = Number(offset);
  const parsedLimit = Number(limit);

  const safeOffset = !Number.isNaN(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
  const safeLimit = !Number.isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : total;

  const paginatedJobs = filteredJobs.slice(safeOffset, safeOffset + safeLimit);

  res.status(200).json({
    total,
    count: paginatedJobs.length,
    offset: safeOffset,
    limit: safeLimit,
    jobs: paginatedJobs
  });
};

// Rutas de Jobs (soportando convención REST y nombres originales)
app.get("/jobs", handleGetJobs);
app.get("/get-jobs", handleGetJobs);

/**
 * Controlador para obtener un empleo específico por su UUID
 */
const handleGetSingleJob = (req, res) => {
  const { id } = req.params;

  // Los IDs en jobs.json son UUID (strings)
  const job = jsonjobs.find((j) => j.id === id);

  if (!job) {
    return res.status(404).json({ error: "Job not found", id });
  }

  return res.status(200).json({ job });
};

app.get("/jobs/:id", handleGetSingleJob);
app.get("/get-single-job/:id", handleGetSingleJob);

/* ==========================================================
 * Rutas de prueba / Ejemplos de patrones de rutas en Express
 * ========================================================== */

// Ruta opcional
app.get("/a{b}cd", (req, res) => {
  res.send("empieza con ab");
});

// Comodín
app.get("/bb*bb", (req, res) => {
  res.send("coincide con comodín bb*bb");
});

// Rutas con wildcards o parámetros extendidos
app.get("/files/*filename", (req, res) => {
  res.send(`Ruta de archivo: ${req.params.filename || ""}`);
});

// Expresión regular en ruta (termina en 'fly')
app.get(/.*fly$/, (req, res) => {
  res.send("termina en fly");
});

// Manejador para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Manejador global de errores (500)
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});