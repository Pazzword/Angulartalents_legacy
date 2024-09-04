# users/decorators.py

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from functools import wraps

def recruiter_required(view_func):
    @wraps(view_func)
    def _wrapped_view_func(request, *args, **kwargs):
        if request.user.role != 'recruiter':
            return JsonResponse({'error': 'Recruiter access required'}, status=403)
        return view_func(request, *args, **kwargs)
    return _wrapped_view_func

def engineer_required(view_func):
    @wraps(view_func)
    def _wrapped_view_func(request, *args, **kwargs):
        if request.user.role != 'engineer':
            return JsonResponse({'error': 'Engineer access required'}, status=403)
        return view_func(request, *args, **kwargs)
    return _wrapped_view_func