#!/usr/bin/env node

/**
 * ModaGlimmora Route Groups Migration Script
 * Reorganizes the app into Consumer and UHNI portals using Next.js route groups
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, 'src', 'app');

console.log('🚀 Starting ModaGlimmora Route Groups Migration...\n');

// Helper function to move directory
function moveDir(from, to) {
  const fromPath = path.join(APP_DIR, from);
  const toPath = path.join(APP_DIR, to);

  if (!fs.existsSync(fromPath)) {
    console.log(`  ⚠️  ${from} not found, skipping...`);
    return false;
  }

  try {
    // Create parent directory if it doesn't exist
    const toDir = path.dirname(toPath);
    if (!fs.existsSync(toDir)) {
      fs.mkdirSync(toDir, { recursive: true });
    }

    fs.renameSync(fromPath, toPath);
    console.log(`  ✓ Moved ${from} → ${to}`);
    return true;
  } catch (error) {
    console.log(`  ❌ Failed to move ${from}: ${error.message}`);
    return false;
  }
}

// Helper function to remove directory
function removeDir(dir) {
  const dirPath = path.join(APP_DIR, dir);

  if (!fs.existsSync(dirPath)) {
    console.log(`  ⚠️  ${dir} not found, skipping...`);
    return false;
  }

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`  ✓ Deleted ${dir}`);
    return true;
  } catch (error) {
    console.log(`  ❌ Failed to delete ${dir}: ${error.message}`);
    return false;
  }
}

// Helper to list directory contents
function listDir(dir) {
  const dirPath = path.join(APP_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs.readdirSync(dirPath);
}

// Step 1: Create route group folders
console.log('📁 Step 1: Creating route group folders...');
try {
  fs.mkdirSync(path.join(APP_DIR, '(consumer)'), { recursive: true });
  fs.mkdirSync(path.join(APP_DIR, '(uhni)', 'uhni'), { recursive: true });
  console.log('  ✓ Created (consumer)/');
  console.log('  ✓ Created (uhni)/uhni/');
} catch (error) {
  console.log(`  ❌ Failed to create folders: ${error.message}`);
  process.exit(1);
}
console.log('✅ Route group folders created\n');

// Step 2: Move consumer routes
console.log('📦 Step 2: Moving consumer routes into (consumer)/...');

// Move root page
moveDir('page.tsx', '(consumer)/page.tsx');

// Move consumer feature folders
const consumerFolders = [
  'discover',
  'product',
  'collection',
  'checkout',
  'wardrobe',
  'consideration',
  'outfit-builder',
  'calendar',
  'search',
  'stories',
  'story',
  'profile'
];

consumerFolders.forEach(folder => {
  moveDir(folder, `(consumer)/${folder}`);
});

console.log('✅ Consumer routes moved\n');

// Step 3: Move UHNI routes from consumer profile to uhni
console.log('🔷 Step 3: Moving UHNI-exclusive routes to (uhni)/uhni/...');

const uhniRoutes = [
  'concierge',
  'autonomous',
  'sourcing',
  'bespoke',
  'intelligence'
];

uhniRoutes.forEach(route => {
  moveDir(`(consumer)/profile/${route}`, `(uhni)/uhni/${route}`);
});

console.log('✅ UHNI routes moved\n');

// Step 4: Delete admin and brand login pages
console.log('🗑️  Step 4: Deleting admin and brand login pages...');
removeDir('auth/login/admin');
removeDir('auth/login/brand');
console.log('✅ Old login pages removed\n');

// Step 5: Show final structure
console.log('📊 Step 5: Final structure:\n');

console.log('src/app/');
console.log('├── (consumer)/           # Consumer portal');
const consumerContents = listDir('(consumer)');
consumerContents.forEach(item => {
  console.log(`│   ├── ${item}`);
});

console.log('│');
console.log('├── (uhni)/              # UHNI portal');
console.log('│   └── uhni/');
const uhniContents = listDir('(uhni)/uhni');
uhniContents.forEach(item => {
  console.log(`│       ├── ${item}`);
});

console.log('│');
console.log('├── auth/                # Shared authentication');
console.log('├── onboarding/          # Shared onboarding');
console.log('└── layout.tsx           # Root layout');

console.log('\n✨ Migration complete!\n');
console.log('⚠️  IMPORTANT NEXT STEPS:');
console.log('1. Create layout files for each portal');
console.log('2. Update all links from /profile/concierge → /uhni/concierge');
console.log('3. Update middleware.ts for new /uhni/* routes');
console.log('4. Run "npm run build" to test\n');
