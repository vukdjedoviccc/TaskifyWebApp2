import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User, LoginCredentials, RegisterForm, AuthStatus } from '../models';
import { catchError, tap, of } from 'rxjs';

const STORAGE_KEY = 'taskify-auth';

interface StoredAuth {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  // Signals za state
  private _status = signal<AuthStatus>('loading');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly status = this._status.asReadonly();
  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed
  readonly isAuthenticated = computed(() => this._status() === 'authenticated');
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isLoading = computed(() => this._status() === 'loading');

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { token, user } = JSON.parse(stored) as StoredAuth;
        this._token.set(token);
        this._user.set(user);
        this._status.set('authenticated');
      } else {
        this._status.set('unauthenticated');
      }
    } catch {
      this._status.set('unauthenticated');
    }
  }

  private saveToStorage(): void {
    const token = this._token();
    const user = this._user();
    if (token && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  register(form: RegisterForm) {
    this._status.set('loading');
    this._error.set(null);

    return this.api.post<{ token: string; user: User }>('/auth/register', form).pipe(
      tap(({ token, user }) => {
        this._token.set(token);
        this._user.set(user);
        this._status.set('authenticated');
        this.saveToStorage();
      }),
      catchError((err) => {
        this._status.set('unauthenticated');
        this._error.set(err?.error?.message || 'Registration failed');
        throw err;
      })
    );
  }

  login(credentials: LoginCredentials) {
    this._status.set('loading');
    this._error.set(null);

    return this.api.post<{ token: string; user: User }>('/auth/login', credentials).pipe(
      tap(({ token, user }) => {
        this._token.set(token);
        this._user.set(user);
        this._status.set('authenticated');
        this.saveToStorage();
      }),
      catchError((err) => {
        this._status.set('unauthenticated');
        this._error.set(err?.error?.message || 'Login failed');
        throw err;
      })
    );
  }

  logout() {
    return this.api.post('/auth/logout').pipe(
      tap(() => {
        this._token.set(null);
        this._user.set(null);
        this._status.set('unauthenticated');
        this.clearStorage();
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        this._token.set(null);
        this._user.set(null);
        this._status.set('unauthenticated');
        this.clearStorage();
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }

  refresh() {
    return this.api.get<User>('/auth/me').pipe(
      tap((user) => {
        this._user.set(user);
        this._status.set('authenticated');
        this.saveToStorage();
      }),
      catchError(() => {
        this._status.set('unauthenticated');
        return of(null);
      })
    );
  }

  clearError(): void {
    this._error.set(null);
  }
}
