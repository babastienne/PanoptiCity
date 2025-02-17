FROM python:3.13 AS builder

# Create the app directory
RUN mkdir /app

# Set the working directory inside the container
WORKDIR /app

# Set environment variables
# Prevents Python from writing pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1
#Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

RUN apt-get update -qq && apt-get install -y -qq  \
    postgresql-client \
    && apt-get install -y gdal-bin

# Upgrade pip
RUN pip install --upgrade pip

# Copy the Django project  and install dependencies
COPY /back-end/requirements.txt  /app/

# run this command to install all dependencies
RUN pip install --no-cache-dir -r requirements.txt


# Copy the Django project to the container
COPY ./back-end /app/

# Expose the Django port
EXPOSE 8000


# -- FOR DEVELOPMENT --
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


# -- FOR PRODUCTION --
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "panopticity.wsgi:application"]
