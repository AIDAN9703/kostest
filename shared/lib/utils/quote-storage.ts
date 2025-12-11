import fs from 'fs';
import path from 'path';

// Use filesystem for temporary storage (replace with database later)
const STORAGE_DIR = path.join(process.cwd(), '.tmp', 'quotes');

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export const quotesStorage = {
  set: (id: string, data: any) => {
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  },
  
  get: (id: string) => {
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  },
  
  has: (id: string) => {
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    return fs.existsSync(filePath);
  },
  
  delete: (id: string) => {
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  },
  
  size: () => {
    if (!fs.existsSync(STORAGE_DIR)) return 0;
    return fs.readdirSync(STORAGE_DIR).filter(file => file.endsWith('.json')).length;
  },
  
  keys: () => {
    if (!fs.existsSync(STORAGE_DIR)) return [];
    return fs.readdirSync(STORAGE_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }
}; 