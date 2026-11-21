import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProducerService } from '../../core/services/producer.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { StateService } from '../../core/services/state.service';
import { Producer } from '../../core/models/producer.model';
import { DeliveryCreateRequest, DeliveryResponse, CacaoType, QualityGrade } from '../../core/models/delivery.model';
import { EUDRMapComponent } from '../../shared/components/eudr-map/eudr-map.component';
import { StellarBadgeComponent } from '../../shared/components/stellar-badge/stellar-badge.component';
import { AnimatedCounterComponent } from '../../shared/components/animated-counter/animated-counter.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-acopio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EUDRMapComponent,
    StellarBadgeComponent,
    AnimatedCounterComponent,
  ],
  templateUrl: './acopio.component.html',
  styleUrl: './acopio.component.css',
})
export class AcopioComponent implements OnInit {
  private producerService = inject(ProducerService);
  private deliveryService = inject(DeliveryService);
  private state = inject(StateService);

  protected producers = signal<Producer[]>(this.state.producers());
  protected selectedProducerId = signal<number>(1);
  protected cacaoType = signal<CacaoType>('SECO');
  protected qualityGrade = signal<QualityGrade>('A');

  protected grossWeightKg: number = 850.0;
  protected moisturePercentage: number = 7.0;
  protected basePriceUsdc: number = environment.defaultBasePriceUsdc;

  protected isSubmitting = signal<boolean>(false);
  protected lastSavedDelivery = signal<DeliveryResponse | null>(null);

  readonly qualityGrades = [
    { grade: 'A' as QualityGrade, label: 'Exportación', factor: 1.0 },
    { grade: 'B' as QualityGrade, label: 'Estándar', factor: 0.90 },
    { grade: 'C' as QualityGrade, label: 'Segunda', factor: 0.75 },
  ];

  protected currentProducer = computed(() => {
    const list = this.producers();
    const id = this.selectedProducerId();
    return list.find((p) => p.id === id) || list[0];
  });

  protected qualityFactor = computed(() => {
    const g = this.qualityGrade();
    return g === 'A' ? 1.0 : g === 'B' ? 0.90 : 0.75;
  });

  protected liveNetDryWeight = computed(() => {
    const gross = this.grossWeightKg || 0;
    if (this.cacaoType() === 'BABA') {
      return +(gross * 0.33).toFixed(2);
    }
    const moisture = this.moisturePercentage || 0;
    const penalty = moisture > 7.5 ? (moisture - 7.5) / 100 : 0;
    return +(gross * (1 - penalty)).toFixed(2);
  });

  protected liveFinalPrice = computed(() => {
    return +(this.basePriceUsdc * this.qualityFactor()).toFixed(2);
  });

  protected liveTotalUsdc = computed(() => {
    return +(this.liveNetDryWeight() * this.liveFinalPrice()).toFixed(2);
  });

  protected liveTotalBob = computed(() => {
    return +(this.liveTotalUsdc() * environment.exchangeRateBob).toFixed(2);
  });

  protected liveDeliveryCode = computed(() => {
    return `REC-AB-${this.selectedProducerId()}-001`;
  });

  ngOnInit(): void {
    this.producerService.getProducers().subscribe((data) => {
      this.producers.set(data);
      if (data.length > 0) {
        this.selectedProducerId.set(data[0].id);
      }
    });
  }

  onProducerChange(id: number | string): void {
    const numId = Number(id);
    this.selectedProducerId.set(numId);
    this.state.setSelectedProducerId(numId);
  }

  setCacaoType(type: CacaoType): void {
    this.cacaoType.set(type);
    if (type === 'BABA') {
      this.moisturePercentage = 60.0;
    } else {
      this.moisturePercentage = 7.0;
    }
  }

  setQualityGrade(grade: QualityGrade): void {
    this.qualityGrade.set(grade);
  }

  submitDelivery(): void {
    this.isSubmitting.set(true);

    const req: DeliveryCreateRequest = {
      producer_id: this.selectedProducerId(),
      cacao_type: this.cacaoType(),
      gross_weight_kg: Number(this.grossWeightKg),
      moisture_percentage: Number(this.moisturePercentage),
      quality_grade: this.qualityGrade(),
      base_price_per_kg_usdc: Number(this.basePriceUsdc),
    };

    this.deliveryService.createDelivery(req).subscribe({
      next: (resp) => {
        this.lastSavedDelivery.set(resp);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error creating delivery:', err);
        this.isSubmitting.set(false);
      },
    });
  }
}
