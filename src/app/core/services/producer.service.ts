import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Producer, ProducerDetail } from '../models/producer.model';
import { INITIAL_PRODUCERS } from './mock-data';

@Injectable({
  providedIn: 'root',
})
export class ProducerService {
  private api = inject(ApiService);
  private producersState: ProducerDetail[] = [...INITIAL_PRODUCERS];

  getProducers(): Observable<Producer[]> {
    return this.api.get<Producer[]>('/producers', () => {
      return this.producersState.map(({ deliveries, active_loans, ...rest }) => rest);
    });
  }

  getProducerById(id: number): Observable<ProducerDetail> {
    return this.api.get<ProducerDetail>(`/producers/${id}`, () => {
      const found = this.producersState.find((p) => p.id === id);
      if (!found) {
        throw new Error(`Producer ${id} not found`);
      }
      return found;
    });
  }
}
