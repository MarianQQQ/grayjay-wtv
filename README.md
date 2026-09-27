<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=000000,090514,150a2a,240e44,090514,000000&height=120&section=header&animation=twinkling" width="100%" alt="Header Wave" />
</p>

<p align="center">
  <img src="icon.png" width="115" height="115" alt="w.tv logo" />
</p>

<h1 align="center">w.tv Plugin for Grayjay</h1>

<p align="center">
  <a href="https://readme-typing-svg.demolab.com">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=18&duration=2800&pause=1000&color=C084FC&background=00000000&center=true&vCenter=true&width=560&lines=The+First+Unofficial+w.tv+Plugin+for+Grayjay;Watch+Live+Streams+with+Zero+Ads;Full+VOD+Recordings+with+Seeking+%26+Rewind;Interactive+In-Player+Live+Chat+Support;Native+Account+Login+%26+Followers+Feed;Cryptographically+Verified+%26+RSA-512+Signed" alt="Animated Typing Features" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/MarianQQQ/grayjay-wtv/releases"><img src="https://img.shields.io/badge/version-v1.0.0-7928CA.svg?style=for-the-badge&logo=github&color=120d1c&labelColor=000000" alt="Version" /></a>
  <a href="https://grayjay.app"><img src="https://img.shields.io/badge/platform-Grayjay-9333EA.svg?style=for-the-badge&color=240e44&labelColor=000000" alt="Platform" /></a>
  <a href="#-cryptographic-verification"><img src="https://img.shields.io/badge/signed-RSA--512-10B981.svg?style=for-the-badge&logo=auth0&color=132e22&labelColor=000000" alt="RSA Signed" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-F59E0B.svg?style=for-the-badge&color=2d1f05&labelColor=000000" alt="License" /></a>
</p>

<p align="center">
  <img src="divider.svg" width="100%" alt="AMOLED Divider" />
</p>

## ⚡ Instant Installation

<table>
  <tr>
    <td align="center" width="50%">
      <h3>📲 Scan with Grayjay</h3>
      <img src="qr-code.png" width="220" height="220" alt="Scan QR Code in Grayjay" /><br>
      <sub>Open Grayjay &rarr; <b>Sources</b> &rarr; <b>+</b> &rarr; <b>Scan QR Code</b></sub>
    </td>
    <td align="center" width="50%">
      <h3>🔗 One-Click Import Link</h3>
      <p>Tap below if you are browsing from your phone with Grayjay installed:</p>
      <a href="grayjay://plugin/https://raw.githubusercontent.com/MarianQQQ/grayjay-wtv/main/PluginConfig.json">
        <img src="https://img.shields.io/badge/Install%20in%20Grayjay-grayjay%3A%2F%2Fplugin-9333EA?style=for-the-badge&logo=android&logoColor=white&color=240e44&labelColor=000000" alt="Install in Grayjay" />
      </a>
      <br><br>
      <b>Or copy and paste manifest URL:</b>
      <pre><code>https://raw.githubusercontent.com/MarianQQQ/grayjay-wtv/main/PluginConfig.json</code></pre>
    </td>
  </tr>
</table>

<p align="center">
  <img src="divider.svg" width="100%" alt="AMOLED Divider" />
</p>

## ✨ Highlights & Features

- 🔴 **Live Stream Discovery**
  - Explore currently active broadcasts directly on the **Home** feed.
  - Infinite scroll pagination automatically retrieves more live streams as you browse.
  
- 📼 **Full Past Streams Archive (VODs)**
  - View all past broadcast archives directly on creator channel pages.
  - Shows exact broadcast duration (e.g. `05:25:47`), upload date, view count, and high-res thumbnails.
  - Full player controls: smooth seeking, rewind, fast-forward, pause, and quality selector.

- 🔍 **Universal Search & Creators Tab**
  - Search across all ongoing streams and streamer profiles simultaneously.
  - Dedicated **Creators** tab populates w.tv channel profiles with avatars and subscriber counts.

- 💬 **Interactive Live Chat**
  - Integrated in-player **Live Chat** window overlay.
  - Supports both **reading messages in real time** and **typing / sending messages** from your authenticated w.tv account.

- 🔐 **One-Click Account Login**
  - Sign in to your w.tv account via the in-app browser.
  - Automatic session detection captures authentication tokens (`isAuth`, `t_cookie`) and closes the window once authorized.

- 🛡️ **Cryptographic Verification**
  - Verified and signed with a custom **RSA-512** key pair to ensure script integrity and prevent tamper warnings.

<p align="center">
  <img src="divider.svg" width="100%" alt="AMOLED Divider" />
</p>

## 📖 Step-by-Step Installation Guide

1. Open **Grayjay** on your phone, tablet, or Android TV.
2. Navigate to **Sources** (bottom navigation bar) &rarr; tap the **`+`** icon.
3. Select **Install by URL** (or tap **Scan QR Code** to scan the code above).
4. Enter the source manifest URL:
   ```text
   https://raw.githubusercontent.com/MarianQQQ/grayjay-wtv/main/PluginConfig.json
   ```
5. Tap **Install**, then tap **Enable Source**.

---

## 🔑 How to Log In & Enable Chat

1. Go to **Sources** &rarr; tap **w.tv**.
2. Scroll to the **Authentication** section and tap **Login**.
3. Enter your w.tv account credentials.
4. Once logged in, the window closes automatically, and the button changes to **Logout**.
5. When watching any stream, tap the **Live Chat** button below the video to view and send messages!

<p align="center">
  <img src="divider.svg" width="100%" alt="AMOLED Divider" />
</p>

## ⚙️ Architecture & Technical Highlights

- **Streaming Protocol:** Directly consumes HLS master playlists (`master.m3u8`) hosted on AWS IVS for ultra-low latency playback.
- **RESTful Endpoints:** Utilizes `streams-search-service.w.tv` with mobile web client headers for uninterrupted feed and metadata resolution.
- **Pure ECMAScript Compatibility:** Engine-hardened script strictly compatible with Grayjay's embedded JS runtime.
- **Non-blocking Auth Flow:** Stateful cookie interception targeting `isAuth` and JWT session tokens (`t_cookie`, `u_cookie`).

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=000000,090514,150a2a,240e44,090514,000000&height=90&section=footer" width="100%" alt="Footer Wave" />
</p>
