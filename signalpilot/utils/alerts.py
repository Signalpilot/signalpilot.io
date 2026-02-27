"""
Alert system — sends notifications via Telegram (optional) and logs.
"""
import logging
import httpx

logger = logging.getLogger(__name__)


class Alerter:
    def __init__(self, telegram_token: str = "", chat_id: str = ""):
        self.telegram_token = telegram_token
        self.chat_id = chat_id
        self._http = httpx.Client(timeout=5) if telegram_token else None

    def send(self, message: str, level: str = "info"):
        """Send an alert via all configured channels."""
        getattr(logger, level, logger.info)(message)

        if self._http and self.telegram_token and self.chat_id:
            self._send_telegram(message)

    def _send_telegram(self, message: str):
        try:
            url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"
            self._http.post(url, json={"chat_id": self.chat_id, "text": message, "parse_mode": "Markdown"})
        except Exception as e:
            logger.debug("Telegram alert failed: %s", e)

    def trade_alert(self, strategy: str, action: str, details: str):
        self.send(f"[{strategy.upper()}] {action}: {details}")

    def risk_alert(self, message: str):
        self.send(f"[RISK] {message}", level="warning")

    def kill_switch_alert(self, reason: str):
        self.send(f"[KILL SWITCH] {reason}", level="critical")
