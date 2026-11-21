import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-eudr-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eudr-map.component.html',
  styleUrl: './eudr-map.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EUDRMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() latitude: number = -15.5412;
  @Input() longitude: number = -67.3298;
  @Input() plotCode: string = 'BO-LPZ-AB-ELCEIBO-001';
  @Input() producerName: string = 'Mateo Mamani Ticona';
  @Input() community: string = 'Sapecho (Alto Beni)';

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  protected isSatellite = signal<boolean>(true);
  private map: L.Map | null = null;
  private currentMarker: L.Marker | null = null;
  private currentPolygon: L.Polygon | null = null;
  private currentTileLayer: L.TileLayer | null = null;

  private satelliteLayerUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  private topoLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['latitude'] || changes['longitude']) && this.map) {
      this.updateMapPosition();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  protected toggleTileLayer(): void {
    this.isSatellite.set(!this.isSatellite());
    if (this.map && this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
      const url = this.isSatellite() ? this.satelliteLayerUrl : this.topoLayerUrl;
      const attribution = this.isSatellite() ? '© Esri' : '© OpenStreetMap';
      this.currentTileLayer = L.tileLayer(url, { maxZoom: 18, attribution }).addTo(this.map);
    }
  }

  private initMap(): void {
    if (!this.mapContainer || this.map) return;

    const lat = this.latitude || -15.5412;
    const lng = this.longitude || -67.3298;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.currentTileLayer = L.tileLayer(this.satelliteLayerUrl, {
      maxZoom: 18,
      attribution: '© Esri',
    }).addTo(this.map);

    this.renderPlotAndMarker(lat, lng);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  private updateMapPosition(): void {
    if (!this.map) return;
    const lat = this.latitude;
    const lng = this.longitude;
    this.map.flyTo([lat, lng], 15, { duration: 1.0 });
    this.renderPlotAndMarker(lat, lng);
  }

  private renderPlotAndMarker(lat: number, lng: number): void {
    if (!this.map) return;

    if (this.currentMarker) this.map.removeLayer(this.currentMarker);
    if (this.currentPolygon) this.map.removeLayer(this.currentPolygon);

    const deltaLat = 0.0022;
    const deltaLng = 0.0028;
    const polygonCoords: [number, number][] = [
      [lat - deltaLat, lng - deltaLng],
      [lat - deltaLat * 0.4, lng + deltaLng * 1.1],
      [lat + deltaLat * 0.9, lng + deltaLng * 0.7],
      [lat + deltaLat * 1.1, lng - deltaLng * 0.6],
      [lat + deltaLat * 0.3, lng - deltaLng * 1.2],
    ];

    this.currentPolygon = L.polygon(polygonCoords, {
      color: '#248A3D',
      weight: 1.5,
      fillColor: '#248A3D',
      fillOpacity: 0.18,
      dashArray: '3, 4',
    }).addTo(this.map);

    const customIcon = L.divIcon({
      className: 'apple-map-pin',
      html: `
        <div class="w-4 h-4 rounded-full bg-[#1D1D1F] border-2 border-white shadow-sm flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <div class="w-1.5 h-1.5 rounded-full bg-[#248A3D]"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    this.currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);

    const popupHtml = `
      <div style="font-family: -apple-system, sans-serif; font-size: 11px; padding: 2px;">
        <div style="color: #248A3D; font-weight: 600; text-transform: uppercase;">EUDR Verificado</div>
        <div style="font-weight: 600; color: #1D1D1F; font-size: 12px;">${this.producerName}</div>
        <div style="color: #86868B;">${this.community}</div>
      </div>
    `;

    this.currentMarker.bindPopup(popupHtml);
  }
}
