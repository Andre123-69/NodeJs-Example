import { createServer } from "node:http";
import { json } from "node:stream/consumers";
import { randomUUID } from "node:crypto";
import os from "node:os";

// Cargar variables de entorno si existe .env
try {
    process.loadEnvFile();
} catch {
    // Si no existe el archivo .env, continúa con los valores por defecto
}

// Helpers para respuestas HTTP
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message) {
    sendJson(res, statusCode, { error: message });
}

// Base de datos de prueba en memoria
const users = [
    { id: "1", name: "John" },
    { id: "2", name: "Jane" },
    { id: "3", name: "Bob" }
];

// Controladores de rutas fijas
const routes = {
    "GET /": (req, res) => {
        sendJson(res, 200, { message: "Hello World 👌" });
    },

    "GET /status": (req, res) => {
        sendJson(res, 200, {
            status: "ok",
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    },

    "GET /info": (req, res) => {
        sendJson(res, 200, {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            uptime: os.uptime(),
            freemem: os.freemem(),
            totalmem: os.totalmem()
        });
    },

    "GET /users": (req, res, { params }) => {
        const rawLimit = params.get("limit");
        const rawOffset = params.get("offset");

        const limit = rawLimit !== null && !Number.isNaN(Number(rawLimit))
            ? Math.max(0, Number(rawLimit))
            : users.length;

        const offset = rawOffset !== null && !Number.isNaN(Number(rawOffset))
            ? Math.max(0, Number(rawOffset))
            : 0;

        const paginatedUsers = users.slice(offset, offset + limit);
        sendJson(res, 200, paginatedUsers);
    },

    "POST /users": async (req, res) => {
        let body;
        try {
            body = await json(req);
        } catch {
            return sendError(res, 400, "Invalid JSON body");
        }

        if (!body || typeof body.name !== "string" || !body.name.trim()) {
            return sendError(res, 400, "Name is required and must be a valid string");
        }

        const newUser = {
            id: randomUUID(),
            name: body.name.trim()
        };

        users.push(newUser);
        sendJson(res, 201, {
            message: "User created successfully",
            user: newUser
        });
    }
};

// Servidor HTTP con enrutamiento y manejo global de errores
const server = createServer(async (req, res) => {
    try {
        const { method = "GET", url = "/" } = req;
        const [path, queryString] = url.split("?");
        const params = new URLSearchParams(queryString);

        // 1. Manejo de rutas estáticas
        const routeKey = `${method} ${path}`;
        if (routes[routeKey]) {
            return await routes[routeKey](req, res, { path, params });
        }

        // 2. Manejo de rutas dinámicas (GET /users/:id)
        if (method === "GET" && path.startsWith("/users/")) {
            const id = path.split("/")[2];
            const user = users.find((u) => String(u.id) === id);

            if (!user) {
                return sendError(res, 404, "User not found");
            }

            return sendJson(res, 200, user);
        }

        // 3. Verificar si la ruta existe bajo otro método HTTP -> 405 Method Not Allowed
        const commonMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
        const pathExistsUnderOtherMethod = commonMethods.some(
            (m) => m !== method && routes[`${m} ${path}`]
        );

        if (pathExistsUnderOtherMethod) {
            return sendError(res, 405, "Method not allowed");
        }

        // 4. Si no coincide ninguna ruta -> 404 Not Found
        sendError(res, 404, "Not Found");
    } catch (error) {
        console.error("Unhandled error:", error);
        sendError(res, 500, "Internal Server Error");
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});