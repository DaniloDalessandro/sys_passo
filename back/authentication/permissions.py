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


class IsAdminRole(permissions.BasePermission):
    """Permite acesso apenas a usuários com papel 'admin' ou is_superuser."""

    message = 'Acesso restrito a administradores.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        try:
            return request.user.profile.role == 'admin'
        except Exception:
            return False


class IsApproverOrAdmin(permissions.BasePermission):
    """Permite acesso a usuários com papel 'admin' ou 'approver'."""

    message = 'Acesso restrito a aprovadores e administradores.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        try:
            return request.user.profile.role in ('admin', 'approver')
        except Exception:
            return False


class IsViewerOrAbove(permissions.BasePermission):
    """Permite acesso a qualquer usuário autenticado com perfil."""

    message = 'Acesso restrito a usuários autenticados com perfil.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        try:
            return request.user.profile.role in ('admin', 'approver', 'viewer')
        except Exception:
            return False

    def has_object_permission(self, request, view, obj):
        """Viewers têm acesso apenas de leitura."""
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        try:
            role = request.user.profile.role
            if role == 'viewer' and request.method not in permissions.SAFE_METHODS:
                return False
            return True
        except Exception:
            return False
