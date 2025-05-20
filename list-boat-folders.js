const axios = require('axios');
const fs = require('fs');

const IMAGEKIT_PRIVATE_API_KEY = 'private_4hzWjPLT3JcaqzIOE3tTozcrPHM=';
const API_URL = 'https://api.imagekit.io/v1/files';

async function fetchAllBoatFolders() {
  let skip = 0;
  const limit = 100;
  const allFilePaths = [];

  while (true) {
    const res = await axios.get(API_URL, {
      auth: { username: IMAGEKIT_PRIVATE_API_KEY, password: '' },
      params: { limit, skip }
    });

    if (!res.data.length) break;

    const filePaths = res.data.map(f => f.filePath).filter(Boolean);
    allFilePaths.push(...filePaths);
    skip += limit;
  }

  // Extract first-level folder names inside '/Boats'
  const folderSet = new Set();

  for (const path of allFilePaths) {
    const parts = path.split('/');

    if (parts[1] === 'Boats' && parts.length > 2) {
      folderSet.add(parts[2]); // grab the folder inside /Boats/
    }
  }

  const folders = Array.from(folderSet).sort();
  fs.writeFileSync('boat_folder_list.json', JSON.stringify(folders, null, 2));
  console.log(`✅ Found ${folders.length} folders:\n`, folders);
}

fetchAllBoatFolders().catch(err => {
  console.error('❌ Error:', err.message);
});
