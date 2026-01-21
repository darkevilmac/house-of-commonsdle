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
const API_URL = "https://api.openparliament.ca/politicians/?format=json&limit=500";

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
  id: string;
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`Failed to fetch API: ${response.status} ${response.statusText}`);
    }
    const json = await response.json() as { objects: PoliticianAPI[] };
    allPoliticians = json.objects;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Re-throw to fail the build
  }

  console.log(`Found ${allPoliticians.length} members.`);

  const members: Member[] = [];
  const missingImages: string[] = [];

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(allPoliticians.length, 0);

  for (const pol of allPoliticians) {
    const fullName = pol.name;
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || ''; // Join the rest

    const partyName = pol.current_party.short_name.en;
    const partyCode = PARTY_MAPPING[partyName] || "IND";

    const remoteImageUrl = `https://api.openparliament.ca${pol.image}`;

    const filename = pol.image.split('/').pop() || `${firstName}_${lastName}.jpg`;
    const localImagePath = `images/mps/${filename}`;
    const fullLocalPath = join(IMAGE_DIR, filename);

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for images

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return false;
    const buffer = await res.arrayBuffer();
    writeFileSync(path, Buffer.from(buffer));
    return true;
  } catch {
    return false;
  }
}

if (import.meta.main) {
  fetchMembers().catch((err) => {
    console.error("Fetch failed:", err);
    process.exit(1);
  });
}
