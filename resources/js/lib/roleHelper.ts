export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

export class RoleHelper {
  /**
   * Verificar si el usuario tiene un rol específico
   */
  static hasRole(user: User, roleName: string): boolean {
    return user.roles?.some(role => role.name === roleName) || false;
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  static hasPermission(user: User, permissionName: string): boolean {
    // Verificar permisos directos
    if (user.permissions?.some(permission => permission.name === permissionName)) {
      return true;
    }

    // Verificar permisos a través de roles
    return user.roles?.some(role => 
      role.permissions?.some(permission => permission.name === permissionName)
    ) || false;
  }

  /**
   * Verificar si el usuario es médico
   */
  static isMedico(user: User): boolean {
    return this.hasRole(user, 'medico');
  }

  /**
   * Verificar si el usuario es secretario
   */
  static isSecretario(user: User): boolean {
    return this.hasRole(user, 'secretario');
  }

  /**
   * Verificar si el usuario es administrador
   */
  static isAdministrador(user: User): boolean {
    return this.hasRole(user, 'administrador');
  }
}