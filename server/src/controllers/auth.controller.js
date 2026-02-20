//   Uvozimo bcrypt – služi da lozinke pretvaramo u “kašu” (hash) pre čuvanja u bazi.
//    Nikad ne čuvamo pravu (čitljivu) lozinku u bazi, to je opasno.
import bcrypt from 'bcryptjs';

//   Uvozimo PrismaClient – to je “daljinski upravljač” za bazu (čitamo/pišemo podatke).
import { PrismaClient } from '../../generated/prisma/index.js';

//   Uvozimo pomoćne funkcije za autentifikaciju (pravljenje tokena i kolačiće za prijavu).
//    signToken – pravi JWT token (kartica za ulaz)
//    setAuthCookie – stavlja taj token u kolačić u browseru (da ostaneš ulogovan)
//    clearAuthCookie – briše kolačić (odjavljuje te)
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from '../middleware/auth.js';

//   Pravimo jedan “prisma” objekat da bismo mogli da razgovaramo sa bazom.
const prisma = new PrismaClient();

//   REGISTRACIJA NOVOG KORISNIKA
//    Ruta: POST /api/auth/register
//    Šta radi: prima ime, email i lozinku; proveri da li email već postoji; ako ne, napravi korisnika,
//    napravi hash lozinke, podesi ulogu (USER ili ADMIN), odmah i uloguje korisnika (vrati token + kolačić).
export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body; // ⬅️ Uzimamo podatke koje je poslao klijent (frontend).

    //   Provera: ako nema obaveznih polja, prekidamo i vraćamo grešku 400 (loš zahtev).
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' });
    }

    //   Da ne bismo duplirali naloge: proveri da li već postoji korisnik sa tim email-om.
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(409).json({ message: 'Email already in use' }); // 409 = konflikt (već postoji)

    //   Pravimo HASH lozinke – ovo čuvamo u bazi umesto prave lozinke.
    const hash = await bcrypt.hash(password, 10); // “10” je jačina hashovanja (dovoljno za dev)

    //   Kreiramo korisnika u bazi. Uloga je “ADMIN” samo ako je role baš 'ADMIN', inače “USER”.
    //    select: biramo koja polja da vratimo klijentu (nikad ne vraćamo lozinku!).
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    //   Auto-login posle registracije:
    //    Napravimo JWT token sa ID i ulogom korisnika,
    //    i spakujemo ga u kolačić (setAuthCookie) – korisnik je odmah prijavljen.
    const token = signToken({ id: user.id, role: user.role });
    setAuthCookie(res, token);

    //   Vraćamo 201 (napravljeno) + podatke o korisniku i token.
    return res.status(201).json({ user, token });
  } catch (e) {
    console.error(e); // ⬅️ Ako nešto “pukne”, ispiši u konzolu zbog dijagnostike.
    return res.status(500).json({ message: 'Server error' }); // 500 = greška na serveru
  }
}

//   PRIJAVA (LOGIN) POSTOJEĆEG KORISNIKA
//    Ruta: POST /api/auth/login
//    Šta radi: proveri da li postoji korisnik po emailu, uporedi lozinku sa hash-om,
//    ako je tačno – napravi token, stavi kolačić, vrati podatke.
export async function login(req, res) {
  try {
    const { email, password } = req.body; // ⬅️ Uzimamo kredencijale koje je korisnik uneo.
    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'Email and password are required' }); // Bez oba polja nema logina.

    //   Tražimo korisnika po emailu.
    const userFound = await prisma.user.findUnique({ where: { email } });
    if (!userFound)
      return res.status(401).json({ message: 'Invalid credentials' }); // 401 = pogrešan email/šifra

    //   Poređenje unesene lozinke (plain) sa heširanom lozinkom iz baze.
    const ok = await bcrypt.compare(password, userFound.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' }); // Ako ne valja – nema ulaza.

    //   Pripremamo “čiste” podatke korisnika za odgovor (bez lozinke).
    const user = {
      id: userFound.id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
      createdAt: userFound.createdAt,
    };

    //   Kreiramo JWT token (u koji upisujemo id i ulogu),
    //    i postavimo ga u kolačić (da ostaneš prijavljen).
    const token = signToken({ id: user.id, role: user.role });
    setAuthCookie(res, token);

    //   Vraćamo korisnika i token kao JSON.
    return res.json({ user, token });
  } catch (e) {
    console.error(e); // Logujemo grešku na serveru.
    return res.status(500).json({ message: 'Server error' }); // Vraćamo poruku klijentu.
  }
}

//   ODJAVA (LOGOUT) KORISNIKA
//    Ruta: POST /api/auth/logout
//    Šta radi: obriše auth kolačić (token) – praktično te “zaboravi” kao ulogovanog.
export async function logout(_req, res) {
  try {
    clearAuthCookie(res); // ⬅️ Ovde brišemo kolačić sa tokenom.
    return res.json({ message: 'Logged out' }); // Poruka da je odjava uspela.
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

//   VRATI PODATKE O TRENUTNO ULOGOVANOM KORISNIKU
//    Ruta: GET /api/auth/me
//    Napomena: req.user popunjava middleware requireAuth (on čita token iz kolačića,
//    proveri ga i ubacuje podatke o korisniku u req.user).
export async function me(req, res) {
  // req.user postavlja requireAuth middleware
  return res.json(req.user); // ⬅️ Samo prosleđujemo to nazad klijentu.
}
