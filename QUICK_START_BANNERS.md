# 🚀 Guide rapide: Créer les bannières dans Firebase

## ✅ Ce qui a été fait

1. ✅ Migration complète de Supabase vers Firebase
2. ✅ Suppression de toutes les dépendances Supabase
3. ✅ Modification du code pour utiliser Firebase Firestore
4. ✅ Les bannières s'affichent entre "Les kivrei tsadikim" et "Mes essentiels"
5. ✅ Le design est conservé (cards violettes avec overlay)

## 🎯 Ce qu'il reste à faire

### Créer les 3 bannières dans Firebase

Vous avez **3 options**:

---

### Option 1: Console Firebase (⭐ RECOMMANDÉ - Le plus simple)

1. Ouvrez https://console.firebase.google.com/
2. Projet: `eleha-nafchi-vvurlg`
3. Cliquez sur "Firestore Database"
4. Créez une collection nommée `banners_final`
5. Ajoutez 3 documents avec ces données:

#### 📌 Document 1
- **title**: `Afrachat Hala`
- **description**: `Nouveau cours disponible`
- **image**: `https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`
- **link**: `https://example.com/cours`
- **order**: `1` (nombre)
- **isActive**: `true` (booléen)
- **createdAt**: [Date actuelle] (timestamp)

#### 📌 Document 2
- **title**: `Événement spécial`
- **description**: `Rejoignez-nous pour un moment unique`
- **image**: `https://images.pexels.com/photos/18933245/pexels-photo-18933245/free-photo-of-lumiere-ville-rue-batiment.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`
- **link**: `https://example.com/evenement`
- **order**: `2` (nombre)
- **isActive**: `true` (booléen)
- **createdAt**: [Date actuelle] (timestamp)

#### 📌 Document 3
- **title**: `Mise à jour importante`
- **description**: `Découvrez les nouvelles fonctionnalités`
- **image**: `https://images.pexels.com/photos/7034354/pexels-photo-7034354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`
- **link**: `` (laisser vide)
- **order**: `3` (nombre)
- **isActive**: `true` (booléen)
- **createdAt**: [Date actuelle] (timestamp)

---

### Option 2: Script Shell (Terminal)

```bash
cd /tmp/cc-agent/52659686/project
chmod +x scripts/create-banners.sh
./scripts/create-banners.sh
```

---

### Option 3: Commandes CURL individuelles

Copiez-collez ces 3 commandes dans votre terminal:

```bash
# Bannière 1
curl -X POST 'https://firestore.googleapis.com/v1/projects/eleha-nafchi-vvurlg/databases/(default)/documents/banners_final?key=AIzaSyAqEnl-7J76qu5eOMvQtvbhNlqEaMDfa2k' \
  -H 'Content-Type: application/json' \
  -d '{"fields":{"title":{"stringValue":"Afrachat Hala"},"description":{"stringValue":"Nouveau cours disponible"},"image":{"stringValue":"https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"},"link":{"stringValue":"https://example.com/cours"},"order":{"integerValue":"1"},"isActive":{"booleanValue":true},"createdAt":{"timestampValue":"2025-10-05T21:00:00.000Z"}}}'

# Bannière 2
curl -X POST 'https://firestore.googleapis.com/v1/projects/eleha-nafchi-vvurlg/databases/(default)/documents/banners_final?key=AIzaSyAqEnl-7J76qu5eOMvQtvbhNlqEaMDfa2k' \
  -H 'Content-Type: application/json' \
  -d '{"fields":{"title":{"stringValue":"Événement spécial"},"description":{"stringValue":"Rejoignez-nous pour un moment unique"},"image":{"stringValue":"https://images.pexels.com/photos/18933245/pexels-photo-18933245/free-photo-of-lumiere-ville-rue-batiment.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"},"link":{"stringValue":"https://example.com/evenement"},"order":{"integerValue":"2"},"isActive":{"booleanValue":true},"createdAt":{"timestampValue":"2025-10-05T21:00:00.000Z"}}}'

# Bannière 3
curl -X POST 'https://firestore.googleapis.com/v1/projects/eleha-nafchi-vvurlg/databases/(default)/documents/banners_final?key=AIzaSyAqEnl-7J76qu5eOMvQtvbhNlqEaMDfa2k' \
  -H 'Content-Type: application/json' \
  -d '{"fields":{"title":{"stringValue":"Mise à jour importante"},"description":{"stringValue":"Découvrez les nouvelles fonctionnalités"},"image":{"stringValue":"https://images.pexels.com/photos/7034354/pexels-photo-7034354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"},"link":{"stringValue":""},"order":{"integerValue":"3"},"isActive":{"booleanValue":true},"createdAt":{"timestampValue":"2025-10-05T21:00:00.000Z"}}}'
```

---

## 🔒 Règles de sécurité Firestore

Après avoir créé les bannières, ajoutez ces règles dans Firebase Console > Firestore Database > Règles:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bannières - Lecture publique
    match /banners_final/{bannerId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 🎨 Design des bannières

Les bannières apparaîtront avec:
- ✅ Cards arrondies (16px de border-radius)
- ✅ Dimensions: 280px × 200px
- ✅ Overlay violet semi-transparent en bas
- ✅ Titre en blanc gras avec ombre
- ✅ Description en blanc
- ✅ Défilement horizontal
- ✅ Ombre portée avec couleur primaire

## 📍 Emplacement dans l'app

```
┌─────────────────────────────┐
│   Barre de recherche        │
├─────────────────────────────┤
│   Les kivrei tsadikim       │
├─────────────────────────────┤
│   🎯 BANNIÈRES (ici!)       │ ← Les 3 bannières s'affichent ici
├─────────────────────────────┤
│   Mes essentiels            │
├─────────────────────────────┤
│   Mes prières favorites     │
└─────────────────────────────┘
```

## ✅ Vérification

Après avoir créé les bannières:

1. Lancez votre application
2. Les bannières devraient apparaître automatiquement
3. Vous devriez voir 3 bannières qui défilent horizontalement
4. Les bannières avec un lien sont cliquables

## 📱 Gestion depuis votre admin

Une fois les bannières créées, vous pourrez les gérer depuis votre projet admin en interagissant directement avec la collection `banners_final` dans Firebase.

## 🆘 En cas de problème

1. Vérifiez que la collection `banners_final` existe
2. Vérifiez que les bannières ont `isActive: true`
3. Vérifiez les règles de sécurité Firestore
4. Consultez les logs de l'application dans la console
