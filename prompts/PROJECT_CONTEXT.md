# AutoCaption Studio — Project Context

**Version:** 1.0.0  
**Last Updated:** June 2026  
**Status:** In Development  

---

## 1. Project Overview

### Name
AutoCaption Studio

### Description
AutoCaption Studio is a professional local desktop/web application that automatically generates subtitles from videos using AI. It allows users to edit captions, synchronize them with the video, customize subtitle styles, and export high-quality captioned videos — entirely offline with no cloud dependency.

### Inspiration
CapCut subtitle editor — but running 100% locally with full privacy and no internet requirement.

### Core Value
> Upload a video → get accurate subtitles in seconds → edit → export. All locally.

---

## 2. Main Goals

| Goal | Description |
|------|-------------|
| Upload videos | Support mp4, mov, avi, mkv, webm |
| Auto-generate subtitles | AI transcription via faster-whisper |
| Edit subtitles | Text, timing, merge, split, delete |
| Word-level timestamps | Karaoke effect, active word highlighting |
| Real-time preview | Subtitle overlay on video player |
| Export SRT | Standard subtitle format |
| Export MP4/MOV | Video with burned-in subtitles via FFmpeg |
| Work offline | Zero cloud dependency |

---

## 3. Tech Stack

### Backend — Laravel 13
- **Language:** PHP 8.3+
- **Database:** MySQL (via XAMPP)
- **Port:** 8000

**Responsibilities:**
- Project management (CRUD)
- File upload and storage
- REST API gateway
- Database operations
- Communication with AI service
- FFmpeg export orchestration

**Key Packages:**
- `laravel/sanctum` — API authentication
- `guzzlehttp/guzzle` — HTTP client for FastAPI calls

---

### AI Service — FastAPI
- **Language:** Python 3.11
- **Framework:** FastAPI
- **Port:** 8001

**Responsibilities:**
- Audio extraction from video (FFmpeg)
- Speech recognition (faster-whisper)
- Language detection
- Segment-level timestamps
- Word-level timestamps

**Key Libraries:**
| Library | Purpose |
|---------|---------|
| faster-whisper | Whisper transcription (CTranslate2 backend) |
| FFmpeg | Audio extraction from video |
| uvicorn | ASGI server |
| python-multipart | File upload handling |
| CTranslate2 | Optimized inference engine |

---

### Frontend — React
- **Language:** TypeScript
- **Framework:** React 18 + Vite
- **Port:** 5173

**Responsibilities:**
- User interface
- Video player with subtitle overlay
- Subtitle list and editor
- Timeline (drag, resize, split)
- Subtitle style customization
- Export controls

**Key Libraries:**
| Library | Purpose |
|---------|---------|
| TailwindCSS | Styling |
| Shadcn UI | Component library |
| Zustand | Global state management |
| React Query | API data fetching and caching |
| Axios | HTTP client |

---

## 4. Folder Structure

```
extract_text_app/
│
├── backend/                        # Laravel 13
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── ProjectController.php
│   │   │   │   ├── VideoController.php
│   │   │   │   ├── CaptionController.php
│   │   │   │   └── ExportController.php
│   │   │   └── Requests/
│   │   ├── Models/
│   │   │   ├── Project.php
│   │   │   ├── Caption.php
│   │   │   ├── Word.php
│   │   │   └── Export.php
│   │   └── Services/               # Business logic (future)
│   ├── database/
│   │   └── migrations/
│   ├── routes/
│   │   └── api.php
│   └── storage/
│       ├── app/uploads/            # Uploaded videos
│       ├── app/exports/            # Exported files
│       └── app/temp/               # Temporary WAV files
│
├── ai/                             # FastAPI + faster-whisper
│   ├── main.py                     # FastAPI app + routes
│   ├── venv/                       # Python virtual environment
│   └── requirements.txt
│
├── frontend/                       # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoPlayer/
│   │   │   ├── Timeline/
│   │   │   ├── CaptionList/
│   │   │   ├── CaptionEditor/
│   │   │   └── PropertiesPanel/
│   │   ├── stores/                 # Zustand stores
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── api/                    # Axios API calls
│   │   └── types/                  # TypeScript interfaces
│   └── public/
│
├── uploads/                        # Raw uploaded videos (root level)
├── exports/                        # Final exported videos (root level)
├── temp/                           # Temp audio files (root level)
│
├── docs/
│   └── PROJECT_CONTEXT.md
└── README.md
```

---

## 5. Database Schema

### Table: `projects`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint unsigned | Primary key |
| name | varchar(255) | Project name |
| video_path | varchar(255) | Path to uploaded video |
| video_name | varchar(255) | Original filename |
| duration | int | Video duration in seconds |
| language | varchar(10) | Transcription language |
| status | enum | pending / processing / done / error |
| created_at | timestamp | — |
| updated_at | timestamp | — |

