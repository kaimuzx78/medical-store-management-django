@echo off
REM Activate the virtual environment
call venv\Scripts\activate

REM Apply migrations
python manage.py migrate

REM Run the development server
python manage.py runserver

REM Deactivate the virtual environment after stopping the server
deactivate