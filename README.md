# Dashboard Mantenimiento Industrial

Dashboard web de indicadores KPI de mantenimiento, hospedado en **GitHub Pages** con **Supabase** como base de datos.

**Stack:** HTML + CSS + JS vanilla · Supabase (PostgreSQL) · Chart.js · Sin build step

---

## Despliegue paso a paso

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Clic en **New Project**
3. Elige nombre, contraseña y región (elige la más cercana)
4. Espera ~2 minutos a que el proyecto se inicialice

### 2. Ejecutar el schema (crear tabla)

1. En tu proyecto Supabase → menú izquierdo → **SQL Editor** → **New Query**
2. Copia y pega el contenido de `supabase/schema.sql`
3. Clic en **Run** (o Ctrl+Enter)
4. Verifica que aparezca "Success" sin errores

### 3. Cargar datos históricos

1. En **SQL Editor** → **New Query**
2. Copia y pega el contenido de `supabase/seed.sql`
3. Clic en **Run**
4. Debe insertar 182 registros de Febrero–Abril 2026

### 4. Obtener credenciales

1. En tu proyecto Supabase → **Project Settings** (engranaje) → **API**
2. Copia:
   - **Project URL** → pégala en `config.js` como `SUPABASE_URL`
   - **anon public** (Project API Keys) → pégala como `SUPABASE_ANON_KEY`

```js
// config.js
export const SUPABASE_URL     = 'https://xxxxxxxxxxxx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGci...';
```

### 5. Subir a GitHub

```bash
git init
git add index.html supabase/ README.md
# IMPORTANTE: NO subas config.js si tiene keys reales
git commit -m "Dashboard mantenimiento industrial"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

> **Seguridad:** `config.js` está en `.gitignore` por defecto para proteger tus credenciales.  
> Para GitHub Pages, puedes subir `config.js` con las keys reales ya que la `anon key` de Supabase está diseñada para ser pública y está protegida por Row Level Security.

### 6. Activar GitHub Pages

1. En tu repositorio GitHub → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / Folder: `/ (root)`
4. Clic en **Save**
5. Espera 1–2 minutos y accede a la URL generada:  
   `https://TU_USUARIO.github.io/TU_REPO/`

---

## Estructura del repositorio

```
/
├── index.html          ← Dashboard completo (archivo único)
├── config.js           ← Credenciales Supabase (completar)
├── supabase/
│   ├── schema.sql      ← CREATE TABLE + políticas RLS
│   └── seed.sql        ← 182 registros Feb–Abr 2026
└── README.md
```

---

## Funcionalidades del dashboard

| Sección | Descripción |
|---|---|
| **Tabs de filtro** | Todos / Febrero / Marzo / Abril — actualiza todo en tiempo real |
| **6 KPIs** | % global por línea, días sobre meta, peor día, total horas paradas |
| **Gráfica de línea** | % diario por las 3 líneas vs meta 2.5% (línea roja) |
| **Gráfica de barras** | Tiempo total parado por mes y línea |
| **Gráfica de dona** | Distribución ejecución vs espera por línea |
| **Formulario** | UPSERT en Supabase con vista previa del % en tiempo real |
| **Tabla** | Últimos 50 registros con semáforo de colores |
| **Exportar CSV** | Descarga los datos del período filtrado |

## Líneas de producción

| Línea | Color |
|---|---|
| Prensas Automáticas Bando | Azul |
| Recubiertos | Naranja |
| Prensas Manuales | Verde |

**Meta:** 2.5% — valores superiores se resaltan en rojo

---

## Uso local (sin GitHub Pages)

Abre `index.html` directamente en Chrome/Edge con la extensión
[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
o con:

```bash
npx serve .
```

> Los módulos ES (`import`) no funcionan con `file://` directamente —
> necesitas un servidor HTTP local aunque sea mínimo.
