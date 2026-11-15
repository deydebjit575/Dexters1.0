# 🌌 STORYVERSE 
**"Imagine Worlds. Create Stories. Build Universes."**

A modern, colorful, premium-quality AI-powered storytelling and world-building SaaS platform designed for authors, novelists, game developers, screenwriters, students, and creative teams.

---

## 🌟 Vision & Key Highlights

Unlike traditional AI writing tools that generate disconnected, one-off stories, **STORYVERSE AI** is built on the **Connected Universe Engine (USP)**. In this unified creative platform, every character, kingdom, timeline era, and metaphysical rule is interconnected:

- **When you create a character in the Character Lab**, they automatically become available in the **AI Story Studio** and **Dialogue Generator**.
- **When a location is plotted in the World Builder**, its geography, defense, and culture are automatically injected into scene generation.
- **When a historical event is recorded in the Timeline Manager**, the AI continuity auditor cross-checks chapter text to eliminate timeline paradoxes.
- **Interactive Story Builder** enables creators to plot decision-based branching narratives with multiple resolutions and preview them in a reader mode.

---

## 🎨 Design & Visual Identity

The platform adheres strictly to the modern, colorful SaaS design system:
- **Primary Purple:** `#7549E8`
- **Electric Blue:** `#20A5D8`
- **Amber Gold:** `#F3A64A`
- **Emerald Green:** `#27B887`
- **Background:** `#F8F8FC` (Off-white canvas) / `#0E0E18` (Dark mode)
- **Text:** `#202033` (Deep brand text) / `#F3F4F8` (Light text)

Includes smooth transitions, dark/light theme switcher, glassmorphic panels, and interactive SVG node graphs.

---

## 🚀 Key Modules & Capabilities

### 1. Landing Page
- **Hero Section:** "Your Imagination Deserves Its Own Universe."
- **Storytelling Visual:** Interactive showcase with multi-layer universe nodes.
- **Platform Features:** Comprehensive grid showcasing the 6 core modules.
- **How It Works:** 3 simple steps (Architect Lore &rarr; Populate Entities &rarr; Unleash Stories).
- **Example Universes:** Showcases *The Shattered Realm of Aethelgard* (High Fantasy) and *Neo-Cyberia 2184* (Cyberpunk Sci-Fi).
- **Creator Testimonials:** Illustrative creator reviews.
- **SaaS Pricing Table:** Explorer (Free), Creator (₹299/mo), Studio (₹999/mo).
- **FAQ:** Expandable interactive accordion answers.
- **Footer:** Navigation, social links, and Terms & Privacy modals.

### 2. Authentication & User Profiles
- Secure user registration, login, logout, and password recovery.
- Strict data isolation ensuring users only access their sovereign universes.
- One-click **Demo Login** (`demo@storyverse.ai` / `storyverse123`) with preloaded universes.
- Profile customization: Pen name, author biography, custom avatar image.

### 3. Main User Dashboard
- Welcome banner with user profile stats.
- Metric indicators: Total Universes, Total Characters, Total Stories, AI Credit usage meter.
- Active Universe Quick-Switch drawer and spotlight card.
- Fast launchpad shortcuts to all 11 workspace destinations.
- Recent creative activity log.

### 4. World Builder
- Establish universes across Fantasy, Science Fiction, Mythology, Dystopian, Historical, and Custom genres.
- Define kingdoms, cities, planets, ruins, and sanctuaries.
- Detail political regimes, climates, cultures, and defensive fortifications.
- **Interactive Visual Cartographic Map:** Draggable, clickable coordinate grid linking trade routes and military paths.
- Define metaphysical laws of magic and technology paradigms.

### 5. Character Lab
- Detailed character records: Name, role, species, age, avatar, traits, biography, abilities, motivations, strengths, weaknesses, and character arcs.
- **Visual Character Relationship Map:** Interactive SVG graph showing color-coded connections (Allies, Rivals, Family, Nemesis, Romantic, Mentor, Complex).
- AI Character Architect generator.

### 6. AI Story Studio (Central Writing Engine)
- Chapter-by-chapter distraction-free manuscript editor.
- Live word count counter and reading time estimator.
- Debounced automatic autosave with timestamp indicators.
- **Creative Assistant Panel:**
  - Active Universe context memory pills.
  - Tone & voice selector (Epic, Grimdark, Whimsical, Psychological Thriller, Cyber-Noir).
  - Scene drafting from outline prompts.
  - "⚡ Continue Story" cursor continuation.
  - Organic Plot Twist Generator.
  - Canon Continuity & Paradox Auditor.
- **Full Manuscript Export:** Download as Markdown (`.md`), Microsoft Word (`.doc`/`.docx`), or Printable PDF Reader view.

### 7. Dialogue Generator
- Select 2+ existing characters and a location from your universe.
- Choose emotional tones (Tense, Argument, Secretive, Banter, Melancholic, Romantic).
- Script-style presentation with character avatars, emotional state badges, stage directions, and spoken lines.
- In-line editing of individual speech turns and one-click script copying.

### 8. Timeline Manager
- Chronological vertical milestone timeline with eras and sorting years.
- Connect events to witness characters and geographic locations.
- Automated continuity anomaly alerts.
- AI Timeline Generator that synthesizes chronological turning points.

### 9. Interactive Story Builder
- Visual node-flow decision graph with directed choice arrows.
- Node editor with reader scene text and customizable reader decisions.
- **"Play / Preview as Reader" Mode:** An interactive gamebook experience with choices advancing paths and celebratory confetti upon reaching resolutions.

### 10. Community & Discovery
- Explore public universes and stories.
- Filter by genre and search by keywords or tags.
- Upvote/Like and Bookmark projects with real-time counters.
- Public Creator Profiles showcasing author portfolios.

### 11. SaaS Subscription & Credit System
- **Explorer Plan (Free):** 150 AI credits, 3 universes.
- **Creator Plan (₹299/mo):** 1,000 AI credits/mo, unlimited universes, advanced world maps, relationship graphs, full exports.
- **Studio Plan (₹999/mo):** 5,000 AI credits/mo, collaborative workspaces, custom LLM keys, priority generation.
- **Razorpay & Stripe Checkout Integration:** Prepared checkout with strict provider confirmation verification ("Never show a payment as successful unless confirmed").

### 12. Settings & AI Engine Configuration
- Custom Google Gemini or OpenAI API Key configuration to unlock live LLM completions.
- Clearly labeled Demo Mode powered by the Contextual Lore Synthesizer.
- AI Generation & Credit Audit Logs with prompt previews and timestamps.
- Permanent account and project deletion danger zone.

---

## 🛠 Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend:** Node.js, Express, JSON Database Engine with ACID-like atomic persistence, JWT Authentication, bcryptjs.
- **AI Engine:** Google Gemini API / OpenAI API integration with Contextual Lore Synthesizer fallback.
- **Exports:** Native Markdown, Word Document, Print-to-PDF HTML.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# In server directory:
cd server && npm install

# In client directory:
cd ../client && npm install
```

### 2. Run the Application
You can run both client and server concurrently:
```bash
npm run dev
```

Or run the production server (serves both API and frontend on port 5000):
```bash
npm start
```
Open **`http://localhost:5000`** in your browser!

### 3. Demo Credentials
- **Email:** `demo@storyverse.ai`
- **Password:** `storyverse123`
*(Or click "⚡ Instant Demo Access" on the login modal)*
