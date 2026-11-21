import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import {
  FactoringSimulateRequest,
  FactoringSimulateResponse,
  FactoringExecuteRequest,
  FactoringExecuteResponse,
  FactoringSettleResponse,
  LoanSummaryResponse,
} from '../models/factoring.model';
import { INITIAL_PRODUCERS, INITIAL_LOANS } from './mock-data';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FactoringService {
  private api = inject(ApiService);
  private loansState = [...INITIAL_LOANS];

  simulate(req: FactoringSimulateRequest): Observable<FactoringSimulateResponse> {
    return this.api.post<FactoringSimulateResponse>('/factoring/simulate', req, (body) => {
      const producer = INITIAL_PRODUCERS.find((p) => p.id === body.producer_id) || INITIAL_PRODUCERS[0];
      
      // Realistic agronomic & credit risk calculation
      let riskScore = 15.0; // Base baseline
      const riskFactors: string[] = [];

      // Rainfall effect (Alto Beni optimal is 140-180mm)
      if (body.rainfall_mm > 240) {
        riskScore += 35;
        riskFactors.push(`Precipitación excesiva (${body.rainfall_mm}mm): alto riesgo de Moniliophthora roreri (Moniliasis)`);
      } else if (body.rainfall_mm < 90) {
        riskScore += 20;
        riskFactors.push(`Déficit hídrico (${body.rainfall_mm}mm): estrés en fase de maduración de mazorcas`);
      } else {
        riskFactors.push(`Precipitación óptima en Alto Beni (${body.rainfall_mm}mm): microclima ideal`);
      }

      // Humidity effect
      if (body.humidity_pct > 85) {
        riskScore += 25;
        riskFactors.push(`Humedad relativa crítica (${body.humidity_pct}%): proliferación acelerada de hongos`);
      } else {
        riskFactors.push(`Humedad relativa controlada (${body.humidity_pct}%): ventilación agroforestal adecuada`);
      }

      // Producer compliance bonus
      if (producer.compliance_score >= 0.90) {
        riskScore -= 20;
        riskFactors.push(`Historial impecable en ${producer.cooperative} (${(producer.compliance_score * 100).toFixed(0)}% cumplimiento)`);
      } else if (producer.compliance_score < 0.65) {
        riskScore += 25;
        riskFactors.push(`Historial crediticio con entregas irregulares en campañas pasadas`);
      }

      riskScore = Math.max(5, Math.min(95, riskScore));
      const riskLevel = riskScore < 35 ? 'BAJO' : riskScore < 65 ? 'MEDIO' : 'ALTO';

      // Approved advance percentage: low risk = 50-60%, medium = 30-40%, high = 15-20%
      const advancePct = riskLevel === 'BAJO' ? 0.55 : riskLevel === 'MEDIO' ? 0.35 : 0.18;
      const harvestValueUsdc = +(body.expected_harvest_kg * environment.defaultBasePriceUsdc).toFixed(2);
      const maxAdvanceUsdc = +(harvestValueUsdc * advancePct).toFixed(2);
      const maxAdvanceBob = +(maxAdvanceUsdc * environment.exchangeRateBob).toFixed(2);

      return {
        producer_id: producer.id,
        producer_name: producer.name,
        community: producer.community,
        cooperative: producer.cooperative,
        expected_harvest_kg: body.expected_harvest_kg,
        risk_score: +riskScore.toFixed(1),
        risk_level: riskLevel,
        approved_advance_pct: +(advancePct * 100).toFixed(0),
        estimated_harvest_value_usdc: harvestValueUsdc,
        max_advance_usdc: maxAdvanceUsdc,
        max_advance_bob: maxAdvanceBob,
        risk_factors: riskFactors,
      };
    });
  }

  execute(req: FactoringExecuteRequest): Observable<FactoringExecuteResponse> {
    return this.api.post<FactoringExecuteResponse>('/factoring/execute', req, (body) => {
      const producer = INITIAL_PRODUCERS.find((p) => p.id === body.producer_id) || INITIAL_PRODUCERS[0];
      const timestamp = Date.now();
      const loanCode = `LOAN-AB-${producer.id}-${timestamp.toString().slice(-6)}`;
      const approvedUsdc = body.requested_amount_usdc;
      const amountBob = +(approvedUsdc * environment.exchangeRateBob).toFixed(2);

      // Simple QR official Bolivian banking format payload string
      const qrPayload = `00020101021243650014bo.gob.bcb.qr0110AYNICACAO0208${loanCode}53030685408${amountBob.toFixed(2)}5802BO5916${producer.name.slice(0, 16)}6009LA PAZ62250121AYNI-FACTORING-HARVEST63047A2B`;

      const response: FactoringExecuteResponse = {
        loan_id: this.loansState.length + 10,
        loan_code: loanCode,
        producer_id: producer.id,
        producer_name: producer.name,
        requested_amount_usdc: body.requested_amount_usdc,
        approved_amount_usdc: approvedUsdc,
        amount_bob: amountBob,
        risk_score: 22.5,
        risk_level: 'BAJO',
        status: 'ACTIVE_ESCROW',
        vaquita_reservation_id: `VAQ-RES-${timestamp.toString().slice(-6)}`,
        trustless_escrow_id: `TW-ESCROW-AB-${timestamp.toString().slice(-6)}`,
        pollar_payout_id: `POL-PAY-${timestamp.toString().slice(-6)}`,
        pollar_qr_payload: qrPayload,
        qr_deep_link: `https://pollar.app/pay?payload=${encodeURIComponent(qrPayload)}`,
        created_at: new Date().toISOString(),
      };

      this.loansState.unshift({
        id: response.loan_id,
        loan_code: response.loan_code,
        producer_id: response.producer_id,
        producer_name: response.producer_name,
        requested_amount_usdc: response.requested_amount_usdc,
        approved_amount_usdc: response.approved_amount_usdc,
        amount_bob: response.amount_bob,
        risk_level: response.risk_level,
        status: 'ACTIVE_ESCROW',
        trustless_escrow_id: response.trustless_escrow_id,
        created_at: response.created_at,
      });

      return response;
    });
  }

  settle(loanId: number): Observable<FactoringSettleResponse> {
    return this.api.post<FactoringSettleResponse>(`/factoring/${loanId}/settle`, {}, () => {
      const loan = this.loansState.find((l) => l.id === loanId) || this.loansState[0];
      const principal = loan ? loan.approved_amount_usdc : 1500;
      const feeVaquita = +(principal * 0.02).toFixed(2);
      const feeAyni = +(principal * 0.005).toFixed(2);
      const totalSettled = +(principal + feeVaquita + feeAyni).toFixed(2);

      if (loan) {
        loan.status = 'SETTLED';
      }

      return {
        loan_id: loanId,
        loan_code: loan ? loan.loan_code : `LOAN-AB-${loanId}`,
        status: 'SETTLED',
        principal_usdc: principal,
        fee_vaquita_usdc: feeVaquita,
        fee_ayni_usdc: feeAyni,
        total_settled_usdc: totalSettled,
        trustless_settlement_tx: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        settled_at: new Date().toISOString(),
        message: 'Préstamo liquidado con éxito. Capital y 2% de rendimiento devueltos al Vaquita Pool.',
      };
    });
  }

  getActiveLoans(): Observable<LoanSummaryResponse[]> {
    return of(this.loansState);
  }
}
