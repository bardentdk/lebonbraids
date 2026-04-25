-- =============================================
-- HORAIRES PAR DÉFAUT (lundi à samedi, 9h-19h)
-- =============================================
insert into public.business_hours (day_of_week, opens_at, closes_at, is_closed, break_start, break_end) values
  (0, '09:00', '19:00', true, null, null),   -- Dimanche fermé
  (1, '09:00', '19:00', false, '12:30', '13:30'), -- Lundi
  (2, '09:00', '19:00', false, '12:30', '13:30'), -- Mardi
  (3, '09:00', '19:00', false, '12:30', '13:30'), -- Mercredi
  (4, '09:00', '19:00', false, '12:30', '13:30'), -- Jeudi
  (5, '09:00', '19:00', false, '12:30', '13:30'), -- Vendredi
  (6, '09:00', '17:00', false, '12:30', '13:30')  -- Samedi
on conflict (day_of_week) do nothing;

-- =============================================
-- THÈME PAR DÉFAUT (Bleu Premium)
-- =============================================
insert into public.themes (name, slug, is_active, is_default, config) values (
  'Bleu Premium',
  'bleu-premium',
  true,
  true,
  '{
    "colors": {
      "primary": {
        "50": "214 100% 97%",
        "100": "214 95% 93%",
        "200": "213 97% 87%",
        "300": "212 96% 78%",
        "400": "213 94% 68%",
        "500": "217 91% 60%",
        "600": "221 83% 53%",
        "700": "224 76% 48%",
        "800": "226 71% 40%",
        "900": "224 64% 33%",
        "950": "226 57% 21%"
      },
      "secondary": {
        "50": "48 100% 96%",
        "500": "43 96% 56%",
        "600": "38 92% 50%",
        "900": "28 73% 26%"
      },
      "accent": "262 83% 58%",
      "background": "0 0% 100%",
      "foreground": "224 71% 4%",
      "muted": "220 14% 96%",
      "mutedForeground": "220 9% 46%",
      "border": "220 13% 91%",
      "success": "142 76% 36%",
      "warning": "38 92% 50%",
      "danger": "0 84% 60%"
    },
    "radius": "1rem",
    "fontFamily": "Poppins"
  }'::jsonb
)
on conflict (slug) do nothing;

-- =============================================
-- PARAMÈTRES SITE PAR DÉFAUT
-- =============================================
insert into public.site_settings (key, value, description, category, is_public) values
  ('business.name', '"Mon Salon de Tresses"'::jsonb, 'Nom de l''entreprise', 'general', true),
  ('business.tagline', '"L''art des tresses afro"'::jsonb, 'Slogan', 'general', true),
  ('business.email', '"contact@example.com"'::jsonb, 'Email de contact', 'general', true),
  ('business.phone', '"+262 000 000 000"'::jsonb, 'Téléphone', 'general', true),
  ('business.address', '""'::jsonb, 'Adresse complète', 'general', true),
  ('business.city', '""'::jsonb, 'Ville', 'general', true),
  ('business.postal_code', '""'::jsonb, 'Code postal', 'general', true),
  ('business.country', '"France"'::jsonb, 'Pays', 'general', true),
  ('business.siret', '""'::jsonb, 'SIRET', 'legal', false),
  ('business.vat_number', '""'::jsonb, 'Numéro TVA', 'legal', false),
  ('business.logo_url', '""'::jsonb, 'URL du logo', 'general', true),
  ('booking.min_notice_hours', '24'::jsonb, 'Délai min réservation (h)', 'booking', true),
  ('booking.max_advance_days', '60'::jsonb, 'Réservation max à l''avance (jours)', 'booking', true),
  ('booking.slot_interval_minutes', '30'::jsonb, 'Intervalle créneaux (min)', 'booking', true),
  ('booking.require_deposit', 'false'::jsonb, 'Acompte obligatoire', 'booking', true),
  ('booking.deposit_percentage', '30'::jsonb, 'Pourcentage acompte', 'booking', true),
  ('invoice.tax_rate', '0'::jsonb, 'Taux TVA (%)', 'invoice', false),
  ('invoice.prefix', '"FA"'::jsonb, 'Préfixe facture', 'invoice', false),
  ('invoice.legal_mentions', '"TVA non applicable, art. 293 B du CGI"'::jsonb, 'Mentions légales facture', 'invoice', false),
  ('social.instagram', '""'::jsonb, 'Instagram', 'social', true),
  ('social.facebook', '""'::jsonb, 'Facebook', 'social', true),
  ('social.tiktok', '""'::jsonb, 'TikTok', 'social', true)
on conflict (key) do nothing;

-- =============================================
-- CATÉGORIES PRESTATIONS DE DÉMO
-- =============================================
insert into public.service_categories (name, slug, description, icon, sort_order) values
  ('Box Braids', 'box-braids', 'Tresses carrées classiques', 'Sparkles', 1),
  ('Knotless', 'knotless', 'Tresses sans nœud, plus naturelles', 'Waves', 2),
  ('Twists', 'twists', 'Twists, Senegalese, Marley', 'GitBranch', 3),
  ('Tissage & Perruques', 'tissage-perruques', 'Tissages et pose de perruques', 'Crown', 4),
  ('Enfants', 'enfants', 'Coiffures pour enfants', 'Baby', 5),
  ('Défaisage & Soin', 'defaisage-soin', 'Défaisage et soins capillaires', 'Heart', 6)
on conflict (slug) do nothing;

-- =============================================
-- CATÉGORIES PRODUITS DE DÉMO
-- =============================================
insert into public.product_categories (name, slug, description, icon, sort_order) values
  ('Mèches & Cheveux', 'meches-cheveux', 'Mèches synthétiques et naturelles', 'Scissors', 1),
  ('Soins Capillaires', 'soins', 'Shampoings, huiles, masques', 'Droplet', 2),
  ('Accessoires', 'accessoires', 'Peignes, bonnets, perles', 'Gift', 3),
  ('Coffrets', 'coffrets', 'Coffrets cadeaux et routines', 'Package', 4)
on conflict (slug) do nothing;

-- =============================================
-- TEMPLATES EMAILS DE BASE
-- =============================================
insert into public.email_templates (key, type, name, subject, html_content, variables) values
  (
    'booking_confirmation',
    'booking_confirmation',
    'Confirmation de réservation',
    'Votre rendez-vous est confirmé ✨',
    '<p>Bonjour {{client_first_name}},</p><p>Votre rendez-vous du {{booking_date}} à {{booking_time}} est confirmé.</p><p>Prestation : {{services}}</p><p>À très vite ! ♥</p>',
    '["client_first_name", "booking_date", "booking_time", "services", "total_amount", "booking_reference"]'::jsonb
  ),
  (
    'booking_reminder',
    'booking_reminder',
    'Rappel de rendez-vous',
    'Rappel : votre RDV demain 💫',
    '<p>Bonjour {{client_first_name}},</p><p>Petit rappel : votre rendez-vous est demain à {{booking_time}}.</p>',
    '["client_first_name", "booking_time", "booking_date"]'::jsonb
  ),
  (
    'order_confirmation',
    'order_confirmation',
    'Confirmation de commande',
    'Votre commande {{order_reference}} est confirmée',
    '<p>Bonjour {{client_first_name}},</p><p>Merci pour votre commande ! Montant : {{total_amount}}€</p>',
    '["client_first_name", "order_reference", "total_amount", "items"]'::jsonb
  )
on conflict (key) do nothing;