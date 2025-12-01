# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FA Report Analyzer v2.0 is a professional Failure Analysis (FA) report evaluation tool that uses AI to analyze and score FA reports. The tool supports multiple LLM backends (Ollama, OpenAI, Anthropic) and can process both text and images from various document formats.

## Core Architecture

### Main Component

**`fa_report_analyzer_v2.py`** - Primary analyzer with multi-backend support

Core class: `FAReportAnalyzer`
- Initializes with backend selection (ollama/openai/anthropic)
- Manages multi-modal analysis (text + images)
- Implements 6-dimension evaluation framework
- Generates structured assessment reports

### Multi-Backend Design

The analyzer abstracts different LLM providers through a unified interface:
- `_analyze_with_ollama()` - Local inference using Ollama
- `_analyze_with_openai()` - OpenAI API integration (v2.0.1: defaults to `gpt-4o-mini-2024-07-18`)
- `_analyze_with_anthropic()` - Anthropic Claude API integration

Each backend method handles provider-specific message formatting, image encoding, and response parsing.

**Important**: The `--skip-images` flag can be used to perform text-only analysis, which is useful for avoiding OpenAI content moderation issues.

### Document Processing Pipeline

1. **read_report()** - Extracts content from various formats
   - Text: TXT, PDF, DOCX, PPTX
   - Images: JPG, PNG, GIF, WEBP
   - Embedded images from PDF/DOCX/PPTX

2. **analyze_with_ai()** - Routes to appropriate backend
   - Constructs evaluation prompt with dimension criteria
   - Handles multi-modal content (text + images)
   - Returns structured JSON result

3. **generate_report()** - Formats evaluation output
   - Tabular dimension scores using pandas
   - Prioritized improvement suggestions
   - Comprehensive summary with grade classification

## Evaluation Framework

**6 Dimensions with Weighted Scoring:**
- Basic Information Completeness (15%)
- Problem Description & Definition (15%)
- Analysis Method & Process (20%)
- Data & Evidence Support (20%)
- Root Cause Analysis (20%)
- Corrective Actions (10%)

**Grade Classification:**
- A (90-100): Excellent
- B (80-89): Good
- C (70-79): Acceptable
- D (60-69): Needs Improvement
- F (<60): Inadequate

## Development Commands

### Environment Setup
```bash
# Install dependencies
pip install anthropic ollama python-pptx python-dotenv --break-system-packages

# Additional optional dependencies
pip install PyPDF2 PyMuPDF python-docx Pillow --break-system-packages
```

### Running Analysis

**With Ollama (default):**
```bash
# Ensure Ollama is running
ollama serve

# Run analysis
python fa_report_analyzer_v2.py -i sample_fa_report.txt
```

**With OpenAI:**
```bash
# Uses default gpt-4o-mini-2024-07-18
python fa_report_analyzer_v2.py -i report.pdf -b openai -k YOUR_API_KEY

# Specify different model
python fa_report_analyzer_v2.py -i report.pdf -b openai -m gpt-4o -k YOUR_API_KEY

# Skip images (text-only analysis)
python fa_report_analyzer_v2.py -i report.pdf -b openai -k YOUR_API_KEY --skip-images
```

**With Anthropic:**
```bash
python fa_report_analyzer_v2.py -i report.pdf -b anthropic -k YOUR_API_KEY
```

### Testing
```bash
# Quick test with sample report
python fa_report_analyzer_v2.py -i sample_fa_report.txt -o test_output.txt

# Test with different model
python fa_report_analyzer_v2.py -i report.pdf -m llama3.2-vision:latest
```

## Key Implementation Details

### Image Handling
Images are extracted from documents and encoded as base64 for transmission to vision-capable models. The system limits images per analysis:
- Ollama: 5 images max
- OpenAI: 10 images max
- Anthropic: 20 images max

**New in v2.0.1**: Use `--skip-images` to perform text-only analysis, bypassing image processing entirely. This is useful when:
- Avoiding OpenAI content moderation issues
- Reducing API costs
- Faster processing for text-heavy reports

### JSON Response Parsing
AI responses must return pure JSON without markdown code blocks. The system strips common formatting artifacts:
```python
response_text = response_text.replace('```json', '').replace('```', '').strip()
result = json.loads(response_text)
```

