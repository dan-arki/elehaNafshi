#!/bin/bash

PROJECT_ID="eleha-nafchi-vvurlg"
API_KEY="AIzaSyAqEnl-7J76qu5eOMvQtvbhNlqEaMDfa2k"
BASE_URL="https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/banners_final?key=${API_KEY}"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)

echo "🌱 Creating banners in Firebase Firestore..."
echo "📍 Project: ${PROJECT_ID}"
echo "📦 Collection: banners_final"
echo ""

# Banner 1
echo "Creating Banner 1: Afrachat Hala..."
curl -X POST "${BASE_URL}" \
  -H 'Content-Type: application/json' \
  -d "{
    \"fields\": {
      \"title\": {\"stringValue\": \"Afrachat Hala\"},
      \"description\": {\"stringValue\": \"Nouveau cours disponible\"},
      \"image\": {\"stringValue\": \"https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2\"},
      \"link\": {\"stringValue\": \"https://example.com/cours\"},
      \"order\": {\"integerValue\": \"1\"},
      \"isActive\": {\"booleanValue\": true},
      \"createdAt\": {\"timestampValue\": \"${TIMESTAMP}\"}
    }
  }" -s > /dev/null

if [ $? -eq 0 ]; then
  echo "✅ Banner 1 created successfully"
else
  echo "❌ Failed to create Banner 1"
fi

sleep 1

# Banner 2
echo "Creating Banner 2: Événement spécial..."
curl -X POST "${BASE_URL}" \
  -H 'Content-Type: application/json' \
  -d "{
    \"fields\": {
      \"title\": {\"stringValue\": \"Événement spécial\"},
      \"description\": {\"stringValue\": \"Rejoignez-nous pour un moment unique\"},
      \"image\": {\"stringValue\": \"https://images.pexels.com/photos/18933245/pexels-photo-18933245/free-photo-of-lumiere-ville-rue-batiment.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2\"},
      \"link\": {\"stringValue\": \"https://example.com/evenement\"},
      \"order\": {\"integerValue\": \"2\"},
      \"isActive\": {\"booleanValue\": true},
      \"createdAt\": {\"timestampValue\": \"${TIMESTAMP}\"}
    }
  }" -s > /dev/null

if [ $? -eq 0 ]; then
  echo "✅ Banner 2 created successfully"
else
  echo "❌ Failed to create Banner 2"
fi

sleep 1

# Banner 3
echo "Creating Banner 3: Mise à jour importante..."
curl -X POST "${BASE_URL}" \
  -H 'Content-Type: application/json' \
  -d "{
    \"fields\": {
      \"title\": {\"stringValue\": \"Mise à jour importante\"},
      \"description\": {\"stringValue\": \"Découvrez les nouvelles fonctionnalités\"},
      \"image\": {\"stringValue\": \"https://images.pexels.com/photos/7034354/pexels-photo-7034354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2\"},
      \"link\": {\"stringValue\": \"\"},
      \"order\": {\"integerValue\": \"3\"},
      \"isActive\": {\"booleanValue\": true},
      \"createdAt\": {\"timestampValue\": \"${TIMESTAMP}\"}
    }
  }" -s > /dev/null

if [ $? -eq 0 ]; then
  echo "✅ Banner 3 created successfully"
else
  echo "❌ Failed to create Banner 3"
fi

echo ""
echo "🎉 All banners created!"
echo ""
echo "📝 Next steps:"
echo "1. Configure Firestore security rules (see CREATE_BANNERS_MANUALLY.md)"
echo "2. Launch your app to see the banners"
echo "3. Banners will appear between 'Les kivrei tsadikim' and 'Mes essentiels'"
