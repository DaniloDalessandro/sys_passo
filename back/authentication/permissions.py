from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permite edição apenas ao dono do objeto."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class IsAccountOwner(permissions.BasePermission):
    """Permite acesso apenas ao próprio usuário."""

    def has_object_permission(self, request, view, obj):
        return obj == request.user


class IsAuthenticatedOrCreateOnly(permissions.BasePermission):
    """Permite criação de conta sem autenticação; demais operações exigem login."""

    def has_permission(self, request, view):
        if request.method == 'POST':
            return True
        return request.user and request.user.is_authenticated
