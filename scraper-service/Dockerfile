FROM python:3.11-slim

ENV TZ=Europe/Vienna

WORKDIR /app

COPY package*.json ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app.main:app"]