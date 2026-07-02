# SoleStreet Patna — Premium E-Commerce Platform

A feature-rich, high-performance, and responsive full-stack E-commerce web application tailored for premium footwear, sneakers, and general merchandise.

## 🚀 Key Features

* **🤖 Gemini AI Shopping Assistant:** Integrated support chatbot with multilingual capabilities (auto-detects and replies in English, Hindi, Hinglish, Bhojpuri, and Tamil). Fully capable of fetching user orders, tracking shipments, and guiding/executing order cancellations interactively.
* **🔍 Smart Search Suggestions:** Dynamic debounced autocomplete search bar showing matching products and category suggestions in real-time.
* **📦 Auto-Pincode Address Lookup:** Automatically fetches and fills city and state names instantly once a user inputs their pin code at checkout.
* **💬 Footnote Feedback Form:** General feedback form embedded directly into the global footer with automatic lexicon-based sentiment analysis tracking for administrators.
* **🖥️ Compact Viewport Optimization:** Sized perfectly for standard views without scroll clutter, displaying a sleek 5-product grid layout per row, scrollable reviews, and a responsive chatbot interface.

---

## 🛠️ Technology Stack

* **Frontend:** React.js (Vite), React Router, Context API, Vanilla CSS, React Icons
* **Backend:** Node.js, Express.js, JWT Authentication, Gemini AI API Integration
* **Database:** MongoDB (via Mongoose)
* **API Communication:** Axios

---

## 📦 Getting Started

### 1. Prerequisites
Ensure you have Node.js and MongoDB installed on your system.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start backend server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start frontend dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the application.
