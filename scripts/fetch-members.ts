import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cliProgress from 'cli-progress';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, '../src/data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'members.json');
const IMAGE_DIR = join(__dirname, '../public/images/mps');
const FAILED_LOG = join(OUTPUT_DIR, 'failed_images.json');
const API_URL = "https://api.openparliament.ca/politicians/?format=json&limit=500"; // limit=500 to get all

const PARTY_MAPPING: Record<string, string> = {
  "Liberal": "LPC",
  "Conservative": "CPC",
  "Bloc": "BQ",
  "NDP": "NDP",
  "Green": "GPC",
  "Independent": "IND"
};

// Interface for OpenParliament API Object
interface PoliticianAPI {
  name: string;
  url: string;
  current_party: {
    short_name: {
      en: string; // e.g., "Conservative", "Liberal"
    };
  };
  current_riding: {
    province: string;
    name: {
      en: string;
    };
  };
  image: string; // Relative path, e.g., "/media/polpics/..."
}

interface Member {
  id: string; // We'll derive this or use name as ID since API doesn't expose a clear integer ID in the list
  firstName: string;
  lastName: string;
  constituency: string;
  province: string;
  party: string;
  partyCode: string;
  imagePath: string;
}

// Load known failures to avoid retrying them
let knownFailures: string[] = [];
if (existsSync(FAILED_LOG)) {
  try {
    // This line assumes a Bun runtime environment due to `Bun.file`
    // If running in Node.js, this would need to be `readFileSync(FAILED_LOG, "utf-8")`
    knownFailures = JSON.parse(new TextDecoder().decode(await Bun.file(FAILED_LOG).arrayBuffer()));
  } catch {
    // ignore
  }
}

export async function fetchMembers() {
  console.log('Fetching members from OpenParliament API...');

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!existsSync(IMAGE_DIR)) mkdirSync(IMAGE_DIR, { recursive: true });

  let allPoliticians: PoliticianAPI[] = [];
  
  try {
    // The API uses pagination, but limit=500 should cover nearly everyone (338 seats).
    // We'll just fetch once for simplicity as the House is 338 members.
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch API: ${response.statusText}`);
    }
    const json = await response.json() as { objects: PoliticianAPI[] };
    allPoliticians = json.objects;
  } catch (error) {
    console.error("Error fetching data:", error);
    return;
  }

  console.log(`Found ${allPoliticians.length} members.`);

  const members: Member[] = [];
  const missingImages: string[] = [];

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(allPoliticians.length, 0);

  for (const pol of allPoliticians) {
    const fullName = pol.name;
    // Split name strictly by first space to guess First/Last. 
    // This is imperfect (e.g. "Jean-Yves Duclos"), but sufficient for display.
    // Actually, OpenParliament gives "Ziad Aboultaif". 
    // We'll assume everything after first space is last name, or just use full name field if we change frontend?
    // Frontend expects firstName and lastName.
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' '); // Join the rest

    const partyName = pol.current_party.short_name.en;
    const partyCode = PARTY_MAPPING[partyName] || "IND"; // Default to IND if unknown

    // Image URL
    // API returns "/media/polpics/filename.jpg"
    // We need to prepend domain. "https://api.openparliament.ca" likely works.
    const remoteImageUrl = `https://api.openparliament.ca${pol.image}`;
    
    // Local filename
    // We'll use the basename of the remote image for simplicity and uniqueness
    const filename = pol.image.split('/').pop() || `${firstName}_${lastName}.jpg`;
    const localImagePath = `/images/mps/${filename}`;
    const fullLocalPath = join(IMAGE_DIR, filename);

    // Download Logic
    // Only download if missing logic
    if (!existsSync(fullLocalPath)) {
        // Check if known failure
        if (!knownFailures.includes(remoteImageUrl)) {
            const success = await downloadImage(remoteImageUrl, fullLocalPath);
            if (!success) {
                missingImages.push(remoteImageUrl);
            }
        } else {
            // Already known to fail
             missingImages.push(remoteImageUrl);
        }
    }

    members.push({
      id: fullName, // Use Name as ID for now or a slug
      firstName: firstName,
      lastName: lastName,
      constituency: pol.current_riding.name.en,
      province: pol.current_riding.province,
      party: partyName,
      partyCode: partyCode,
      imagePath: localImagePath
    });

    bar.increment();
  }

  bar.stop();

  writeFileSync(OUTPUT_FILE, JSON.stringify(members, null, 2));
  writeFileSync(FAILED_LOG, JSON.stringify(missingImages, null, 2));

  console.log(`\nSaved ${members.length} members to ${OUTPUT_FILE}`);

  if (missingImages.length > 0) {
      console.log(`\n⚠️  Missing Images (${missingImages.length}) - See ${FAILED_LOG} for details`);
  } else {
      console.log("\n✅ All images downloaded successfully.");
  }
}

async function downloadImage(url: string, path: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = await res.arrayBuffer();
    writeFileSync(path, Buffer.from(buffer));
    return true;
  } catch {
    return false;
  }
}

if (import.meta.main) {
  fetchMembers().catch(console.error);
}
