import { Prayer, PrayerChapter, Kever } from '../types';

export const mockPrayers: Prayer[] = [
  {
    id: '1',
    title: 'Modeh Ani',
    subtitle: 'Première prière du matin',
    category: 'chaharit',
    content: {
      hebrew: 'מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם, שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה; רַבָּה אֱמוּנָתֶךָ׃',
      french: 'Je te rends grâce, Roi vivant et éternel, de ce que tu m\'as rendu mon âme avec miséricorde ; grande est ta fidélité.',
      phonetic: 'Modé ani léfanékha mélékh \'haï vékayam, chéhé\'hézarta bi nichmati bé\'hémla, raba émounatékha.'
    },
    isFavorite: false,
    isCustom: false,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Chema Israël',
    subtitle: 'Déclaration de foi',
    category: 'kriat-chema',
    content: {
      hebrew: 'שְׁמַע יִשְׂרָאֵל, יְהוָה אֱלֹהֵינוּ יְהוָה אֶחָד׃',
      french: 'Écoute Israël, l\'Éternel notre Dieu, l\'Éternel est Un.',
      phonetic: 'Chéma Yisraël Adonaï Elohénou Adonaï é\'had.'
    },
    isFavorite: true,
    isCustom: false,
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Birkot hachah\'ar',
    subtitle: 'Bénédictions du matin',
    category: 'chaharit',
    content: {
      hebrew: 'בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר נָתַן לַשֶּׂכְוִי בִינָה לְהַבְחִין בֵּין יוֹם וּבֵין לָיְלָה׃',
      french: 'Béni sois-Tu, Éternel notre Dieu, Roi de l\'univers, qui as donné au coq l\'intelligence de distinguer entre le jour et la nuit.',
      phonetic: 'Baroukh ata Adonaï Elohénou mélékh ha\'olam achér natan lassekhvi bina léhavhin bén yom ouvén laïla.'
    },
    isFavorite: false,
    isCustom: false,
    createdAt: new Date(),
  },
  {
    id: '4',
    title: 'Adone olam',
    subtitle: 'Maître du monde',
    category: 'chaharit',
    content: {
      hebrew: 'אֲדוֹן עוֹלָם אֲשֶׁר מָלַךְ, בְּטֶרֶם כָּל יְצִיר נִבְרָא׃ לְעֵת נַעֲשָׂה בְחֶפְצוֹ כֹל, אֲזַי מֶלֶךְ שְׁמוֹ נִקְרָא׃',
      french: 'Maître du monde qui a régné avant que toute créature ne soit créée, au moment où tout fut fait selon Sa volonté, alors Son nom fut proclamé Roi.',
      phonetic: 'Adon olam achér malakh bétérém kol yétsir nivra, lé\'ét na\'assa békhéftso kol azaï mélékh chémo nikra.'
    },
    isFavorite: false,
    isCustom: false,
    createdAt: new Date(),
  },
  {
    id: '5',
    title: 'Ana békkoah',
    subtitle: 'Prière mystique',
    category: 'chaharit',
    content: {
      hebrew: 'אָנָּא בְּכֹחַ גְּדֻלַּת יְמִינְךָ תַּתִּיר צְרוּרָה׃ קַבֵּל רִנַּת עַמְּךָ שַׂגְּבֵנוּ טַהֲרֵנוּ נוֹרָא׃',
      french: 'De grâce, par la force de Ta main droite, délie ce qui est lié. Reçois le chant de Ton peuple, élève-nous, purifie-nous, ô Redoutable.',
      phonetic: 'Ana békkoah gdoulat yéminkha tatir tsroura, kabél rinat améka sagvénou tahrénou nora.'
    },
    isFavorite: true,
    isCustom: false,
    createdAt: new Date(),
  },
];

export const mockChapters: PrayerChapter[] = [
  {
    id: '1',
    title: 'Chaharit',
    subtitle: 'Prière du matin',
    prayers: [
      mockPrayers[0], // Modeh Ani
      mockPrayers[2], // Birkot hachah'ar
      mockPrayers[3], // Adone olam
      mockPrayers[4], // Ana békkoah
    ],
    order: 1,
  },
  {
    id: '2',
    title: 'Minha',
    subtitle: 'Prière de l\'après midi',
    prayers: [],
    order: 2,
  },
  {
    id: '3',
    title: 'Arvit',
    subtitle: 'Prière du soir',
    prayers: [],
    order: 3,
  },
  {
    id: '4',
    title: 'Kriat Chéma a\'l amita',
    subtitle: 'Au coucher',
    prayers: mockPrayers.filter(p => p.category === 'kriat-chema'),
    order: 4,
  },
  {
    id: '5',
    title: 'Brah\'ot',
    subtitle: 'Diverses',
    prayers: [],
    order: 5,
  },
  {
    id: '6',
    title: 'Tfilot supplémentaires',
    subtitle: 'En plus',
    prayers: [],
    order: 6,
  },
  {
    id: '7',
    title: 'Ségoulot',
    subtitle: '',
    prayers: [],
    order: 7,
  },
];

export const mockKevarim: Kever[] = [
  {
    id: '1',
    name: 'Rabbi Shimon Bar Yochai',
    location: {
      latitude: 32.9717,
      longitude: 35.4439,
    },
    address: 'Méron, Israël',
    description: 'Auteur du Zohar',
  },
  {
    id: '2',
    name: 'Rachel Iménou',
    location: {
      latitude: 31.7054,
      longitude: 35.2124,
    },
    address: 'Bethléem, Israël',
    description: 'Matriarche du peuple juif',
  },
];