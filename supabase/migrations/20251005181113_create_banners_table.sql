/*
  # Création de la table banners

  1. Nouvelle Table
    - `banners`
      - `id` (uuid, clé primaire) - Identifiant unique de la bannière
      - `title` (text, obligatoire) - Titre de la bannière
      - `description` (text, optionnel) - Description courte de la bannière
      - `image` (text, obligatoire) - URL de l'image de la bannière
      - `link` (text, optionnel) - Lien externe vers lequel la bannière redirige
      - `order` (integer, défaut 0) - Ordre d'affichage des bannières
      - `is_active` (boolean, défaut true) - Indique si la bannière est active/visible
      - `created_at` (timestamptz, défaut now()) - Date de création

  2. Sécurité
    - Activer RLS sur la table `banners`
    - Politique de lecture publique pour tous les utilisateurs authentifiés et anonymes
    - Les bannières sont en lecture seule pour les utilisateurs (seuls les admins peuvent les modifier)

  3. Index
    - Index sur `order` pour optimiser le tri
    - Index sur `is_active` pour filtrer rapidement les bannières actives

  4. Notes importantes
    - Les bannières sont accessibles en lecture publique car elles sont affichées sur l'écran d'accueil
    - L'ordre détermine la position dans le carousel (ordre croissant)
    - Seules les bannières avec is_active=true sont affichées
*/

-- Créer la table banners
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image text NOT NULL,
  link text,
  "order" integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour tous
CREATE POLICY "Anyone can view active banners"
  ON banners
  FOR SELECT
  USING (is_active = true);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners("order");
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);

-- Insérer des bannières de test
INSERT INTO banners (title, description, image, link, "order", is_active) VALUES
  (
    'Afrachat Hala',
    'Nouveau cours disponible',
    'https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://example.com/cours',
    1,
    true
  ),
  (
    'Événement spécial',
    'Rejoignez-nous pour un moment unique',
    'https://images.pexels.com/photos/18933245/pexels-photo-18933245/free-photo-of-lumiere-ville-rue-batiment.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://example.com/evenement',
    2,
    true
  ),
  (
    'Mise à jour importante',
    'Découvrez les nouvelles fonctionnalités',
    'https://images.pexels.com/photos/7034354/pexels-photo-7034354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    '',
    3,
    true
  ),
  (
    'Ma prière personnalisée',
    'Créez votre propre prière',
    'https://images.pexels.com/photos/8535165/pexels-photo-8535165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://example.com/ma-priere',
    4,
    true
  );
