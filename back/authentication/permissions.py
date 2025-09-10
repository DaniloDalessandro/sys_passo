from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj.user == request.user


class IsAccountOwner(permissions.BasePermission):
    """
    Custom permission to only allow users to access their own account data.
    """

    def has_object_permission(self, request, view, obj):
        # Check if the user is accessing their own account
        return obj == request.user


class IsAuthenticatedOrCreateOnly(permissions.BasePermission):
    """
    Custom permission to allow unauthenticated users to create accounts
    but require authentication for other operations.
    """

    def has_permission(self, request, view):
        # Allow POST requests (registration) for unauthenticated users
        if request.method == 'POST':
            return True
        
        # Require authentication for other methods
        return request.user and request.user.is_authenticated