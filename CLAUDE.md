# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FA Report Analyzer v3.0** is a Web-based Failure Analysis (FA) report evaluation tool that uses AI to analyze and score FA reports. Built as a modern web application with FastAPI backend and pure HTML/CSS/JavaScript frontend.

**Key Features:**
- 🌐 Web-based interface (no installation required)
- 🤖 Multi-LLM backend support (Ollama, OpenAI, Anthropic)
- 📄 Multi-format document processing (PDF, DOCX, PPTX, TXT, images)
- 📊 Visual analytics with charts and dashboards
- 📝 6-dimension evaluation framework
- 💾 Analysis history management
- 🐳 Docker containerization ready

---

## Architecture Overview

### Technology Stack

**Backend:**
- Framework: FastAPI 0.104+
- Database: SQLite (development) / PostgreSQL (production)
- ORM: SQLAlchemy 2.0+
- Task Queue: FastAPI BackgroundTasks (MVP)
- Core Logic: Reuses v2.0 analysis engine

**Frontend:**
- Core: Pure HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- UI Framework: Bootstrap 5 (CDN)
- Charts: ECharts (CDN)
- HTTP: Fetch API (native)
- No build tools required

**Deployment:**
- Containerization: Docker + Docker Compose
- Static Files: Served by FastAPI
- Single-server deployment

---

## Project Structure

```
fa_report_analyzer_v3/
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── main.py             # FastAPI entry point
│   │   ├── config.py           # Configuration management
│   │   ├── database.py         # Database setup
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── api/                # API routes
│   │   ├── services/           # Business logic
│   │   ├── core/               # Core utilities
│   │   └── static/             # Frontend files
│   ├── tests/                  # Test suite
│   ├── uploads/                # Temporary file storage
│   ├── results/                # Analysis results
│   └── requirements.txt        # Python dependencies
├── docs/                        # Documentation
├── .gitignore
└── sample_fa_report.txt        # Test data
```

---

## Development Workflow

### Environment Setup

```bash
cd fa_report_analyzer_v3/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Running Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Access:
# Frontend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## API Endpoints

```
POST   /api/v1/upload              # Upload file
POST   /api/v1/analyze             # Start analysis
GET    /api/v1/analyze/{task_id}   # Query status
GET    /api/v1/result/{task_id}    # Get result
GET    /api/v1/history             # List history
POST   /api/v1/config              # Save config
GET    /api/v1/health              # Health check
```

---

## Evaluation Framework

Same 6-dimension framework from v2.0:

1. **Basic Information Completeness** (15%)
2. **Problem Description & Definition** (15%)
3. **Analysis Method & Process** (20%)
4. **Data & Evidence Support** (20%)
5. **Root Cause Analysis** (20%)
6. **Corrective Actions** (10%)

**Grade Classification:**
- A (90-100): Excellent
- B (80-89): Good
- C (70-79): Acceptable
- D (60-69): Needs Improvement
- F (<60): Inadequate

---

## Deployment

### Docker Deployment

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### Environment Variables

```env
DATABASE_URL=sqlite:///./fa_analyzer.db
ENCRYPTION_KEY=your-secret-key
MAX_FILE_SIZE=52428800
```

---

## Common Tasks

### Adding New LLM Backend
1. Update `FAReportAnalyzer` in `core/fa_analyzer_core.py`
2. Add new analysis method
3. Update model list in API
4. Add UI configuration

### Modifying Evaluation Criteria
Edit dimensions in `core/fa_analyzer_core.py`

### Customizing UI Theme
Edit `static/css/style.css` or Bootstrap variables

---

## Migration from v2.0

| Aspect | v2.0 (CLI) | v3.0 (Web) |
|--------|------------|------------|
| Interface | Command line | Web browser |
| Analysis | Synchronous | Asynchronous |
| Results | Text file | Database + formats |
| Deployment | Python script | Docker container |

---

## Version History

- **v3.0.0** (2025-12-01): Web application with FastAPI + HTML/CSS/JS
- **v2.0.2** (2025-12-01): CLI with temp file cleanup
- **v2.0** (2024-11-20): Multi-backend CLI tool
- **v1.0** (2024-11-20): Initial version

---

## Resources

- Planning Documents: `docs/web_v3.0/`
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
- [ECharts Documentation](https://echarts.apache.org/)
