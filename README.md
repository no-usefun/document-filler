<<<<<<< HEAD
# XML → PDF Generator

Full-stack app: React (Vite + Tailwind) + Flask + MongoDB

---

## Project Structure

```
xml-pdf-app/
├── src/                    # React frontend
│   ├── components/         # Sidebar, Toolbar, FormViewer, XMLUploader
│   ├── forms/              # Form1–4 (A4 layouts)
│   ├── pages/              # Login, Dashboard
│   └── services/           # api.js, auth.jsx
├── backend/                # Flask backend
│   ├── routes/             # auth, xml, form, pdf routes
│   ├── services/           # xml_parser, pdf_service
│   ├── models/             # user_model, document_model
│   ├── config/             # database.py
│   └── templates/          # HTML templates for PDF
├── sample.xml              # Test file for upload
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 1. Frontend Setup

### Requirements
- Node.js 18+ (https://nodejs.org)

### Steps

```bash
# From the project root
npm install
npm run dev
```

Open http://localhost:5173

---

## 2. Backend Setup

### Requirements
- Python 3.10+ (https://python.org)
- MongoDB — either:
  - Local: https://www.mongodb.com/try/download/community
  - Cloud (easier): https://www.mongodb.com/atlas (free tier)

### Steps

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
copy .env.example .env        # Windows
cp .env.example .env          # Mac/Linux
```

Edit `.env` with your MongoDB connection string:
```
MONGO_URI=mongodb://localhost:27017/xmlpdfapp
JWT_SECRET_KEY=your-long-random-secret-here
```

For MongoDB Atlas, replace MONGO_URI with:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/xmlpdfapp
```

### WeasyPrint extra step (Windows only)

WeasyPrint needs GTK. Download and install:
https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases

### Start the backend

```bash
python app.py
```

Backend runs on http://localhost:5000

---

## 3. Using the App

1. Open http://localhost:5173
2. Register an account, then sign in
3. Click **Upload XML** and upload `sample.xml`
4. Forms 1–4 will auto-populate with parsed data
5. Click any form in the sidebar to view and edit it
6. Click **Generate PDF** in the toolbar to download

---

## 4. Running Both Together

Open two terminals:

**Terminal 1 — Frontend:**
```bash
npm run dev
```

**Terminal 2 — Backend:**
```bash
cd backend
venv\Scripts\activate   # or source venv/bin/activate
python app.py
```
=======
first readme
>>>>>>> e2ff0afae8ae94b521e4d1cf128e8c497e493186
