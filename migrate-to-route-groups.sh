#!/bin/bash

# ModaGlimmora Route Groups Migration Script
# This script reorganizes the app into Consumer and UHNI portals using Next.js route groups

set -e  # Exit on any error

echo "🚀 Starting ModaGlimmora Route Groups Migration..."
echo ""

cd /Users/kavi/Baarez-Projects/Moda-Glimmora-new-v2/src/app

# Step 1: Create route group folders
echo "📁 Step 1: Creating route group folders..."
mkdir -p "(consumer)"
mkdir -p "(uhni)/uhni"
echo "✅ Route group folders created"
echo ""

# Step 2: Move consumer routes into (consumer)/
echo "📦 Step 2: Moving consumer routes into (consumer)/..."

# Move root consumer page
mv page.tsx "(consumer)/" 2>/dev/null || echo "⚠️  page.tsx already moved or doesn't exist"

# Move consumer feature folders
for folder in discover product collection checkout wardrobe consideration outfit-builder calendar search stories story; do
  if [ -d "$folder" ]; then
    mv "$folder" "(consumer)/"
    echo "  ✓ Moved $folder"
  else
    echo "  ⚠️  $folder not found"
  fi
done

# Move consumer profile folder
if [ -d "profile" ]; then
  # First, we need to separate UHNI routes from consumer routes in profile
  # We'll move the entire profile to consumer first, then extract UHNI routes
  mv profile "(consumer)/"
  echo "  ✓ Moved profile to (consumer)/"
else
  echo "  ⚠️  profile folder not found"
fi

echo "✅ Consumer routes moved"
echo ""

# Step 3: Extract UHNI routes from consumer profile
echo "🔷 Step 3: Moving UHNI-exclusive routes to (uhni)/uhni/..."

cd "(consumer)/profile"

# Move UHNI-exclusive routes
for uhni_route in concierge autonomous sourcing bespoke intelligence; do
  if [ -d "$uhni_route" ]; then
    mv "$uhni_route" "../../(uhni)/uhni/"
    echo "  ✓ Moved $uhni_route to /uhni/$uhni_route"
  else
    echo "  ⚠️  $uhni_route not found"
  fi
done

cd ../..  # Back to app root

echo "✅ UHNI routes moved"
echo ""

# Step 4: Delete admin and brand login pages
echo "🗑️  Step 4: Deleting admin and brand login pages..."
rm -rf auth/login/admin 2>/dev/null && echo "  ✓ Deleted auth/login/admin" || echo "  ⚠️  auth/login/admin not found"
rm -rf auth/login/brand 2>/dev/null && echo "  ✓ Deleted auth/login/brand" || echo "  ⚠️  auth/login/brand not found"
echo "✅ Old login pages removed"
echo ""

# Step 5: Show final structure
echo "📊 Step 5: Final structure preview..."
echo ""
echo "src/app/"
echo "├── (consumer)/           # Consumer portal (URLs: /, /discover, /product, etc.)"
ls -1 "(consumer)" 2>/dev/null | sed 's/^/│   ├── /' || echo "│   (empty)"
echo "│"
echo "├── (uhni)/              # UHNI portal"
echo "│   └── uhni/            # UHNI routes (URLs: /uhni/concierge, /uhni/autonomous, etc.)"
ls -1 "(uhni)/uhni" 2>/dev/null | sed 's/^/│       ├── /' || echo "│       (empty)"
echo "│"
echo "├── auth/                # Shared authentication"
echo "├── onboarding/          # Shared onboarding"
echo "└── layout.tsx           # Root layout"
echo ""

echo "✨ Migration complete!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Create layout files for each portal (I'll help with this)"
echo "2. Update all links from /profile/concierge → /uhni/concierge"
echo "3. Update middleware.ts for new /uhni/* routes"
echo "4. Run 'npm run build' to test"
echo ""
