-- ============================================================
-- honeyMoney — Row Level Security Policies (v2)
-- Usa una función SECURITY DEFINER para evitar recursión infinita
-- en wallet_members.
-- ============================================================

-- ============================================================
-- FUNCIÓN HELPER (SECURITY DEFINER = bypasea RLS)
-- Devuelve los wallet_ids del usuario actual sin triggerar políticas
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_wallet_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT wallet_id FROM wallet_members WHERE user_id = auth.uid();
$$;

-- ============================================================
-- Habilitar RLS en todas las tablas
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_wallet_members" ON profiles;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_wallet_members"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT user_id FROM wallet_members
      WHERE wallet_id IN (SELECT get_my_wallet_ids())
    )
  );

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- WALLETS
-- ============================================================
DROP POLICY IF EXISTS "wallets_select_member" ON wallets;
DROP POLICY IF EXISTS "wallets_select_by_code" ON wallets;
DROP POLICY IF EXISTS "wallets_insert_owner" ON wallets;
DROP POLICY IF EXISTS "wallets_update_owner" ON wallets;
DROP POLICY IF EXISTS "wallets_delete_owner" ON wallets;

-- Ver wallets propios (usa la función helper, no recursión)
CREATE POLICY "wallets_select_member"
  ON wallets FOR SELECT
  USING (id IN (SELECT get_my_wallet_ids()));

-- Buscar wallet por share_code para unirse (cualquier autenticado)
CREATE POLICY "wallets_select_by_code"
  ON wallets FOR SELECT
  USING (true);

CREATE POLICY "wallets_insert_owner"
  ON wallets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "wallets_update_owner"
  ON wallets FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "wallets_delete_owner"
  ON wallets FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================
-- WALLET_MEMBERS
-- La política SELECT usa get_my_wallet_ids() (SECURITY DEFINER)
-- para evitar recursión infinita.
-- ============================================================
DROP POLICY IF EXISTS "wallet_members_select" ON wallet_members;
DROP POLICY IF EXISTS "wallet_members_insert_self" ON wallet_members;
DROP POLICY IF EXISTS "wallet_members_insert_owner" ON wallet_members;
DROP POLICY IF EXISTS "wallet_members_delete_self" ON wallet_members;
DROP POLICY IF EXISTS "wallet_members_delete_owner" ON wallet_members;

CREATE POLICY "wallet_members_select"
  ON wallet_members FOR SELECT
  USING (wallet_id IN (SELECT get_my_wallet_ids()));

CREATE POLICY "wallet_members_insert_self"
  ON wallet_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallet_members_delete_self"
  ON wallet_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "wallet_members_delete_owner"
  ON wallet_members FOR DELETE
  USING (
    wallet_id IN (
      SELECT id FROM wallets WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- TRANSACTIONS
-- ============================================================
DROP POLICY IF EXISTS "transactions_select" ON transactions;
DROP POLICY IF EXISTS "transactions_insert" ON transactions;
DROP POLICY IF EXISTS "transactions_update" ON transactions;
DROP POLICY IF EXISTS "transactions_delete" ON transactions;

CREATE POLICY "transactions_select"
  ON transactions FOR SELECT
  USING (wallet_id IN (SELECT get_my_wallet_ids()));

CREATE POLICY "transactions_insert"
  ON transactions FOR INSERT
  WITH CHECK (wallet_id IN (SELECT get_my_wallet_ids()));

CREATE POLICY "transactions_update"
  ON transactions FOR UPDATE
  USING (wallet_id IN (SELECT get_my_wallet_ids()));

CREATE POLICY "transactions_delete"
  ON transactions FOR DELETE
  USING (wallet_id IN (SELECT get_my_wallet_ids()));

-- ============================================================
-- CATEGORIES
-- ============================================================
DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_insert" ON categories;
DROP POLICY IF EXISTS "categories_update" ON categories;
DROP POLICY IF EXISTS "categories_delete" ON categories;

CREATE POLICY "categories_select"
  ON categories FOR SELECT
  USING (wallet_id IN (SELECT get_my_wallet_ids()));

CREATE POLICY "categories_insert"
  ON categories FOR INSERT
  WITH CHECK (wallet_id IN (SELECT get_my_wallet_ids()));

CREATE POLICY "categories_update"
  ON categories FOR UPDATE
  USING (wallet_id IN (SELECT get_my_wallet_ids()));

CREATE POLICY "categories_delete"
  ON categories FOR DELETE
  USING (wallet_id IN (SELECT get_my_wallet_ids()));

-- ============================================================
-- SAVINGS_GOALS
-- ============================================================
DROP POLICY IF EXISTS "savings_goals_select" ON savings_goals;
DROP POLICY IF EXISTS "savings_goals_insert" ON savings_goals;
DROP POLICY IF EXISTS "savings_goals_update" ON savings_goals;
DROP POLICY IF EXISTS "savings_goals_delete" ON savings_goals;

CREATE POLICY "savings_goals_select"
  ON savings_goals FOR SELECT
  USING (wallet_id IN (SELECT get_my_wallet_ids()));

CREATE POLICY "savings_goals_insert"
  ON savings_goals FOR INSERT
  WITH CHECK (wallet_id IN (SELECT get_my_wallet_ids()));

CREATE POLICY "savings_goals_update"
  ON savings_goals FOR UPDATE
  USING (wallet_id IN (SELECT get_my_wallet_ids()));

CREATE POLICY "savings_goals_delete"
  ON savings_goals FOR DELETE
  USING (wallet_id IN (SELECT get_my_wallet_ids()));
