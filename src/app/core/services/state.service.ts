import { Injectable, signal, computed } from '@angular/core';
import { Producer, ProducerDetail } from '../models/producer.model';
import { FactoringSimulateResponse } from '../models/factoring.model';
import { INITIAL_PRODUCERS } from './mock-data';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  public readonly producers = signal<ProducerDetail[]>(INITIAL_PRODUCERS);
  public readonly selectedProducerId = signal<number>(1);
  
  public readonly selectedProducer = computed<ProducerDetail>(() => {
    const list = this.producers();
    const id = this.selectedProducerId();
    return list.find((p) => p.id === id) || list[0];
  });

  public readonly vaquitaAvailableLiquidity = signal<number>(25000);
  public readonly vaquitaTotalLiquidity = signal<number>(30000);

  // Transfer simulation state between View 2 (Oracle) and View 3 (Settlement)
  public readonly pendingSimulation = signal<FactoringSimulateResponse | null>(null);

  setSelectedProducerId(id: number): void {
    this.selectedProducerId.set(id);
  }

  setPendingSimulation(sim: FactoringSimulateResponse | null): void {
    this.pendingSimulation.set(sim);
  }

  updateLiquidity(available: number, total: number): void {
    this.vaquitaAvailableLiquidity.set(available);
    this.vaquitaTotalLiquidity.set(total);
  }
}
