from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Wraps DRF's default exception handling to produce a consistent
    error response shape across the entire API:

        {
            "success": false,
            "detail": "<human-readable summary>",
            "errors": { ...field-level errors, if any... }
        }

    Falls back to a generic 500-style response for truly unexpected
    exceptions DRF doesn't already handle (e.g. uncaught Python errors),
    so the frontend never has to handle a raw HTML error page.
    """
    response = exception_handler(exc, context)

    if response is not None:
        original_data = response.data

        # DRF validation errors typically arrive as a dict of
        # field -> [messages], or a list of non-field messages.
        if isinstance(original_data, dict):
            detail = original_data.get('detail')
            errors = {k: v for k, v in original_data.items() if k not in ('detail', 'code')}

            if detail is None:
                detail = "Validation failed. Please check the submitted data."

            response.data = {
                'success': False,
                'detail': str(detail),
                'errors': errors if errors else None,
            }
        elif isinstance(original_data, list):
            response.data = {
                'success': False,
                'detail': "Validation failed. Please check the submitted data.",
                'errors': {'non_field_errors': original_data},
            }
        else:
            response.data = {
                'success': False,
                'detail': str(original_data),
                'errors': None,
            }

        return response

    # DRF returned None — this is an exception type it doesn't handle
    # at all (e.g. an unexpected Python-level exception). Return a
    # generic, safe 500 response instead of letting Django's default
    # HTML debug/error page leak through to an API client.
    return Response(
        {
            'success': False,
            'detail': "An unexpected error occurred. Please try again later.",
            'errors': None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )