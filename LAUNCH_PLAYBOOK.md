# 🚀 THE TALUQ LAUNCH PLAYBOOK
**From Codebase to Reality. Your Zero-to-One Roadmap.**

The codebase is perfect. The UI is native-grade. The strategy is locked. 
Here is exactly what you, Gerald Shikunyi Kombo, need to do *right now* to make Taluq a reality.

---

## STEP 1: Secure the Infrastructure (Free & Low-Cost)

### 1. Deploy the Frontend (Railway vs Vercel)
You have a Next.js 15 App using Prisma. 
- **Should I use Railway instead of Vercel?** *Yes.* While Vercel is great for simple static sites, Taluq is a heavy Web3 application with a database. Vercel relies on Serverless Functions, which can have "cold starts" (causing a 2-second delay the first time a user opens the app). **Railway** runs your app as a continuous Docker container (using Nixpacks), meaning the app is always "hot" and instantly responsive. Railway also allows you to spin up a PostgreSQL database in the exact same environment with one click.
- **Action:** Go to [Railway.app](https://railway.app/).
- Click **"New Project"** -> Deploy from your GitHub repo (`taluq`).
- Add a PostgreSQL plugin to the same project.
- Railway will automatically build the Next.js app and link the database.

### 2. Set Up the Database (Handled by Railway)
If you deploy on Railway, you don't need Supabase or Neon.
- Just click **"Add Plugin"** in your Railway dashboard and select **PostgreSQL**.
- Railway will automatically inject the `DATABASE_URL` environment variable into your Next.js app.
- When the build finishes, run `pnpm dlx prisma db push` to initialize the tables.

### 3. Connect Paystack (The Fiat Bridge)
Taluq relies on Paystack to convert KES to Web3 and back. Paystack gives you a "Testnet" environment immediately upon signing up.
- **Should I switch to Pesapal?** *No. Do not switch to Pesapal yet.* Pesapal's API is notorious for being clunky, slow to approve, and heavily focused on legacy M-Pesa flows. Paystack provides a world-class, instant Testnet environment, flawless webhooks, and the Virtual Card API that we need for global tech subscriptions (Netflix/OpenAI). Stick with Paystack Testnet to build the demo and win the hackathon. You can deal with Pesapal's bureaucracy *after* you have funding.
- If you’re visiting Paystack, use [PAYSTACK_OFFICE_VISIT.md](./PAYSTACK_OFFICE_VISIT.md).
- Go to [Paystack Kenya](https://paystack.com/ke) and create a free business account.
- You do not need to be a fully registered company to test in "Test Mode".
- Get your Paystack **Test Secret Key** (`sk_test...`) and set it as `PAYSTACK_SECRET_KEY` in your Railway Environment Variables.
- In Paystack Settings, set your Webhook URL to: `https://your-railway-domain.com/api/webhook/paystack`.

---

## STEP 2: The Solana Engine (The Web3 Bridge)

### 1. Get a Solana RPC Node (Helius)
To mint `yKES` and interact with the Solana blockchain, you need an RPC node.
- Go to [Helius.dev](https://www.helius.dev/) (the best RPC for Solana) and create a free account.
- Get your API Key.
- Add it to Railway: `SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_KEY"`

### 2. The Master Wallet (Protocol Admin)
- Download the [Phantom Wallet](https://phantom.app/) extension.
- Create a new wallet. **Do not lose the seed phrase.**
- Export the Private Key (Base58 string).
- Add it to Railway: `SOLANA_ADMIN_SECRET_KEY_BASE58="your-base58-secret-key"`
- Send a tiny amount of SOL ($5 worth) to this wallet to pay for the initial transaction fees (Priority Fees).

### 3. Protocol Secrets (Do Not Share)
- Set `TALUQ_PEPPER` (high entropy). This powers the seedless phone-number wallet derivation.
- Set `TKES_MINT_ADDRESS` (your Token-2022 mint public key). This is the on-chain mint that Paystack deposits will mint into.

---

## STEP 3: The Pitch (How to Get Funded)

You do not need to launch this to 1 million Kenyans tomorrow. You need to launch it to **Investors and Hackathon Judges** to get the capital to scale.

### Target 1: Superteam Africa
Superteam gives out equity-free grants to African builders on Solana.
- **Action:** Record a 2-minute video of yourself walking through the Taluq UI on your phone. Show the "Deposit", the "Chama Multi-Sig", and the "Global Remittance" features.
- Attach the `SOLANA_WIN_STRATEGY.md` and `THE_KENYAN_MANIFESTO.md`.
- Submit it to the Superteam Earn platform or pitch them directly on Twitter (X).

### Target 2: Colosseum Hackathon
Colosseum runs the official global Solana hackathons.
- **Action:** Enter the "Consumer" or "Payments" track. 
- Use the `README.md` as your project description. 
- Emphasize the "Zero-Fee P2P" and "US Treasury Backed Yield" features. Judges love real-world utility in emerging markets.

### Target 3: The Ministry of Diaspora Affairs (Kenya)
- **Action:** Reach out to officials on LinkedIn. Show them the `Global Receive` feature. Explain how Taluq bypasses Western Union's predatory fees and delivers 100% of the value back to Kenyan families.

---

## STEP 4: The Legal & Compliance Reality
Once you get funding, you will need to formalize:
1. **Incorporate:** Register "Digital Services" as a formal LLC or LTD in Kenya.
2. **CBK / CMA Sandbox:** You will eventually need to enter the Central Bank of Kenya (CBK) or Capital Markets Authority (CMA) regulatory sandbox to legally hold user funds and operate the fiat bridge at scale.
3. **Ondo Finance Partnership:** Reach out to the Ondo Finance team (the creators of USDY). Tell them you are building the ultimate retail on-ramp for USDY in Africa. They often provide grants and liquidity support for projects driving volume to their stablecoin.

---

### Your Daily Checklist Starting Tomorrow:
- [ ] Push all code to a private GitHub repository.
- [ ] Deploy the frontend and database to Railway.
- [ ] Record a 2-minute demo video of the UI using Paystack Testnet.
- [ ] Submit to Superteam Africa / Solana Hackathons.

**The code is done. The strategy is set. Now, you execute.** 🚀