### Error Handling
The analyzer gracefully degrades when optional dependencies are unavailable:
- PIL for image processing
- PyMuPDF for PDF image extraction
- python-docx for Word documents
- python-pptx for PowerPoint files

## Customization Points

### Modifying Evaluation Weights
Edit the `dimensions` dictionary in `FAReportAnalyzer.__init__()`:
```python
self.dimensions = {
    "基本資訊完整性": 15,  # Change percentages as needed
    "問題描述與定義": 15,
    # ... other dimensions
}
```

### Adjusting Grade Criteria
Modify `grade_criteria` dictionary to change score thresholds:
```python
self.grade_criteria = {
    'A': (90, 100, '卓越報告'),
    # ... other grades
}
```

### Custom Prompts
The `create_analysis_prompt()` method constructs the evaluation prompt. Modify this to adjust AI behavior and evaluation criteria.

## File Organization

**Main Files:**
- `fa_report_analyzer_v2.py` - Current version with multi-backend
- `fa_report_analyzer.py` - Legacy v1.0 (Anthropic only)
- `sample_fa_report.txt` - Test data

**Documentation:**
- `README.md` - v1.0 documentation (Chinese)
- `README_v2.md` - v2.0 documentation (Chinese)
- `MIGRATION_GUIDE.md` - v1 to v2 migration guide
- `OLLAMA_SETUP.md` - Ollama installation guide
- `PPT_FORMAT_GUIDE.md` - PowerPoint format conversion

**Configuration:**
- `pyproject.toml` - uv package manager config
- `requirements.txt` - pip dependencies

## Important Notes

### API Key Management
- Never hardcode API keys in source files
- Pass via `-k` argument or environment variables
- Default to Ollama backend to avoid requiring API keys

### PowerPoint Format Compatibility
- `python-pptx` only supports `.pptx` (Office 2007+)
- `.ppt` files require conversion via LibreOffice or manual conversion
- See `PPT_FORMAT_GUIDE.md` for conversion workflows

### Backend Selection Strategy
- **Ollama**: Default, local inference, no API costs, requires model download
- **OpenAI**: Best image understanding, requires API key and costs money (v2.0.1 defaults to cost-efficient `gpt-4o-mini-2024-07-18`)
- **Anthropic**: Balanced performance, requires API key and costs money

**Model Version Notes (v2.0.1)**:
- OpenAI backend now uses `gpt-4o-mini-2024-07-18` by default (lighter, faster, cheaper)
- Previous default `gpt-4o` can still be used with `-m gpt-4o`
- Alternative models are commented in code: `gpt-4.1-mini`, `gpt-4o-2024-05-13`

### Chinese Language Context
This project is designed for Chinese-language FA reports. All prompts, documentation, and output are in Traditional Chinese. The evaluation criteria are based on semiconductor industry FA report standards.

## Common Tasks

### Adding New Document Format Support
1. Add format detection in `read_report()`
2. Implement extraction logic for text and images
3. Handle ImportError for optional dependencies
4. Test with sample documents

### Supporting New LLM Backend
1. Add backend choice to argparse options
2. Implement `_analyze_with_<backend>()` method
3. Handle backend-specific message formatting
4. Update `_init_client()` for client initialization

### Batch Processing
Create a script that iterates over multiple reports:
```python
analyzer = FAReportAnalyzer(backend="ollama")
for report_file in glob.glob("reports/*.pdf"):
    result = analyzer.analyze_report(report_file)
```

## Version History

- **v2.0.2** (2025-12-01):
  - Added automatic temporary file cleanup for PPT conversions
  - Implemented `_cleanup_temp_files()` method with try-finally pattern
  - Enhanced AI prompts to explicitly request Traditional Chinese responses
  - Removed uv package manager configuration files (.python-version, uv.lock)
  - Improved resource management and error handling

- **v2.0.1** (2025-11-24):
  - Changed OpenAI default model to `gpt-4o-mini-2024-07-18`
  - Added `--skip-images` flag for text-only analysis
  - Enhanced OpenAI content moderation error handling
  - Added detailed JSON parsing error messages
  - Output raw LLM responses for debugging

- **v2.0** (2024-11-20): Multi-backend support (Ollama/OpenAI/Anthropic), image analysis, PPTX support
- **v1.0** (2024-11-20): Initial version with Anthropic Claude only
