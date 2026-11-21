import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DeliveryCreateRequest, DeliveryResponse, DeliveryListResponse } from '../models/delivery.model';
import { INITIAL_DELIVERIES, INITIAL_PRODUCERS } from './mock-data';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private api = inject(ApiService);
  private deliveriesState: DeliveryResponse[] = [...INITIAL_DELIVERIES];

  createDelivery(req: DeliveryCreateRequest): Observable<DeliveryResponse> {
    return this.api.post<DeliveryResponse>('/deliveries', req, (body) => {
      const producer = INITIAL_PRODUCERS.find((p) => p.id === body.producer_id) || INITIAL_PRODUCERS[0];
      
      // Calculate agronomic dry weight
      let netDry = 0;
      if (body.cacao_type === 'BABA') {
        netDry = +(body.gross_weight_kg * 0.33).toFixed(2);
      } else {
        const moisturePenalty = body.moisture_percentage > 7.5 ? (body.moisture_percentage - 7.5) / 100 : 0;
        netDry = +(body.gross_weight_kg * (1 - moisturePenalty)).toFixed(2);
      }

      // Quality grade multiplier
      const gradeMultiplier = body.quality_grade === 'A' ? 1.0 : body.quality_grade === 'B' ? 0.90 : 0.75;
      const finalPrice = +(body.base_price_per_kg_usdc * gradeMultiplier).toFixed(2);
      const totalUsdc = +(netDry * finalPrice).toFixed(2);
      const totalBob = +(totalUsdc * environment.exchangeRateBob).toFixed(2);

      const timestamp = Date.now();
      const code = `REC-AB-${producer.id}-${timestamp.toString().slice(-6)}`;
      const eudrCoords = `${producer.eudr_latitude},${producer.eudr_longitude}|PLOT:${producer.eudr_plot_code}`;
      
      const newDelivery: DeliveryResponse = {
        id: this.deliveriesState.length + 10,
        delivery_code: code,
        producer_id: producer.id,
        producer_name: producer.name,
        cacao_type: body.cacao_type,
        gross_weight_kg: body.gross_weight_kg,
        moisture_percentage: body.moisture_percentage,
        net_dry_weight_kg: netDry,
        quality_grade: body.quality_grade,
        base_price_per_kg_usdc: body.base_price_per_kg_usdc,
        final_price_per_kg_usdc: finalPrice,
        total_amount_usdc: totalUsdc,
        total_amount_bob: totalBob,
        eudr_coords: eudrCoords,
        payload_hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        stellar_tx_hash: '9f' + Array.from({ length: 62 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        status: 'NOTARIZED',
        created_at: new Date().toISOString(),
      };

      this.deliveriesState.unshift(newDelivery);
      return newDelivery;
    });
  }

  getDeliveries(limit = 50, offset = 0): Observable<DeliveryListResponse> {
    return this.api.get<DeliveryListResponse>(`/deliveries?limit=${limit}&offset=${offset}`, () => {
      return {
        total: this.deliveriesState.length,
        items: this.deliveriesState.slice(offset, offset + limit),
      };
    });
  }
}
