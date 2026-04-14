<div align="center">
  <img src="./assets/logo.png" alt="Dhanvantari Logo" width="120">
  <h1>Dhanvantari Mobile</h1>
  <p><strong>The High-Performance Pharmacy Inventory & POS Companion</strong></p>

  <p>
    <a href="https://expo.dev/"><img src="https://img.shields.io/badge/React_Native-Expo-black?style=for-the-badge&logo=expo" alt="Expo"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
    <a href="https://clerk.com/"><img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk" alt="Clerk"></a>
  </p>
</div>

---

## 📖 Overview

**Dhanvantari Mobile** is a high-fidelity companion application for the Dhanvantari Pharmacy Inventory System. Tailored for pharmacists and store owners, it provides a seamless mobile-first experience for managing stock, processing bills at the counter, and monitoring store health from anywhere.

It mirrors the complex logic of the [Dhanvantari Web](https://github.com/0shreyas0/dhanvantari) application while providing a native, touch-optimized interface built with **Expo**.

---

## ✨ Features

- **📊 Intelligence Dashboard**: Real-time sales metrics, stock health percentages, and priority expiry alerts.
- **📦 Smart Inventory**: Detailed batch tracking with recall protection and FEFO (First-Expiry-First-Out) visibility.
- **🧾 Rapid POS**: A high-performance billing engine with debounced search, near-expiry confirmations, and PDF generation.
- **💰 Financial Core**: Deep-dive into revenue patterns, lifetime sales, and losses due to expiration or recalls.
- **⚙️ Store Control**: Full pharmacy identity management and customizable warning thresholds (Early → Urgent → Critical).
- **🔐 Enterprise Security**: Secure unified login via **Clerk**, supporting Google OAuth and multi-factor authentication.

---

## 🛠 Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

---

## 🚀 Installation & Setup

### 📥 1. Clone & Install
```bash
git clone https://github.com/0shreyas0/dhanvantari-mobile.git
cd dhanvantari-mobile
npm install
```

### 🔑 2. Environment Configuration
Create a `.env` in the root folder:

| Key | Description |
|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your project key from [Clerk](https://clerk.com) |
| `EXPO_PUBLIC_API_BASE_URL` | The URL of your running [Dhanvantari Web](https://github.com/0shreyas0/dhanvantari) server |

### 🛰 3. Running the App
```bash
# Start the Expo Dev Client
npx expo start
```
*   **iOS**: Press `i` to open the iOS Simulator.
*   **Android**: Press `a` to open the Android Emulator.
*   **Physical**: Scan the QR code using the Expo Go app.

---

## 📁 Project Architecture

```text
📂 app/
├── 📂 (auth)/        # High-fidelity Auth Flow (Sign-in/Sign-up)
├── 📂 (protected)/   # Core App Screens (Dashboard, Billing, Finance)
└── 📄 _layout.tsx    # Root Gateway & Provider logic
📂 components/        # Reusable Atomic UI Components
📂 lib/
├── 📄 api.ts         # Structured API Client using Fetch/Clerk
└── 📄 types.ts       # Unified TypeScript definitions
```

---

## 🎨 Aesthetic Integrity
Designed for professional pharmacy environments with a high-contrast dark theme.

| Token | Value | Hex |
|---|---|---|
| **Background** | Primary Deep | `#030817` |
| **Surface** | Layered Cards | `#061024` |
| **Primary** | Action Blue | `#4E8CFF` |
| **Accent** | Logic Purple | `#7357FF` |
| **Danger** | Alert Rose | `#EF5B8C` |

---

<p align="center">
  Made with ❤️ for Pharmacy Efficiency
</p>