---

### Table: `captions`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint unsigned | Primary key |
| project_id | bigint unsigned | FK → projects.id |
| order | int | Display order |
| text | text | Subtitle text |
| start | float | Start time in seconds |
| end | float | End time in seconds |
| created_at | timestamp | — |
| updated_at | timestamp | — |

---

### Table: `words`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint unsigned | Primary key |
| caption_id | bigint unsigned | FK → captions.id |
| word | varchar(255) | Individual word |
| start | float | Word start time |
| end | float | Word end time |
| created_at | timestamp | — |
| updated_at | timestamp | — |

---

### Table: `exports`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint unsigned | Primary key |
| project_id | bigint unsigned | FK → projects.id |
| type | enum | srt / mp4 / mov |
| file_path | varchar(255) | Output file path |
| status | enum | pending / processing / done / error |
| created_at | timestamp | — |
| updated_at | timestamp | — |

---

### Relationships
```
Project  ──< Caption ──< Word
Project  ──< Export
```

---

## 6. Full Workflow

```
User
 │
 ├─► Create Project (POST /api/projects)
 │       └─► Laravel stores project in MySQL
 │
 ├─► Upload Video (POST /api/projects/{id}/upload)
 │       └─► Laravel stores file in storage/app/uploads/
 │
 ├─► Transcribe (POST /api/projects/{id}/transcribe)
 │       ├─► Laravel reads video from storage
 │       ├─► Laravel sends video to FastAPI (multipart/form-data)
 │       │       ├─► FastAPI extracts audio with FFmpeg → WAV 16kHz mono
 │       │       ├─► faster-whisper transcribes audio
 │       │       └─► Returns JSON { language, duration, captions[] }
 │       └─► Laravel saves captions + words in MySQL
 │
 ├─► Edit Captions (React UI)
 │       ├─► PUT /api/projects/{id}/captions/{captionId}
 │       ├─► DELETE /api/projects/{id}/captions/{captionId}
 │       └─► POST /api/projects/{id}/captions/merge
 │
 └─► Export
         ├─► SRT → POST /api/projects/{id}/export/srt
         │       └─► Laravel generates .srt file
         └─► Video → POST /api/projects/{id}/export/video
                 └─► Laravel runs FFmpeg to burn subtitles into video
```

---

## 7. API Reference

### Laravel API (port 8000)

#### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/{id}` | Get project with captions |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project + files |

#### Video
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/{id}/upload` | Upload video file |
| POST | `/api/projects/{id}/transcribe` | Start AI transcription |

#### Captions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{id}/captions` | Get all captions |
| PUT | `/api/projects/{id}/captions/{captionId}` | Update caption |
| DELETE | `/api/projects/{id}/captions/{captionId}` | Delete caption |
| POST | `/api/projects/{id}/captions/merge` | Merge captions |

#### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/{id}/export/srt` | Export SRT file |
| POST | `/api/projects/{id}/export/video` | Export MP4 with burned subtitles |

---

### FastAPI AI Service (port 8001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| POST | `/transcribe` | Transcribe video file |

#### POST `/transcribe` — Request
```
Content-Type: multipart/form-data
file: <video file>
language: fr | en | ar | auto (query param)
```

#### POST `/transcribe` — Response
```json
{
  "language": "fr",
  "duration": 125.4,
  "captions": [
    {
      "id": 1,
      "text": "Bonjour tout le monde",
      "start": 1.2,
      "end": 3.1,
      "words": [
        { "word": "Bonjour", "start": 1.2, "end": 1.6 },
        { "word": "tout",    "start": 1.7, "end": 1.9 },
        { "word": "le",      "start": 2.0, "end": 2.1 },
        { "word": "monde",   "start": 2.2, "end": 3.1 }
      ]
    }
  ]
}
```

---

## 8. Whisper Configuration

| Environment | Model | Device | Compute Type |
|-------------|-------|--------|--------------|
| Development | small | cpu | int8 |
| GPU (NVIDIA) | small | cuda | float16 |
| Production | medium | cuda | float16 |

### Supported Languages
| Code | Language |
|------|---------|
| fr | French |
| en | English |
| ar | Arabic |
| auto | Auto-detect |

---

## 9. FFmpeg Usage

### Audio Extraction (AI Service)
```bash
ffmpeg -i input.mp4 -ar 16000 -ac 1 -y output.wav
```

### Subtitle Burn (Laravel Export)
```bash
ffmpeg -i input.mp4 \
  -vf "subtitles='output.srt':force_style='FontName=Arial,FontSize=18,
       PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,Outline=2,Alignment=2'" \
  -c:a copy \
  -y final.mp4
```

