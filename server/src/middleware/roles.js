// ============================================================================
// TASKIFY - Role Middleware
// 3 sistemske role: ADMIN, MODERATOR, USER
// ============================================================================

/**
 * Middleware koji proverava da li korisnik ima određenu sistemsku rolu
 * - ADMIN: Pun pristup svemu
 * - MODERATOR: Može editovati tuđe projekte
 * - USER: Samo svoje projekte
 */
export function requireRole(role) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}

/**
 * Middleware koji proverava da li korisnik ima jednu od dozvoljenih rola
 */
export function requireOneOfRoles(...roles) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}
