-- =============================================================
-- Reparar RLS en registros_mantenimiento (soft delete / eliminar)
-- Ejecutar en Supabase → SQL Editor si sigue apareciendo:
-- "new row violates row-level security policy"
--
-- Causas habituales: varias políticas UPDATE (una con WITH CHECK
-- restrictivo), política RESTRICTIVE, o rol TO anon que no coincide.
-- Este script elimina TODAS las políticas de la tabla y deja solo
-- SELECT + INSERT + UPDATE para el rol PUBLIC (cubre anon y demás).
-- =============================================================

-- 1) Ver qué políticas hay ahora (revisa el resultado)
SELECT policyname, permissive, roles, cmd,
       qual::text     AS using_expr,
       with_check::text AS with_check_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'registros_mantenimiento';

-- 2) Quitar todas las políticas de esta tabla
DO $$
DECLARE pol text;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'registros_mantenimiento'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.registros_mantenimiento',
      pol
    );
  END LOOP;
END $$;

-- 3) Recrear el mínimo necesario para el dashboard
CREATE POLICY "public_select"
  ON public.registros_mantenimiento
  FOR SELECT
  TO PUBLIC
  USING (deleted_at IS NULL);

CREATE POLICY "public_insert"
  ON public.registros_mantenimiento
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "public_update"
  ON public.registros_mantenimiento
  FOR UPDATE
  TO PUBLIC
  USING (true)
  WITH CHECK (true);
