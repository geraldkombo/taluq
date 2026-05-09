# TALUQ MOBILE STRATEGY (NATIVE VS PWA)
**Target Market:** Kenya (Silicon Savannah)

## 1. The "Bundles" Problem in Kenya
In Kenya, mobile data ("bundles") is expensive. A large percentage of the population uses entry-level Android devices (Tecno, Infinix, Itel) with limited storage (16GB or 32GB). 
- Asking a user to go to the Google Play Store and download a 50MB to 150MB native application is a massive barrier to entry.
- Users frequently uninstall apps to make room for photos or WhatsApp updates.
- Updating an app via the Play Store consumes precious data bundles.

## 2. Why We Started with a PWA (Progressive Web App)
Taluq is currently engineered as an **Offline-First PWA**. This is a highly strategic choice for emerging markets:
- **Zero App Store Friction:** A user clicks a link, hits "Add to Home Screen", and the app installs instantly. It takes up less than 1MB of space.
- **Bundle Optimization:** In `sw.js`, we implemented a **Cache-First Strategy**. Once the app loads the first time, all UI elements (fonts, icons, layouts) are cached directly on the phone. When the user opens Taluq tomorrow, it loads *instantly* without consuming a single megabyte of data. It only uses microscopic amounts of data (kilobytes) to fetch their real-time `yKES` balance.
- **Silent Updates:** When we push a new feature to Taluq, the user gets it instantly upon opening the app. They don't have to go to the Play Store and waste 30MB of data downloading an update.

## 3. The Case for a Native App (React Native / Expo)
While the PWA is perfect for mass adoption and bundle-saving, there is a strategic time to launch a Native iOS/Android App.

**When should Taluq build a Native App?**
1. **Push Notifications:** Apple (iOS) historically restricts background push notifications for PWAs. If Taluq needs to send real-time alerts like *"Your Rent Escrow has been funded"* outside of the app, a Native App handles this perfectly.
2. **Deep Hardware Integration:** While our PWA uses WebAuthn for biometrics, a Native App has deeper access to secure enclaves (Secure Element) and NFC (if we ever want to allow users to tap-to-pay with Taluq at a Naivas supermarket).
3. **Contact Book Sync:** If we want users to easily select a phone number from their contacts for a Zero-Fee P2P transfer, Native Apps have direct APIs to read the phone's address book. A PWA cannot easily do this without clunky browser prompts.
4. **App Store Trust:** In 2026, being on the Apple App Store and Google Play Store carries a psychological "trust badge." Older or more conservative users (like landlords) often trust an app they download from an official store more than a website.

## 4. The Recommendation
**Phase 1 (Current): The PWA.**
Launch Taluq right now using the PWA we just built. It solves the bundle problem perfectly, installs instantly, and works flawlessly offline. It is the perfect Trojan Horse to get millions of users onboarded without data friction.

**Phase 2 (Post-Funding): The Expo Native App.**
Once Taluq secures the Colosseum or Superteam grant, use a portion of the funds to wrap the core logic into **React Native (using Expo)**. Because our logic is already in React, porting it to Expo is incredibly fast. This will give us the Native App Store presence, deep contact book integration for P2P, and flawless push notifications, cementing Taluq as a billion-dollar institution.