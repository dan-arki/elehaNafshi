const https = require('https');

const projectId = 'eleha-nafchi-vvurlg';
const apiKey = 'AIzaSyAqEnl-7J76qu5eOMvQtvbhNlqEaMDfa2k';

const banners = [
  {
    fields: {
      title: { stringValue: "Afrachat Hala" },
      description: { stringValue: "Nouveau cours disponible" },
      image: { stringValue: "https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
      link: { stringValue: "https://example.com/cours" },
      order: { integerValue: "1" },
      isActive: { booleanValue: true },
      createdAt: { timestampValue: new Date().toISOString() }
    }
  },
  {
    fields: {
      title: { stringValue: "Événement spécial" },
      description: { stringValue: "Rejoignez-nous pour un moment unique" },
      image: { stringValue: "https://images.pexels.com/photos/18933245/pexels-photo-18933245/free-photo-of-lumiere-ville-rue-batiment.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
      link: { stringValue: "https://example.com/evenement" },
      order: { integerValue: "2" },
      isActive: { booleanValue: true },
      createdAt: { timestampValue: new Date().toISOString() }
    }
  },
  {
    fields: {
      title: { stringValue: "Mise à jour importante" },
      description: { stringValue: "Découvrez les nouvelles fonctionnalités" },
      image: { stringValue: "https://images.pexels.com/photos/7034354/pexels-photo-7034354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
      link: { stringValue: "" },
      order: { integerValue: "3" },
      isActive: { booleanValue: true },
      createdAt: { timestampValue: new Date().toISOString() }
    }
  }
];

function createBanner(banner, index) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(banner);

    const options = {
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: `/v1/projects/${projectId}/databases/(default)/documents/banners_final?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Banner ${index + 1} created: ${banner.fields.title.stringValue}`);
          resolve(responseData);
        } else {
          console.error(`❌ Error creating banner ${index + 1}: ${res.statusCode}`);
          console.error('Response:', responseData);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error for banner ${index + 1}:`, error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function seedBanners() {
  console.log('🌱 Seeding banners to Firebase Firestore via REST API...');
  console.log(`📍 Project: ${projectId}`);
  console.log(`📦 Collection: banners_final`);
  console.log(`📊 Number of banners: ${banners.length}\n`);

  try {
    for (let i = 0; i < banners.length; i++) {
      await createBanner(banners[i], i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 All banners seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding banners:', error.message);
    process.exit(1);
  }
}

seedBanners();