---

## 10. Environment Variables

### Backend `.env` (Laravel)
```env
APP_NAME=AutoCaptionStudio
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=autocaption
DB_USERNAME=root
DB_PASSWORD=
AI_SERVICE_URL=http://127.0.0.1:8001
UPLOAD_MAX_SIZE=500
FRONTEND_URL=http://localhost:5173
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

### AI Service (Python)
```env
WHISPER_MODEL=small
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8
```

---

## 11. Development Rules

### General
- Keep business logic in Laravel Services, not Controllers
- Controllers must be thin — validate, call service, return response
- Use Form Requests for all input validation
- Store all timestamps as `float` (decimal seconds, e.g. `1.234`)
- Never call FastAPI directly from React — always go through Laravel

### Backend
- Use `Http::timeout(300)` for transcription calls (large files)
- Always clean up temp files in `finally` blocks
- Re-index caption `order` after any delete or merge operation

### Frontend
- Use React Query for all API calls (caching, loading states)
- Use Zustand for global app state (current project, selected caption)
- Never store video binary data in state — use URLs
- TypeScript strict mode enabled

### AI Service
- Load Whisper model once at startup — never per request
- Always delete temp video and audio files after transcription
- Return `word_timestamps=True` for karaoke support

---

## 12. Performance Targets

| Operation | Target | Condition |
|-----------|--------|-----------|
| Transcription (5 min video) | ≤ 30s | CPU (int8) |
| Transcription (5 min video) | ≤ 5s | GPU (float16) |
| Video player | 60 FPS | — |
| Export 1080p (5 min) | < 1 min | FFmpeg |
| API response (captions) | < 200ms | MySQL indexed |

---

## 13. MVP Roadmap

### Sprint 1 — Foundation ✅
- [x] Laravel setup + MySQL migrations
- [x] Models (Project, Caption, Word, Export)
- [x] Controllers (Project, Video, Caption, Export)
- [x] FastAPI setup + faster-whisper
- [x] FFmpeg installed

### Sprint 2 — Core API 🔄
- [ ] Routes configured and tested
- [ ] File upload working
- [ ] Transcription end-to-end tested (Postman)
- [ ] SRT export working

### Sprint 3 — Frontend Base
- [ ] React + Vite + TailwindCSS + Shadcn setup
- [ ] Zustand stores (project, captions, player)
- [ ] API layer (React Query + Axios)
- [ ] Project list page
- [ ] Video upload UI

### Sprint 4 — Subtitle Editor
- [ ] Caption list component
- [ ] Inline text editor
- [ ] Timestamp editor
- [ ] Merge / delete actions
- [ ] Real-time subtitle overlay on video

### Sprint 5 — Video Player
- [ ] Custom video player component
- [ ] Subtitle overlay synced to playback
- [ ] Keyboard shortcuts (Space, ←, →)
- [ ] Progress scrubber

### Sprint 6 — Timeline
- [ ] Waveform visualization
- [ ] Caption blocks (drag, resize)
- [ ] Playhead sync
- [ ] Zoom in/out

### Sprint 7 — Styles & Export
- [ ] Font selector (Montserrat, Poppins, Arial)
- [ ] Color, size, position controls
- [ ] Templates (TikTok, Podcast, Shorts)
- [ ] MP4 export with burned subtitles
- [ ] SRT download

---

## 14. Future Features (v2 / v3)

### Version 2.0
- Advanced timeline (multi-track)
- Karaoke effect (word-by-word highlight)
- Animated subtitle effects (Pop, Fade In)
- Template library

### Version 3.0 — AI Powered (Ollama Integration)
- AI translation (multi-language)
- AI grammar correction
- Auto-generate hooks for TikTok / Instagram / YouTube
- AI subtitle rewriting (tone adjustment)
- Automatic emoji insertion
- Automatic hashtag generation

### Future
- Voice cloning
- Cloud synchronization
- Real-time collaboration
- Mobile app (React Native)

---

## 15. Running the Project

### Start all services

**Terminal 1 — AI Service**
```bash
cd extract_text_app/ai
venv\Scripts\activate
uvicorn main:app --reload --port 8001
```

**Terminal 2 — Laravel Backend**
```bash
cd extract_text_app/backend
php artisan serve
```

**Terminal 3 — React Frontend**
```bash
cd extract_text_app/frontend
npm run dev
```

**XAMPP** — Start Apache + MySQL

### Access Points
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Laravel API | http://localhost:8000/api |
| FastAPI | http://127.0.0.1:8001 |
| FastAPI Docs | http://127.0.0.1:8001/docs |
| phpMyAdmin | http://localhost/phpmyadmin |
