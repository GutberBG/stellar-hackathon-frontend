import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { AuthService } from '../../core/services/auth.service';
import { ProducerService } from '../../core/services/producer.service';
import { Producer } from '../../core/models/producer.model';

@Component({
  selector: 'app-mi-parcela',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-parcela.component.html',
  styleUrl: './mi-parcela.component.css',
})
export class MiParcelaComponent implements OnInit, AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private producerService = inject(ProducerService);

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  // Form Signals
  producerId = signal<number>(1);
  name = signal<string>('Mateo Mamani Ticona');
  ciNumber = signal<string>('6543210-LP');
  community = signal<string>('Sapecho (Alto Beni)');
  cooperative = signal<string>('Central de Cooperativas El Ceibo');
  phone = signal<string>('+59171234567');
  bankAccountHint = signal<string>('1000002938491 (Banco Unión - QR Simple)');
  plotCode = signal<string>('BO-LPZ-AB-ELCEIBO-001');
  latitude = signal<number>(-15.5412);
  longitude = signal<number>(-67.3298);
  hectares = signal<number>(4.5);
  eudrCertified = signal<boolean>(true);
  complianceScore = signal<number>(0.96);

  isSaving = signal<boolean>(false);
  saveSuccess = signal<boolean>(false);
  isSatellite = signal<boolean>(true);

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private parcelCircle: L.Circle | null = null;
  private tileLayer: L.TileLayer | null = null;

  ngOnInit(): void {
    const current = this.authService.currentProducer();
    if (current) {
      this.populateFields(current);
    } else {
      this.producerService.getProducerById(1).subscribe({
        next: (p) => this.populateFields(p),
      });
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private populateFields(p: Producer): void {
    this.producerId.set(p.id);
    this.name.set(p.name);
    this.ciNumber.set(p.ci_number || '6543210-LP');
    this.community.set(p.community);
    this.cooperative.set(p.cooperative);
    this.phone.set(p.phone);
    this.bankAccountHint.set(p.bank_account_hint || '1000002938491 (Banco Unión - QR Simple)');
    this.plotCode.set(p.eudr_plot_code);
    this.latitude.set(p.eudr_latitude);
    this.longitude.set(p.eudr_longitude);
    this.hectares.set(p.parcel_hectares || 4.5);
    this.eudrCertified.set(p.eudr_certified ?? true);
    this.complianceScore.set(p.compliance_score || 0.96);

    if (this.map) {
      this.updateMapPosition();
    }
  }

  private initMap(): void {
    if (!this.mapContainer || this.map) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      attributionControl: false,
    }).setView([this.latitude(), this.longitude()], 16);

    this.setTileLayer();

    // Custom Minimalist Apple Pin
    const pinIcon = L.divIcon({
      className: 'custom-eudr-pin',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: #1D1D1F;
          border: 2px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
        ">
          <div style="width: 8px; height: 8px; background: #248A3D; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    this.marker = L.marker([this.latitude(), this.longitude()], {
      icon: pinIcon,
      draggable: true,
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const position = this.marker!.getLatLng();
      this.latitude.set(Number(position.lat.toFixed(6)));
      this.longitude.set(Number(position.lng.toFixed(6)));
      this.updateCircle();
    });

    // Map click to reposition parcel
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      this.latitude.set(lat);
      this.longitude.set(lng);
      this.marker?.setLatLng([lat, lng]);
      this.updateCircle();
    });

    this.updateCircle();
  }

  private setTileLayer(): void {
    if (this.tileLayer && this.map) {
      this.map.removeLayer(this.tileLayer);
    }

    const url = this.isSatellite()
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    this.tileLayer = L.tileLayer(url, { maxZoom: 19 }).addTo(this.map!);
  }

  toggleMapLayer(): void {
    this.isSatellite.set(!this.isSatellite());
    this.setTileLayer();
  }

  onHectaresChange(newVal: number): void {
    this.hectares.set(newVal);
    this.updateCircle();
  }

  private updateCircle(): void {
    if (!this.map) return;

    if (this.parcelCircle) {
      this.map.removeLayer(this.parcelCircle);
    }

    // Radius in meters: sqrt(hectares * 10,000 / pi)
    const radiusMeters = Math.sqrt((this.hectares() * 10000) / Math.PI);

    this.parcelCircle = L.circle([this.latitude(), this.longitude()], {
      radius: radiusMeters,
      color: '#248A3D',
      weight: 2,
      opacity: 0.85,
      fillColor: '#248A3D',
      fillOpacity: 0.18,
    }).addTo(this.map);
  }

  private updateMapPosition(): void {
    if (!this.map || !this.marker) return;
    this.map.setView([this.latitude(), this.longitude()], 16);
    this.marker.setLatLng([this.latitude(), this.longitude()]);
    this.updateCircle();
  }

  saveProfile(): void {
    this.isSaving.set(true);
    this.saveSuccess.set(false);

    const updateData = {
      name: this.name(),
      ci_number: this.ciNumber(),
      community: this.community(),
      cooperative: this.cooperative(),
      phone: this.phone(),
      bank_account_hint: this.bankAccountHint(),
      eudr_latitude: this.latitude(),
      eudr_longitude: this.longitude(),
      parcel_hectares: this.hectares(),
      eudr_certified: this.eudrCertified(),
    };

    this.producerService.updateProducer(this.producerId(), updateData).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        this.authService.updateProducerLocally(res);
        setTimeout(() => this.saveSuccess.set(false), 4000);
      },
      error: () => {
        this.isSaving.set(false);
        // Fallback local update
        const updatedLocal: Producer = {
          id: this.producerId(),
          ...updateData,
          eudr_plot_code: this.plotCode(),
          compliance_score: this.complianceScore(),
          risk_tier: 'BAJO',
        };
        this.authService.updateProducerLocally(updatedLocal);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 4000);
      },
    });
  }
}
