const axios = require('axios');
const fs = require('fs');

const IMAGEKIT_PRIVATE_API_KEY = 'private_4hzWjPLT3JcaqzIOE3tTozcrPHM=';
const IMAGEKIT_ACCOUNT_URL = 'https://ik.imagekit.io/eslh5kg8z';
const BOATS_FOLDER = '/Boats';

const folders = [
  "2021 29ft HD8",
  "20ft Bennington",
  "25ft Sportsman Center Console",
  "26ft Barletta Pontoon",
  "26ft Mastercraft Wakesports",
  "26ft Monterey",
  "27ft Double Deck Pontoon w- Slide",
  "30ft Pontoon w- Slide",
  "35ft Mackenzie ",
  "35ft Sea Ray SLX - 13 people (Venetian Marina)",
  "36ft 2024 NX - 12 people",
  "38ft Axopar (2025)",
  "40ft 2023 Schaefer - 13 people (Venetian Marina)",
  "40ft Azimut",
  "40ft Fjord",
  "42 De Antonio ",
  "42FT SAXDOR GTO 2025 ",
  "42ft Azimut Verve",
  "42ft Boston",
  "45ft 2022 Galeon - 13 people (Miami River)",
  "45ft Regal",
  "48ft Silverton Sport Bridge ",
  "50ft Azimut - 13 people (Miami Beach Marina)",
  "50ft Carver Silverton",
  "50ft Cruiser ",
  "50ft Sea Ray - 13 people (Chamonix Marina)",
  "50ft Sea Ray Sedan Bridge",
  "50ft Sea Ray Sundancer",
  "50ft Sunseeker",
  "52 Searay",
  "52ft 2020 Azimut (Julia Valentine)",
  "53ft 2022 Galeon - 13 people (Miami)",
  "55ft Hatteras Sport Fishing Yacht - 6 people (North Miami)",
  "57ft Azimut - 13 people (Miami Beach Marina)",
  "58ft Sea Ray - 13 people (Isla Del Mar)",
  "60_ Absolute ",
  "60ft Azimut w- Flybridge Supreme I",
  "60ft Princess ",
  "60ft Sea Ray Flybridge - Epic II",
  "61ft Viking Sport Fishing Yacht",
  "62ft Beneteau",
  "62ft Explorer - 13 people (Bayside Marina)",
  "65ft Sea Ray w- Jacuzzi - 13 people (Fontainebleau)",
  "65ft Sunseeker - 13 people (Bayside Marina)",
  "66ft Astondoa 2024 Flybridge",
  "68ft Luxury Azimut",
  "70ft Sportfish",
  "70ft Sunseeker",
  "72ft Uniesse",
  "74ft Sunseeker Predator (2023)",
  "78ft Sunseeker (2019)",
  "80 Riva ",
  "80 Sunseeker  ",
  "80ft Numarine w- Jacuzzi",
  "80ft Sunseeker",
  "BOSTON WHALER 420 OUTRAGE 1800HP ",
  "DOUBLE DECKER 27 300HP ",
  "PARDO 38 TRIPLE 300_S ",
  "Sea Ray 52_",
  "Sweet Thing Viking Princess 70ft",
  "WARRIOR II"
];

async function fetchAllBoatImages() {
  const results = [];

  for (const folder of folders) {
    try {
      const response = await axios.get('https://api.imagekit.io/v1/files', {
        auth: { username: IMAGEKIT_PRIVATE_API_KEY, password: '' },
        params: { path: `${BOATS_FOLDER}/${folder}` }
      });

      // Filter images only (exclude .json and other non-images)
      const images = response.data
        .filter(file => file.type === 'file' && file.fileType === 'image')
        .map(file => file.url);

      if (images.length === 0) {
        console.warn(`⚠️ No images found in folder: ${folder}`);
        continue;
      }

      results.push({
        folder,
        display_title: folder,
        images
      });

      console.log(`✅ Found ${images.length} images for "${folder}"`);

    } catch (err) {
      console.error(`❌ Error fetching ${folder}:`, err.message);
    }
  }

  fs.writeFileSync('boat_images.json', JSON.stringify(results, null, 2));
  console.log('\n🚀 Done! Image URLs saved to boat_images.json');
}

fetchAllBoatImages();
