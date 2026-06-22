# Dashboard Mantenimiento Industrial

Dashboard web de indicadores KPI de mantenimiento, desplegado en **Render** con **Neon** (PostgreSQL) como base de datos.

**Stack:** HTML + CSS + JS vanilla · Express · Neon · Chart.js

---

## Despliegue en Render (recomendado)

### 1. Base de datos en Neon

1. Crea proyecto en [neon.tech](https://neon.tech)
2. Ejecuta `neon/schema.sql` en SQL Editor
3. Ejecuta `neon/export-import.sql` (datos exportados de Supabase)
4. Copia la **pooled connection string**

### 2. Subir código a GitHub

```bash
git add .
git commit -m "Preparar despliegue en Render"
git push
```

### 3. Crear servicio en Render

**Opción A — Blueprint (automático)**

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**
2. Conecta el repositorio de GitHub
3. Render detecta `render.yaml` y crea el servicio
4. Añade `DATABASE_URL` con la connection string de Neon

**Opción B — Manual**

1. **New** → **Web Service**
2. Conecta el repo de GitHub
3. Configuración:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
4. En **Environment** → añade `DATABASE_URL` (connection string pooled de Neon)
5. **Create Web Service**

### 4. Acceder al dashboard

Render te dará una URL tipo:

`https://dashboard-mantenimiento.onrender.com`

Con `API_URL = ''` en `config.js`, el frontend y la API comparten el mismo dominio.

> **Plan free:** el servicio se duerme tras ~15 min sin uso. La primera carga puede tardar ~30 s.

---

## Desarrollo local

```bash
cp .env.example .env
# Edita .env con DATABASE_URL de Neon

npm install
npm run dev
```

Abre `http://localhost:3000`

---

## Exportar datos desde Supabase

```bash
npm run export:supabase
```

Genera `neon/export-import.sql`. Ver `neon/migrate-from-supabase.md` para más opciones.

---

## Estructura del repositorio

```
/
├── index.html              ← Dashboard
├── config.js               ← API_URL (vacío en Render)
├── db-client.js            ← Cliente HTTP
├── server.js               ← Servidor Express (Render)
├── render.yaml             ← Blueprint de Render
├── lib/
│   ├── db.js               ← Conexión Neon
│   └── registros-service.js
├── neon/
│   ├── schema.sql
│   └── export-import.sql
├── scripts/
│   └── export-from-supabase.js
└── package.json
```

---

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check (Render) |
| `GET` | `/api/registros?start=...&end=...` | Listar registros |
| `GET` | `/api/registros?action=months` | Fechas para tabs |
| `POST` | `/api/registros` | Crear o actualizar |
| `PATCH` | `/api/registros?id=N` | Soft delete |

---

## Funcionalidades del dashboard

| Sección | Descripción |
|---|---|
| **Tabs de filtro** | Todos / por mes |
| **6 KPIs** | % global, días sobre meta, peor día, horas paradas |
| **Gráficas** | Línea, barras y dona |
| **Formulario** | Upsert con vista previa del % |
| **Tabla** | Últimos 50 registros |
| **Exportar CSV** | Descarga del período filtrado |

**Meta:** 2.5%
