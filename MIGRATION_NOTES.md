# Notes de migration - Bannières

## Changements effectués

### 1. Migration de Supabase vers Firebase Firestore
- **Avant**: Les bannières étaient stockées dans une table Supabase `banners`
- **Après**: Les bannières sont maintenant dans une collection Firebase Firestore `banners_final`

### 2. Fichiers supprimés
- ✅ `/supabase/migrations/20251005181113_create_banners_table.sql` - Migration Supabase supprimée
- ✅ `/config/supabase.ts` - Client Supabase supprimé
- ✅ Variables d'environnement Supabase retirées de `.env` et `app.json`
- ✅ Dépendance `@supabase/supabase-js` retirée de `package.json`

### 3. Fichiers modifiés
- ✅ `/services/firestore.ts` - Fonction `getBanners()` mise à jour pour utiliser Firebase
- ✅ `/.npmrc` - Ajout de `legacy-peer-deps=true` pour résoudre les conflits de dépendances
- ✅ `/package.json` - Retrait de la dépendance Supabase
- ✅ `/.env` - Retrait des variables Supabase
- ✅ `/app.json` - Retrait des variables Supabase de la section `extra`

### 4. Fichiers créés
- ✅ `/FIREBASE_BANNERS_SETUP.md` - Instructions détaillées pour configurer les bannières dans Firebase

## Prochaines étapes

### Pour voir les bannières dans l'application:
1. Suivez les instructions dans `FIREBASE_BANNERS_SETUP.md`
2. Créez la collection `banners_final` dans Firebase Firestore
3. Ajoutez les 3 bannières de test comme indiqué
4. Configurez les règles de sécurité Firestore
5. Lancez l'application

### Pour gérer les bannières depuis votre projet admin:
Vous pouvez maintenant interagir directement avec la collection Firebase Firestore `banners_final` depuis votre projet admin. Toutes les opérations CRUD (Create, Read, Update, Delete) fonctionneront directement avec Firebase.

## Avantages de cette migration

1. **Simplicité**: Une seule base de données (Firebase) au lieu de deux (Firebase + Supabase)
2. **Cohérence**: Toutes vos données sont maintenant dans Firebase
3. **Maintenance**: Plus facile à gérer depuis votre projet admin
4. **Performance**: Pas de dépendance externe supplémentaire
5. **Sécurité**: Règles de sécurité Firestore centralisées

## Structure de la collection banners_final

```typescript
{
  id: string;                 // Auto-généré par Firestore
  title: string;              // Titre de la bannière
  description: string;        // Description courte
  image: string;              // URL de l'image
  link: string;               // URL externe (peut être vide)
  order: number;              // Ordre d'affichage (1, 2, 3...)
  isActive: boolean;          // true/false
  createdAt: Timestamp;       // Date de création
}
```

## Design conservé

Le design des bannières reste exactement le même:
- Cards arrondies avec images en fond
- Overlay violet semi-transparent
- Titre et description en blanc
- Défilement horizontal
- Effet d'ombre avec couleur primaire

## Support

Si vous rencontrez des problèmes:
1. Vérifiez que la collection `banners_final` existe dans Firebase
2. Vérifiez que les règles de sécurité sont correctement configurées
3. Vérifiez que les bannières ont le champ `isActive: true`
4. Consultez les logs de la console pour plus de détails
