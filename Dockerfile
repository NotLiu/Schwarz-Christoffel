FROM python:3.9-slim

# These two environment variables prevent __pycache__/ files.
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN pip install pipenv

RUN mkdir -p /app/backend

COPY backend/Pipfile /app/Pipfile
COPY backend/Pipfile.lock /app/Pipfile.lock

WORKDIR /app
RUN pipenv install
COPY backend /app

CMD ["pipenv", "run", "gunicorn", "-b", "0.0.0.0:8000", "backend.wsgi"]
