FROM python:3.12-slim

WORKDIR /app

# Install deps first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY signalpilot/ signalpilot/
COPY scan.py .

# Don't run as root
RUN useradd -m bot
USER bot

# Risk state persisted via volume mount
VOLUME ["/app/data"]
ENV PYTHONUNBUFFERED=1

CMD ["python", "-m", "signalpilot.main"]
