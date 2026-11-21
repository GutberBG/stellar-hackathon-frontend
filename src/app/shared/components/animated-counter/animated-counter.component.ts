import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-counter.component.html',
  styleUrl: './animated-counter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedCounterComponent implements OnChanges {
  @Input() value: number = 0;
  @Input() duration: number = 650;
  @Input() decimals: number = 2;
  @Input() prefix: string = '';
  @Input() suffix: string = '';
  @Input() valueClass: string = '';

  protected displayValue = signal<string>('0.00');
  private startValue = 0;
  private animationFrameId: number | null = null;
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const prev = changes['value'].previousValue ?? this.startValue;
      const current = changes['value'].currentValue ?? 0;
      this.animateValue(Number(prev), Number(current));
    }
  }

  private animateValue(from: number, to: number): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const startTime = performance.now();
    const duration = this.duration;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = from + (to - from) * easeProgress;

      this.displayValue.set(
        new Intl.NumberFormat('es-BO', {
          minimumFractionDigits: this.decimals,
          maximumFractionDigits: this.decimals,
        }).format(current)
      );

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(tick);
      } else {
        this.startValue = to;
        this.displayValue.set(
          new Intl.NumberFormat('es-BO', {
            minimumFractionDigits: this.decimals,
            maximumFractionDigits: this.decimals,
          }).format(to)
        );
      }
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }
}
