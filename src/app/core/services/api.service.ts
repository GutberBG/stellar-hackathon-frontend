import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  public readonly isBackendLive = signal<boolean>(true);
  public readonly fallbackModeActive = signal<boolean>(false);

  private baseUrl = environment.apiUrl;

  get<T>(endpoint: string, fallbackFactory?: () => T): Observable<T> {
    if (this.fallbackModeActive()) {
      return fallbackFactory ? of(fallbackFactory()) : throwError(() => new Error('Offline'));
    }

    return this.http.get<T>(`${this.baseUrl}${endpoint}`).pipe(
      tap(() => {
        this.isBackendLive.set(true);
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn(`[Ayni Cacao API] GET ${endpoint} unavailable, activating intelligent fallback:`, error.message);
        this.isBackendLive.set(false);
        if (fallbackFactory) {
          return of(fallbackFactory());
        }
        return throwError(() => error);
      })
    );
  }

  post<T>(endpoint: string, body: any, fallbackFactory?: (req: any) => T): Observable<T> {
    if (this.fallbackModeActive()) {
      return fallbackFactory ? of(fallbackFactory(body)) : throwError(() => new Error('Offline'));
    }

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body).pipe(
      tap(() => {
        this.isBackendLive.set(true);
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn(`[Ayni Cacao API] POST ${endpoint} unavailable, activating intelligent fallback:`, error.message);
        this.isBackendLive.set(false);
        if (fallbackFactory) {
          return of(fallbackFactory(body));
        }
        return throwError(() => error);
      })
    );
  }
}
