# Migrar datos de Supabase a Neon

## 1. Crear proyecto en Neon

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta
2. **New Project** → elige región cercana
3. En **Dashboard** → **SQL Editor**, ejecuta `neon/schema.sql`
4. Copia la **connection string** (Connection details → pooled connection)

## 2. Exportar datos desde Supabase

### Opción A — Script automático (recomendado)

1. Copia `.env.example` a `.env` y completa `SUPABASE_URL` y `SUPABASE_ANON_KEY`
   (o crea `supabase-export.config.js` desde `supabase-export.config.example.js`)
2. Ejecuta:

```bash
npm run export:supabase
```

3. Se genera `neon/export-import.sql` con todos los registros activos
4. En Neon SQL Editor, ejecuta ese archivo

Para importar directo a Neon (si ya tienes `DATABASE_URL` en `.env`):

```bash
npm run export:supabase -- --import
```

### Opción B — Datos históricos del repo

Si solo necesitas los datos de ejemplo:

1. En Neon SQL Editor, ejecuta `supabase/seed.sql` (mismo contenido válido para Neon)

### Opción C — Exportar producción actual de Supabase (manual)

1. Supabase Dashboard → **Table Editor** → `registros_mantenimiento`
2. **Export** → CSV
3. Importa en Neon con:

```sql
-- Ejemplo con COPY (ajusta la ruta según tu entorno)
COPY registros_mantenimiento (fecha, linea, exec_min, wait_min, prod_min)
FROM '/ruta/registros.csv'
DELIMITER ','
CSV HEADER;
```

### Opción D — pg_dump / pg_restore (si tienes muchos datos)

Desde Supabase (**Project Settings → Database → Connection string**):

```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
  --table=registros_mantenimiento \
  --data-only \
  --column-inserts \
  -f registros_export.sql
```

Luego en Neon:

```bash
psql "postgresql://[USER]:[PASSWORD]@[HOST]/[DB]?sslmode=require" -f registros_export.sql
```

## 3. Verificar

```sql
SELECT COUNT(*) FROM registros_mantenimiento WHERE deleted_at IS NULL;
SELECT MIN(fecha), MAX(fecha) FROM registros_mantenimiento;
```

## 4. Desplegar en Render

Sigue los pasos del `README.md` para crear el Web Service en Render con `DATABASE_URL`.
