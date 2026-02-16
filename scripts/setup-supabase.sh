#!/bin/bash
# ==============================================
# Supabase Migration Setup Script
# ย้ายจาก Lovable Supabase ไป project ใหม่
# ==============================================

set -e

PROJECT_ID="raqjbflqnnshgzsdmxiv"
OLD_PROJECT_ID="bnzfdmxqjjgbsytazaau"

echo "========================================="
echo "  Supabase Migration Setup"
echo "  Project: $PROJECT_ID"
echo "========================================="
echo ""

# 1. ตรวจสอบ Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "[!] Supabase CLI not found. Installing..."
    if command -v brew &> /dev/null; then
        brew install supabase/tap/supabase
    elif command -v npm &> /dev/null; then
        npx supabase --version
    else
        echo "[ERROR] Please install Supabase CLI first:"
        echo "  https://supabase.com/docs/guides/cli/getting-started"
        exit 1
    fi
fi

echo "[OK] Supabase CLI: $(supabase --version)"
echo ""

# 2. Login (ถ้ายังไม่ได้ login)
echo "[Step 1] Checking Supabase login..."
if ! supabase projects list &> /dev/null 2>&1; then
    echo "  Please login to Supabase:"
    supabase login
fi
echo "[OK] Logged in"
echo ""

# 3. Link project
echo "[Step 2] Linking project $PROJECT_ID..."
supabase link --project-ref "$PROJECT_ID"
echo "[OK] Project linked"
echo ""

# 4. Push migrations
echo "[Step 3] Pushing database migrations (20 files)..."
supabase db push
echo "[OK] Migrations applied"
echo ""

# 5. Deploy Edge Functions
echo "[Step 4] Deploying Edge Functions..."
FUNCTIONS=(
    "r2-storage"
    "generate-thumbnail"
    "zip-upload"
    "verify-recaptcha"
    "cleanup-orphan-files"
    "download-image"
    "migrate-to-r2"
)

for func in "${FUNCTIONS[@]}"; do
    echo "  Deploying $func..."
    supabase functions deploy "$func" --no-verify-jwt
    echo "  [OK] $func deployed"
done
echo "[OK] All Edge Functions deployed"
echo ""

# 6. ตั้ง secrets
echo "[Step 5] Setting Edge Function secrets..."
echo "  Please enter your Cloudflare R2 credentials:"
echo ""

read -p "  R2_BUCKET_NAME: " R2_BUCKET_NAME
read -p "  R2_PUBLIC_URL: " R2_PUBLIC_URL
read -p "  R2_ACCOUNT_ID: " R2_ACCOUNT_ID
read -p "  R2_ACCESS_KEY_ID: " R2_ACCESS_KEY_ID
read -s -p "  R2_SECRET_ACCESS_KEY: " R2_SECRET_ACCESS_KEY
echo ""

supabase secrets set \
    R2_BUCKET_NAME="$R2_BUCKET_NAME" \
    R2_PUBLIC_URL="$R2_PUBLIC_URL" \
    R2_ACCOUNT_ID="$R2_ACCOUNT_ID" \
    R2_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
    R2_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"

echo "[OK] Secrets configured"
echo ""

# 7. อัปเดต config files
echo "[Step 6] Updating config files..."

# อัปเดต supabase/config.toml
sed -i.bak "s/project_id = \"$OLD_PROJECT_ID\"/project_id = \"$PROJECT_ID\"/" supabase/config.toml
rm -f supabase/config.toml.bak
echo "  [OK] supabase/config.toml updated"

# อัปเดต .env (ถ้ายังชี้ไปที่ old project)
if grep -q "$OLD_PROJECT_ID" .env 2>/dev/null; then
    echo ""
    echo "  [!] .env still points to old project ($OLD_PROJECT_ID)"
    echo "  Please update .env manually with:"
    echo ""
    echo "    VITE_SUPABASE_PROJECT_ID=\"$PROJECT_ID\""
    echo "    VITE_SUPABASE_URL=\"https://$PROJECT_ID.supabase.co\""
    echo "    VITE_SUPABASE_PUBLISHABLE_KEY=\"<your-new-anon-key>\""
    echo ""
    echo "  Find your anon key at: https://supabase.com/dashboard/project/$PROJECT_ID/settings/api"
fi

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "  Next steps:"
echo "  1. Update .env with new credentials (if not done)"
echo "  2. Configure Google OAuth at Dashboard > Authentication > Providers"
echo "  3. Run: npm run dev"
echo "  4. Test login, CRUD, image upload"
echo ""
