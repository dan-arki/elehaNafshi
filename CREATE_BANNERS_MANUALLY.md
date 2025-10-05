# Création manuelle des bannières dans Firebase

## Option 1: Via la console Firebase (Recommandé)

1. **Accédez à la console Firebase:**
   - Ouvrez https://console.firebase.google.com/
   - Sélectionnez le projet `eleha-nafchi-vvurlg`

2. **Créez la collection:**
   - Cliquez sur "Firestore Database" dans le menu
   - Cliquez sur "Commencer une collection"
   - Nom: `banners_final`

3. **Ajoutez les 3 bannières:**

### Bannière 1
```
Cliquez sur "Ajouter un document"

Champs:
- title (string): Afrachat Hala
- description (string): Nouveau cours disponible
- image (string): https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2
- link (string): https://example.com/cours
- order (number): 1
- isActive (boolean): true
- createdAt (timestamp): [date actuelle]
```

### Bannière 2
```
Cliquez sur "Ajouter un document"

Champs:
- title (string): Événement spécial
- description (string): Rejoignez-nous pour un moment unique
- image (string): https://images.pexels.com/photos/18933245/pexels-photo-18933245/free-photo-of-lumiere-ville-rue-batiment.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2
- link (string): https://example.com/evenement
- order (number): 2
- isActive (boolean): true
- createdAt (timestamp): [date actuelle]
```

### Bannière 3
```
Cliquez sur "Ajouter un document"

Champs:
- title (string): Mise à jour importante
- description (string): Découvrez les nouvelles fonctionnalités
- image (string): https://images.pexels.com/photos/7034354/pexels-photo-7034354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2
- link (string): [laisser vide]
- order (number): 3
- isActive (boolean): true
- createdAt (timestamp): [date actuelle]
```

## Option 2: Via CURL (Terminal)

Exécutez ces commandes dans votre terminal:

### Bannière 1
```bash
curl -X POST \
  'https://firestore.googleapis.com/v1/projects/eleha-nafchi-vvurlg/databases/(default)/documents/banners_final?key=AIzaSyAqEnl-7J76qu5eOMvQtvbhNlqEaMDfa2k' \
  -H 'Content-Type: application/json' \
  -d '{
    "fields": {
      "title": {"stringValue": "Afrachat Hala"},
      "description": {"stringValue": "Nouveau cours disponible"},
      "image": {"stringValue": "https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"},
      "link": {"stringValue": "https://example.com/cours"},
      "order": {"integerValue": "1"},
      "isActive": {"booleanValue": true},
      "createdAt": {"timestampValue": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"}
    }
  }'
```

### Bannière 2
```bash
curl -X POST \
  'https://firestore.googleapis.com/v1/projects/eleha-nafchi-vvurlg/databases/(default)/documents/banners_final?key=AIzaSyAqEnl-7J76qu5eOMvQtvbhNlqEaMDfa2k' \
  -H 'Content-Type: application/json' \
  -d '{
    "fields": {
      "title": {"stringValue": "Événement spécial"},
      "description": {"stringValue": "Rejoignez-nous pour un moment unique"},
      "image": {"stringValue": "https://images.pexels.com/photos/18933245/pexels-photo-18933245/free-photo-of-lumiere-ville-rue-batiment.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"},
      "link": {"stringValue": "https://example.com/evenement"},
      "order": {"integerValue": "2"},
      "isActive": {"booleanValue": true},
      "createdAt": {"timestampValue": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"}
    }
  }'
```

### Bannière 3
```bash
curl -X POST \
  'https://firestore.googleapis.com/v1/projects/eleha-nafchi-vvurlg/databases/(default)/documents/banners_final?key=AIzaSyAqEnl-7J76qu5eOMvQtvbhNlqEaMDfa2k' \
  -H 'Content-Type: application/json' \
  -d '{
    "fields": {
      "title": {"stringValue": "Mise à jour importante"},
      "description": {"stringValue": "Découvrez les nouvelles fonctionnalités"},
      "image": {"stringValue": "https://images.pexels.com/photos/7034354/pexels-photo-7034354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"},
      "link": {"stringValue": ""},
      "order": {"integerValue": "3"},
      "isActive": {"booleanValue": true},
      "createdAt": {"timestampValue": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"}
    }
  }'
```

## Configurer les règles de sécurité

Dans Firebase Console > Firestore Database > Règles, ajoutez:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règle pour les bannières - lecture publique
    match /banners_final/{bannerId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Vérification

Après avoir créé les bannières:
1. Ouvrez votre application
2. Les bannières devraient apparaître au-dessus de la section "Mes essentiels"
3. Elles devraient défiler horizontalement
4. Le design devrait correspondre à votre capture d'écran

## Emplacement dans l'interface

Les bannières s'affichent:
- ✅ Après la section "Les kivrei tsadikim"
- ✅ **Avant** la section "Mes essentiels"
- ✅ Avec un défilement horizontal
- ✅ Cards de 280px de largeur et 200px de hauteur
