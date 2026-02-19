//   Uvozimo biblioteku za JWT tokene (male “kartice” koje dokažu ko si).
import jwt from 'jsonwebtoken';
//   Uvozimo promenljive iz .env fajla (tu su lozinke, tajne, port...).
import { env } from '../config/env.js';
//   Uvozimo Prisma – “daljinski upravljač” za bazu (čitanje/pisanje).
import { PrismaClient } from '../../generated/prisma/index.js';
//   Pravimo jedan jedini Prisma objekat da pričamo sa bazom.
const prisma = new PrismaClient();

//   signToken(payload): napravi potpisani JWT token iz podataka o korisniku.
//    - payload: obično { id, role } – minimum info da kasnije znamo ko je korisnik.
//    - env.JWT_SECRET: tajna šifra kojom potpisujemo token (MORA da postoji).
//    - expiresIn: koliko dugo token važi (npr. '7d' = 7 dana).
export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

//   setAuthCookie(res, token): smesti JWT token u HTTP-only kolačić.
//    - httpOnly: true → JS u browseru NE može da ga čita (bezbednije).
//    - secure: samo preko HTTPS u produkciji (da ne ide preko običnog HTTP).
//    - sameSite: 'none' u produkciji (da radi sa razlicitih domena), inače 'lax'.
//    - maxAge: koliko dugo kolačić živi (ovde ~7 dana).
export function setAuthCookie(res, token) {
  const isProd = env.NODE_ENV === 'production';
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

//   clearAuthCookie(res): obriši (očisti) auth kolačić – korisnik je odjavljen.
//    - Koristimo iste bezbednosne opcije kao kod postavljanja.
export function clearAuthCookie(res) {
  const isProd = env.NODE_ENV === 'production';
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
}

//   requireAuth: middleware koji proverava da li je korisnik prijavljen.
//    KORACI:
//    1) Pokušaj da pronađe token u kolačiću.
//    2) Ako nema, proveri Authorization header (format: "Bearer TOKEN").
//    3) Ako nema ni tamo, vrati 401 (Unauthorized).
//    4) Ako ima token, proveri da li je važeći i potpisan našom tajnom (verify).
//    5) Ako je dobar, iz baze dovuci korisnika i ubaci ga u req.user.
//    6) Pozovi next() – pusti dalje rutu. U suprotnom vrati 401.
export async function requireAuth(req, res, next) {
  try {
    //   1) Uzimamo token iz auth kolačića (ako postoji).
    let token = req.cookies?.[env.COOKIE_NAME];

    //   2) Ako nema u kolačiću, proveravamo Authorization header (Bearer TOKEN).
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    //   Ako i dalje nemamo token → korisnik nije prijavljen.
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    //   Proveravamo token: da li je važeći i potpisan našim JWT_SECRET-om.
    const decoded = jwt.verify(token, env.JWT_SECRET);

    //   Na osnovu decoded.id (što smo mi stavili u token), tražimo korisnika.
    //    Vraćamo samo par polja – koliko nam treba za aplikaciju.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    //   Ako nema takvog korisnika u bazi → tretiramo kao da nema pravo pristupa.
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    //   Zakačimo korisnika na req.user, da rute posle znaju ko je.
    req.user = user;

    //   Sve OK – pusti dalje do sledećeg handler-a/rute.
    next();
  } catch (e) {
    //   Ako verifikacija padne ili nešto krene po zlu → 401 Unauthorized.
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
