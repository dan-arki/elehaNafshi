# Configuration des bannières Firebase

## Instructions pour créer la collection `banners_final` dans Firebase Firestore

### Étape 1: Accéder à la console Firebase
1. Ouvrez la [console Firebase](https://console.firebase.google.com/)
2. Sélectionnez votre projet `eleha-nafchi-vvurlg`
3. Cliquez sur **Firestore Database** dans le menu latéral

### Étape 2: Créer la collection
1. Cliquez sur **Commencer une collection**
2. Nom de la collection: `banners_final`

### Étape 3: Ajouter les bannières de test

Créez 3 documents avec les données suivantes:

#### Bannière 1: Afrachat Hala
```
Document ID: (auto-généré)

Champs:
- title (string): "Afrachat Hala"
- description (string): "Nouveau cours disponible"
- image (string): "https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
- link (string): "https://example.com/cours"
- order (number): 1
- isActive (boolean): true
- createdAt (timestamp): (utilisez "Date et heure" et sélectionnez la date actuelle)
```

#### Bannière 2: Événement spécial
```
Document ID: (auto-généré)

Champs:
- title (string): "Événement spécial"
- description (string): "Rejoignez-nous pour un moment unique"
- image (string): "https://images.pexels.com/photos/18933245/pexels-photo-18933245/free-photo-of-lumiere-ville-rue-batiment.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
- link (string): "https://example.com/evenement"
- order (number): 2
- isActive (boolean): true
- createdAt (timestamp): (utilisez "Date et heure" et sélectionnez la date actuelle)
```

#### Bannière 3: Mise à jour importante
```
Document ID: (auto-généré)

Champs:
- title (string): "Mise à jour importante"
- description (string): "Découvrez les nouvelles fonctionnalités"
- image (string): "https://images.pexels.com/photos/7034354/pexels-photo-7034354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
- link (string): ""
- order (number): 3
- isActive (boolean): true
- createdAt (timestamp): (utilisez "Date et heure" et sélectionnez la date actuelle)
```

### Étape 4: Configurer les règles de sécurité Firestore

Ajoutez cette règle pour la collection `banners_final`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règle pour les bannières - lecture publique
    match /banners_final/{bannerId} {
      allow read: if true;  // Lecture publique pour tous
      allow write: if false;  // Écriture uniquement via la console ou votre admin
    }
  }
}
```

### Étape 5: Vérifier l'affichage

Une fois les bannières créées:
1. Lancez votre application
2. Les bannières devraient s'afficher sur l'écran d'accueil
3. Vérifiez que les bannières défilent horizontalement
4. Testez les liens en cliquant sur les bannières

## Structure des données

### Champs obligatoires:
- `title` (string): Titre de la bannière
- `description` (string): Description courte
- `image` (string): URL complète de l'image
- `order` (number): Ordre d'affichage (1, 2, 3...)
- `isActive` (boolean): Statut actif/inactif
- `createdAt` (timestamp): Date de création

### Champs optionnels:
- `link` (string): URL externe (peut être vide)

## Gestion depuis votre projet admin

Depuis votre projet admin, vous pouvez maintenant:
- Créer de nouvelles bannières
- Modifier les bannières existantes
- Désactiver des bannières (mettre `isActive` à `false`)
- Réorganiser l'ordre des bannières
- Supprimer des bannières

## Notes importantes

1. **Images**: Utilisez des images de haute qualité (min 1260x750px)
2. **Ordre**: Les bannières s'affichent selon le champ `order` (ordre croissant)
3. **Activation**: Seules les bannières avec `isActive: true` s'affichent
4. **Liens**: Si le champ `link` est vide, la bannière n'est pas cliquable
5. **Performance**: Les images sont chargées depuis des URLs externes (Pexels)

## Design actuel

Les bannières utilisent le design suivant:
- Cards arrondies (borderRadius: 16)
- Hauteur: 200px, Largeur: 280px
- Overlay violet semi-transparent en bas
- Titre en gras blanc avec ombre
- Description en blanc avec opacité 0.95
- Ombre portée avec couleur primaire
- Défilement horizontal avec espacement de 16px
