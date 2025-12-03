"""
Core functionality module
"""
from .fa_analyzer_core import FAReportAnalyzer
from .security import SecurityManager, get_security_manager

__all__ = ["FAReportAnalyzer", "SecurityManager", "get_security_manager"]
