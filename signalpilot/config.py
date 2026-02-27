from pydantic_settings import BaseSettings
from pydantic import SecretStr


class Settings(BaseSettings):
    # Polymarket credentials — SecretStr prevents accidental logging
    private_key: SecretStr = SecretStr("")
    funder_address: str = ""
    # Wallet type: 0=fresh EOA, 1=Magic/email proxy, 2=MetaMask/Gnosis Safe
    signature_type: int = 1

    # Strategy config
    active_strategies: str = "arb"

    # Capital allocation
    max_capital_usdc: float = 1000.0
    arb_allocation: float = 0.40
    mm_allocation: float = 0.40
    latency_allocation: float = 0.20

    # Risk management
    max_daily_loss: float = 0.05
    max_position_size: float = 0.10
    stop_loss: float = 0.15

    # Infrastructure
    polymarket_clob_url: str = "https://clob.polymarket.com"
    polymarket_gamma_url: str = "https://gamma-api.polymarket.com"
    polygon_chain_id: int = 137

    # Binance feed for latency arb
    binance_ws_url: str = "wss://stream.binance.com:9443/ws/btcusdt@trade"

    # Telegram alerts (optional)
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""

    # Mode
    dry_run: bool = True

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def private_key_str(self) -> str:
        """Extract the raw private key string only when needed."""
        return self.private_key.get_secret_value()

    @property
    def has_credentials(self) -> bool:
        return bool(self.private_key_str and self.funder_address)

    @property
    def strategy_list(self) -> list[str]:
        return [s.strip() for s in self.active_strategies.split(",")]

    @property
    def arb_capital(self) -> float:
        return self.max_capital_usdc * self.arb_allocation

    @property
    def mm_capital(self) -> float:
        return self.max_capital_usdc * self.mm_allocation

    @property
    def latency_capital(self) -> float:
        return self.max_capital_usdc * self.latency_allocation
