from django.db.models import TextChoices

OVERPASS_URL = "https://maps.mail.ru/osm/tools/overpass/api/interpreter"

# --- Choices and constants for Camera and Focus models fields ---


class MountChoices(TextChoices):
    WALL = "wall", "wall"
    POLE = "pole", "pole"
    CEILING = "ceiling", "ceiling"
    STREET_LAMP = "street_lamp", "street_lamp"
    BUILDING = "building", "building"
    TRAFFIC_SIGNAL = "traffic_signal", "traffic_signal"


class SurveillanceTypeChoices(TextChoices):
    CAMERA = "camera", "camera"
    ALPR = "ALPR", "ALPR"


class SurveillanceChoices(TextChoices):
    INDOOR = "indoor", "indoor"
    OUTDOOR = "outdoor", "outdoor"
    PUBLIC = "public", "public"
    TRANSPORTATION = "transportation", "transportation"
    TRAFFIC = "traffic", "traffic"
    RED_LIGHT = "red_light", "red_light"
    LEVEL_CROSSING = "level_crossing", "level_crossing"
    SPEED_CAMERA = "speed_camera", "speed_camera"


class ZoneChoices(TextChoices):
    TOWN = "town", "town"
    PARKING = "parking", "parking"
    ATM = "atm", "atm"
    TRAFFIC = "traffic", "traffic"
    SHOP = "shop", "shop"
    BANK = "bank", "bank"
    BUILDING = "building", "building"
    ENTRANCE = "entrance", "entrance"
    STREET = "street", "street"


class CameraTypeChoices(TextChoices):
    FIXED = "fixed", "fixed"
    PANNING = "panning", "panning"
    DOM = "dom", "dom"


class FocusScenarioChoices(TextChoices):
    """
    The different scenarios for focus calculation.
    Order is important: from best case to worst case.
    """
    BEST = "best", "Best case scenario"
    MEAN = "mean", "Average"
    WORST = "worst", "Worst case scenario"


class FocusLevelChoices(TextChoices):
    """
    The different focus levels.
    Order is important: from smallest to largest focus.
    """
    IDENTIFICATION = "identification", "identification"
    RECOGNITION = "recognition", "recognition"
    OBSERVATION = "observation", "observation"


# --- Mathematical constants and coefficients for focus calculation ---

CAMERA_HEIGHT_DEFAULT = 3.0
CAMERA_HEIGHT_MAX = 20
CAMERA_HEIGHT_MIN = 1.5

# Min angle to considered tilted down. 0° is horizontal, 90° is vertical down
CAMERA_ANGLE_MIN = 17

BASE_COEFICIENT = 0.00026  # Base coefficient for focus calculation

LEVEL_COEFFICIENTS = {
    # By default the focus computed without any coef is the recognition one for 250ppm
    "identification": 1,
    "recognition": 3.84615,  # 3.84615 = Ratio between 250ppm and 65 ppm
    "observation": 10,       # 25 = Ratio between 250ppm and 25 ppm
}

# Nominal coef = 25mm (focal) with 1920x1080 (resolution) = 1 x 1
SCENARIOS_COEFFICIENTS = {
    "fixed": {
        # 2.8mm (focal) x 1920x1080 (resolution) = 2.8/25 x 1 = 0.112
        "best": 0.112,
        # 6.8mm (focal) x 2556x1440 (resolution) = 6.8/25 x 2556/1920 = 0.272 * 1.331 = 0.3621
        "mean": 0.3621,
        # 26mm (focal) x 3840x2160 (resolution) = 26/25 x 3840/1920 = 1.04 * 2 = 2.08
        "worst": 2.08,
    },
    "dome/ptz": {
        # 2.8mm (focal) x 1280x1024 (resolution) = 2.8/25 x 1280*1920 = 0.112 * 0.666 = 0.0746
        "best": 0.0746,
        # 6.5mm (focal) x 2556x1440 (resolution) = 6.5/25 x 2556/1920 = 0.26 * 1.331 = 0.346
        "mean": 0.3621,
        # 68.2mm (focal) x 3840x2160 (resolution) = 68.2/25 x 3840/1920 = 2.728 * 2 = 5.456
        "worst": 5.456,
    }
}

MAX_CLUSTER_ZOOM = 15
