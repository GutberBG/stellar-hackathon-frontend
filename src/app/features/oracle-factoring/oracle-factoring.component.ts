import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ProducerService } from '../../core/services/producer.service';
import { FactoringService } from '../../core/services/factoring.service';
import { StateService } from '../../core/services/state.service';
import { ProducerDetail } from '../../core/models/producer.model';
import { FactoringSimulateRequest, FactoringSimulateResponse } from '../../core/models/factoring.model';
import { AnimatedCounterComponent } from '../../shared/components/animated-counter/animated-counter.component';

@Component({
  selector: 'app-oracle-factoring',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AnimatedCounterComponent,
  ],
  templateUrl: './oracle-factoring.component.html',
  styleUrl: './oracle-factoring.component.css',
})
export class OracleFactoringComponent implements OnInit {
  private producerService = inject(ProducerService);
  private factoringService = inject(FactoringService);
  private state = inject(StateService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  protected allProducers = signal<ProducerDetail[]>(this.state.producers());
  protected selectedProducerId = signal<number>(1);

  protected rainfallMm: number = 160;
  protected humidityPct: number = 78;
  protected expectedHarvestKg: number = 1000;

  protected simulation = signal<FactoringSimulateResponse | null>(null);

  readonly gaugeCircumference = 2 * Math.PI * 36; // ~226.19

  private sliderSubject = new Subject<void>();

  protected currentProducer = computed(() => {
    const list = this.allProducers();
    const id = this.selectedProducerId();
    return list.find((p) => p.id === id) || list[0];
  });

  protected gaugeOffset = computed(() => {
    const score = this.simulation()?.risk_score || 22;
    const progress = Math.min(Math.max(score / 100, 0), 1);
    return this.gaugeCircumference * (1 - progress);
  });

  protected gaugeColor = computed(() => {
    const level = this.simulation()?.risk_level || 'BAJO';
    return level === 'BAJO' ? '#248A3D' : level === 'MEDIO' ? '#B25000' : '#D70015';
  });

  ngOnInit(): void {
    const sub = this.sliderSubject
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.runSimulation();
      });

    this.destroyRef.onDestroy(() => sub.unsubscribe());

    this.producerService.getProducers().subscribe(() => {
      this.producerService.getProducerById(this.state.selectedProducerId()).subscribe((detail) => {
        this.allProducers.set([detail]);
        this.selectedProducerId.set(detail.id);
        this.runSimulation();
      });
    });
  }

  onSliderChange(): void {
    this.sliderSubject.next();
  }

  onProducerChange(id: number | string): void {
    const numId = Number(id);
    this.selectedProducerId.set(numId);
    this.state.setSelectedProducerId(numId);
    this.producerService.getProducerById(numId).subscribe((detail) => {
      this.allProducers.set([detail]);
      this.runSimulation();
    });
  }

  runSimulation(): void {
    const req: FactoringSimulateRequest = {
      producer_id: this.selectedProducerId(),
      expected_harvest_kg: Number(this.expectedHarvestKg),
      rainfall_mm: Number(this.rainfallMm),
      humidity_pct: Number(this.humidityPct),
    };

    this.factoringService.simulate(req).subscribe({
      next: (resp) => {
        this.simulation.set(resp);
        this.state.setPendingSimulation(resp);
      },
      error: (err) => console.error('Error running simulation:', err),
    });
  }

  proceedToSettlement(): void {
    if (this.simulation()) {
      this.state.setPendingSimulation(this.simulation());
    }
    this.router.navigate(['/settlement']);
  }
}
