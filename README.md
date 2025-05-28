
# commegix

An all-in-one e-commerce & dropshipping automation platform.

## Features

- Multi-platform integration (Shopify, Mirakl)
- Product management and synchronization
- Order processing and fulfillment
- Shipping automation with Chita and DHL
- Usage-based and subscription billing with Stripe

## Tech Stack

- **Frontend**: Next.js 14 (React, TypeScript, App Router), Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments**: Stripe (Checkout, Metered billing)
- **Deployment**: Vercel (frontend), Supabase cloud (backend)

## Project Structure

```
/
 ├─ apps/
 │   └─ web/          # Next.js project (TypeScript)
 ├─ supabase/
 │   ├─ migrations/   # SQL files for schema
 │   └─ functions/    # Edge Functions (TypeScript)
 ├─ .env.example      # env variable template
 └─ package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm or npm
- Supabase account
- Stripe account
- Shopify Partner account (for app development)
- Mirakl, Chita, and DHL accounts (for full functionality)

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/commegix.git
   cd commegix
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Copy the `.env.example` file to `.env.local` and fill in your environment variables
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

### Database Setup

1. Link your Supabase project
   ```bash
   supabase link --project-ref your-project-ref
   ```

2. Push migrations to Supabase
   ```bash
   supabase db push
   ```

3. Seed the database (optional)
   ```bash
   supabase db execute < supabase/seed.sql
   ```

### Edge Functions Deployment

```bash
supabase functions deploy --project-ref your-project-ref
```

## Usage

1. Create an account or login
2. Complete the onboarding steps:
   - Connect your Shopify store
   - Set up Mirakl (if applicable)
   - Configure shipping preferences
   - Set up billing
3. Start managing your products, orders, and fulfillments

## License

[MIT](LICENSE)
