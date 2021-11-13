FROM node:15-slim AS frontend

RUN mkdir -p /frontend

COPY frontend/package.json /frontend/package.json
COPY frontend/package-lock.json /frontend/package-lock.json
COPY frontend/webpack.config.js /frontend/webpack.config.js
COPY frontend/webpack.config.prod.js /frontend/webpack.config.prod.js
COPY frontend/.babelrc /frontend/.babelrc
WORKDIR /frontend

RUN npm install

COPY frontend/src /frontend/src

RUN npm run build

FROM python:3.9-slim as backend

# These two environment variables prevent __pycache__/ files.
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

RUN pip install pipenv

RUN mkdir -p /app

COPY backend/Pipfile /app/Pipfile
COPY backend/Pipfile.lock /app/Pipfile.lock

WORKDIR /app
RUN pipenv install --system --deploy 

COPY backend /app
COPY --from=frontend /frontend/dist/ /app/SC/static/SC/build/

CMD ["gunicorn", "-b", "0.0.0.0:$PORT", "backend.wsgi"]
