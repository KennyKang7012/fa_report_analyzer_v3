import asyncio
from typing import Callable, Optional, Dict
from ..core.fa_analyzer_core import FAReportAnalyzer


class FAReportAnalyzerService:
    """Async FA Report Analysis Service"""

    def __init__(self):
        self.analyzer: Optional[FAReportAnalyzer] = None

    async def analyze_report(
        self,
        file_path: str,
        backend: str = "ollama",
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        skip_images: bool = False,
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> Dict:
        """
        Asynchronously execute report analysis

        Args:
            file_path: Path to the report file
            backend: LLM backend ('ollama', 'openai', 'anthropic')
            model: Model name (auto if not specified)
            api_key: API key for the LLM backend
            base_url: API base URL for OpenAI-compatible endpoints
            skip_images: Skip image analysis
            progress_callback: Progress callback function (progress, message)

        Returns:
            Analysis result dictionary
        """
        loop = asyncio.get_event_loop()

        def run_sync():
            # Create analyzer
            self.analyzer = FAReportAnalyzer(
                backend=backend,
                model=model,
                api_key=api_key,
                base_url=base_url,
                skip_images=skip_images
            )

            # Progress callback
            if progress_callback:
                progress_callback(10, "Reading report...")

            # Read report
            report_content, images = self.analyzer.read_report(file_path)

            if progress_callback:
                progress_callback(30, "Starting AI analysis...")

            # Analyze
            result = self.analyzer.analyze_with_ai(report_content, images)

            if progress_callback:
                progress_callback(100, "Analysis completed")

            return result

        return await loop.run_in_executor(None, run_sync)
