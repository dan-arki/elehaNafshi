const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAqEnl-7J76qu5eOMvQtvbhNlqEaMDfa2k",
  authDomain: "eleha-nafchi-vvurlg.firebaseapp.com",
  projectId: "eleha-nafchi-vvurlg",
  storageBucket: "eleha-nafchi-vvurlg.firebasestorage.app",
  messagingSenderId: "73969167414",
  appId: "1:73969167414:web:9ad4ded7cf5f408a187c97"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const banners = [
  {
    title: "Afrachat Hala",
    description: "Nouveau cours disponible",
    image: "https://images.pexels.com/photos/8535230/pexels-photo-8535230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "https://example.com/cours",
    order: 1,
    isActive: true,
    createdAt: Timestamp.now()
  },
  {
    title: "Événement spécial",
    description: "Rejoignez-nous pour un moment unique",
    image: "https://images.pexels.com/photos/18933245/pexels-photo-18933245/free-photo-of-lumiere-ville-rue-batiment.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "https://example.com/evenement",
    order: 2,
    isActive: true,
    createdAt: Timestamp.now()
  },
  {
    title: "Mise à jour importante",
    description: "Découvrez les nouvelles fonctionnalités",
    image: "https://images.pexels.com/photos/7034354/pexels-photo-7034354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "",
    order: 3,
    isActive: true,
    createdAt: Timestamp.now()
  }
];

async function seedBanners() {
  console.log('🌱 Seeding banners to Firebase Firestore...');

  try {
    const bannersRef = collection(db, 'banners_final');

    for (const banner of banners) {
      const docRef = await addDoc(bannersRef, banner);
      console.log(`✅ Banner added with ID: ${docRef.id} - ${banner.title}`);
    }

    console.log('🎉 All banners seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding banners:', error);
    process.exit(1);
  }
}

seedBanners();
