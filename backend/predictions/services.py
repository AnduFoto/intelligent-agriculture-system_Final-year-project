import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """
    Raised whenever the AI Disease Detection Service cannot be reached
    or fails to respond in a usable way (timeout, connection error,
    or an unexpected non-JSON / malformed response).

    Views calling this service should catch this exception and
    translate it into a clean 503 API response — the caller should
    never need to know whether the underlying cause was a timeout,
    a connection refusal, or a parsing failure.
    """
    pass


def call_ai_prediction_service(image_file):
    """
    Forwards an uploaded image to the external AI Disease Detection
    System's /api/predict/ endpoint and returns its parsed JSON
    response.

    This function does NOT interpret the response's meaning (whether
    it's a rejection or a full prediction) — that logic belongs to
    the calling view, which understands the three possible response
    shapes described in the module's specification. This function's
    sole responsibility is: make the HTTP call, return JSON, or raise
    AIServiceError if that's not possible.
    """
    url = f"{settings.AI_SERVICE_URL}/api/predict/"

    try:
        response = requests.post(
            url,
            files={'image': (image_file.name, image_file, image_file.content_type)},
            timeout=settings.AI_SERVICE_TIMEOUT,
        )
    except requests.Timeout:
        logger.error(f"AI Service timed out after {settings.AI_SERVICE_TIMEOUT}s calling {url}")
        raise AIServiceError("The disease detection service took too long to respond.")
    except requests.ConnectionError:
        logger.error(f"AI Service connection failed calling {url}")
        raise AIServiceError("The disease detection service is currently unreachable.")
    except requests.RequestException as exc:
        logger.error(f"AI Service request failed unexpectedly: {exc}")
        raise AIServiceError("The disease detection service could not process the request.")

    # The AI System returns 200 (rejection cases) or 201 (full
    # prediction) for all "successful" interactions — both are
    # meaningful, valid responses the view needs to see. Only a
    # genuinely unexpected status code (4xx/5xx from the AI System
    # itself, e.g. its own internal error) is treated as a failure
    # here, since those don't match any documented response shape
    # this module knows how to interpret.
    if response.status_code not in (200, 201):
        logger.error(
            f"AI Service returned unexpected status {response.status_code}: {response.text[:500]}"
        )
        raise AIServiceError("The disease detection service returned an unexpected error.")

    try:
        return response.json()
    except ValueError:
        logger.error(f"AI Service returned non-JSON response: {response.text[:500]}")
        raise AIServiceError("The disease detection service returned an invalid response.")