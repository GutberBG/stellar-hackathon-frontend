import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Producer, ProducerDetail, ProducerLoanBrief } from '../models/producer.model';
import { ProducerUpdateRequest } from '../models/auth.model';
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

  createProducer(data: Partial<Producer>): Observable<Producer> {
    return this.api.post<Producer>('/producers', data, (req) => {
      const newProducer: ProducerDetail = {
        id: this.producersState.length + 1,
        name: req.name || 'Nuevo Productor',
        ci_number: req.ci_number || '1234567-LP',
        community: req.community || 'Sapecho (Alto Beni)',
        cooperative: req.cooperative || 'Central de Cooperativas El Ceibo',
        eudr_latitude: req.eudr_latitude || -15.5412,
        eudr_longitude: req.eudr_longitude || -67.3298,
        eudr_plot_code: req.eudr_plot_code || `BO-LPZ-AB-${Math.floor(1000 + Math.random() * 9000)}`,
        parcel_hectares: req.parcel_hectares || 3.0,
        eudr_certified: true,
        phone: req.phone || '+59171234567',
        bank_account_hint: req.bank_account_hint || 'Banco Unión - Simple QR',
        compliance_score: 0.95,
        risk_tier: 'BAJO',
        deliveries_count: 0,
        total_delivered_kg: 0,
        deliveries: [],
        active_loans: [],
        created_at: new Date().toISOString(),
      };
      this.producersState.unshift(newProducer);
      return newProducer;
    });
  }

  updateProducer(producerId: number, data: ProducerUpdateRequest): Observable<Producer> {
    return this.api.put<Producer>(`/producers/${producerId}`, data, (req) => {
      const index = this.producersState.findIndex((p) => p.id === producerId);
      if (index === -1) {
        throw new Error(`Producer ${producerId} not found`);
      }
      const existing = this.producersState[index];
      const updated: ProducerDetail = {
        ...existing,
        ...req,
      };
      this.producersState[index] = updated;
      return updated;
    });
  }

  getProducerLoans(producerId: number): Observable<ProducerLoanBrief[]> {
    return this.api.get<ProducerLoanBrief[]>(`/producers/${producerId}/loans`, () => {
      const producer = this.producersState.find((p) => p.id === producerId);
      return producer ? producer.active_loans : [];
    });
  }
}
