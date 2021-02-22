# Schwarz-Christoffel
Web-App for the Visualization of Schwarz-Christoffel Mapping

# Setup:

### Enter Django project folder
cd backend
### Setup and activate pipenv
pipenv shell
### Install requirements, this is just Django at the moment
pip install -r requirements.txt
### Setup Django, migrate is mainly used for database
python manage.py migrate
### build webpackage
// keep this running in a separate cmd to automatically update webpackage changes as you dev
cd..
cd frontend
npm run dev
### run server
python manage.py runserver
### Then visit http://localhost:8000

# Directory Guide:
## Overview (key files)
```
-backend  -backend -settings
	 	   -urls
	  -SC	   -static	-build		-main.js
		   		-templates	-index.html
		   		-views.py
	  -manage.py
	  -pipfile
-frontend -node_modules
	  -src	   -index.js
	  -.babelrc
	  -package.json
	  -webpack.config.js
.gitignore
README
```
## Key File Explanation
```
./backend/backend - Django setup directory
./backend/backend/settings.py - Django settings
./backend/backend/urls.py - Django URLs (Routing)
./backend/SC - Django backend project directory
./backend/SC/static - Static pages to be served, where webpackages are compiled to AKA React page
./backend/SC/static/build/main.js - git ignored, webpackage build of React page
./backend/SC/static/templates/index.html - default HTML page, React anchor
./backend/SC/static/views.py - renders default HTML page
./backend/manage.py - main Django server file
./backend/manage.py - git ignored, result of pipenv
====================
./frontend/node_modules - git ignored, node modules
./frontend/src/index.js - Main React page
./frontend/.babelrc - babel settings
./frontend/package.json - project settings, scripts
./frontend/webpack.config.js - webpack build settings
====================
.gitignore
README
```

## Jupyter Notebook Sandbox
### The .ipynb is included in the .gitignore, please use the following command each time you wish to push sandbox code updates.
```
jupyter nbconvert $(pwd)/sandbox.ipynb --to="python" --output-dir=$(pwd) --output="sandbox"
```

## Authors
Andrew Liu (@NotLiu), Zane Fadul (@ZaneFadul)



