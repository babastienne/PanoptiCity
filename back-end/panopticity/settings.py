import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = os.environ.get("SECRET_KEY")

DEBUG = False


# ALLOWED_HOSTS = []
ALLOWED_HOSTS = os.getenv('BACKEND_DOMAIN_NAME', 'localhost').split(' ')


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.gis",
    "corsheaders",
    "rest_framework",
    "rest_framework_gis",
    "cameras",
    "gunicorn",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOWED_ORIGINS = [
    # "https://example.com",
    "http://localhost",
]

ROOT_URLCONF = "panopticity.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "panopticity.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": os.getenv("POSTGRES_DB", "postgres"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "postgres"),
        "HOST": os.getenv("POSTGRES_HOST", "127.0.0.1"),
        "PORT": os.getenv("POSTGRES_PORT", "5452"),
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- OSM replication and buildings provider ---
# See docs/installation-config/update.md

# Replication server followed by the `replicate_cameras` service
REPLICATION_SERVER_URL = os.getenv(
    "REPLICATION_SERVER_URL", "https://planet.osm.org/replication/minute")
# State file written by the install script, used once to initialise the database state
REPLICATION_STATE_FILE = os.getenv(
    "REPLICATION_STATE_FILE", "/osm-data/sequence.state.txt")

# Source of buildings used to compute the focus of new or moved cameras:
# "overture" (Overture Maps monthly release, no local storage), "local" (local .osm.pbf
# extract kept up to date with OSM diffs) or "none" (focus computed without buildings)
BUILDINGS_PROVIDER = os.getenv("BUILDINGS_PROVIDER", "overture")
BUILDINGS_OVERTURE_RELEASE = os.getenv("BUILDINGS_OVERTURE_RELEASE", "latest")
BUILDINGS_OVERTURE_OSM_ONLY = os.getenv(
    "BUILDINGS_OVERTURE_OSM_ONLY", "true").lower() in ("1", "true", "yes")
BUILDINGS_LOCAL_PBF = os.getenv("BUILDINGS_LOCAL_PBF", "")
BUILDINGS_LOCAL_UPDATE_HOURS = int(os.getenv("BUILDINGS_LOCAL_UPDATE_HOURS", "24"))
BUILDINGS_CACHE_DIR = os.getenv("BUILDINGS_CACHE_DIR", "/osm-data/cache")

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly"
    ],
}
