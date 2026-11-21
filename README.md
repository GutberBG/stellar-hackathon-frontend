# Ayni Cacao — Frontend de Alta Precisión (Apple Design)

Plataforma de **acopio transparente de cacao**, **trazabilidad satelital EUDR (Cero Deforestación)** y **factoring agrícola predictivo** con liquidación bancaria en Bolivianos (Bs.) para cooperativas de Alto Beni y Palos Blancos, Bolivia.

Diseñado con estándar de calidad **Apple Design & Fintech de ultra-precisión** y construido sobre **Angular 21** con **Signals**, **Standalone Components**, **Tailwind CSS**, **Leaflet** y **Pollar Simple QR**.

---

## 🚀 Inicio Rápido (Quick Start)

### 1. Requisitos Previos
* **Node.js**: v18.x o superior (recomendado v20.x+)
* **npm**: v9.x o superior
* **Backend FastAPI (Opcional)**: Puede ejecutarse concurrentemente en `http://localhost:8000/api/v1` (o la app funcionará de forma automática en **Modo Local Autónomo** con datos hiperrealistas de Alto Beni).

### 2. Comandos para Levantar el Frontend

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm start
# O alternativamente:
npx ng serve
```

Abre tu navegador en:
👉 **`http://localhost:4200`**

---

## 🏛️ Arquitectura del Proyecto (`src/app/`)

```text
src/app/
├── core/
│   ├── models/          # Interfaces TypeScript estrictas (Producer, Delivery, Factoring, Dashboard)
│   ├── services/        # Servicios HTTP reactivos con auto-fallback inteligente:
│   │                    # - ProducerService (Socios de El Ceibo, Palos Blancos, Bella Vista)
│   │                    # - DeliveryService (Cálculo agronómico de merma y notarización Stellar)
│   │                    # - FactoringService (Simulación climática IA y ejecución DeFi)
│   │                    # - DashboardService (Métricas del pool Vaquita y contratos activos)
│   │                    # - StateService (Gestión de estado global reactivo mediante Signals)
│   └── animations/      # Transiciones de fluidas Apple Ease (cubic-bezier(0.22, 1, 0.36, 1))
├── shared/
│   ├── components/      # Componentes UI atómicos:
│   │                    # - AnimatedCounterComponent (Interpolación suave numérica tabular)
│   │                    # - EUDRMapComponent (Mapas satelitales/topográficos Leaflet con polígono de parcela)
│   │                    # - StellarBadgeComponent (Chip minimalista con copiado y enlace a Stellar Expert)
│   │                    # - QrReceiptCardComponent (Boleto físico/digital con QR real Pollar Simple en Bs.)
│   │                    # - SkeletonComponent (Placeholders de carga elegantes)
│   └── pipes/           # Formateadores financieros:
│                        # - CurrencyBobPipe (Formato en Bolivianos: Bs. 12,345.00)
│                        # - CurrencyUsdcPipe (Formato en USDC: $1,234.50 USDC)
│                        # - TruncateHashPipe (Truncado de hashes criptográficos: 9f83...c844)
└── features/
    ├── overview/        # Vista 0: Resumen Ejecutivo Bento Grid & Liquidez Pool Vaquita
    ├── acopio/          # Vista 1: Pesaje agronómico & Boleta Transparente (Stellar + EUDR Map)
    ├── oracle-factoring/# Vista 2: Oráculo Climático en Vivo con Sliders interactivos & Riesgo ML
    └── settlement/      # Vista 3: Ejecución DeFi (Vaquita -> Trustless Work -> Pollar QR) & Cierre de Contrato
```

---

## 🎨 Dirección de Arte (Estética Apple)

* **Lienzo Minimalista:** Blanco Alabastro (`#F5F5F7`), tarjetas blanco puro (`#FFFFFF`) con bordes hair-line (`1px solid rgba(0, 0, 0, 0.06)`).
* **Glassmorphism:** Barra de navegación superior flotante con `backdrop-blur-xl bg-white/80 border-b border-black/[0.06]`.
* **Tipografía:** SF Pro / Inter con números tabulares (`tabular-nums`) para precisión financiera y JetBrains Mono para hashes notarizados en Stellar.
* **Acentos Quirúrgicos:**
  * Verde Bosque / Esmeralda (`#15803D` / `#10B981`): Validación EUDR Cero Deforestación y riesgo bajo.
  * Ámbar Cacao (`#B45309` / `#D97706`): Indicadores de calidad física de grano y alertas climáticas.
  * Obsidiana (`#1D1D1F`): Botones primarios Apple con respuesta táctil `active:scale-[0.98]`.

---

## ⚡ Guía para la Demo (Flujo de 3 Minutos)

1. **Vista 0 (`/overview`):**
   * Observa el estado del **Pool de Liquidez Vaquita** ($25,000 USDC disponibles / $30,000 total) y el ticker en vivo de entregas notarizadas en Stellar.
2. **Vista 1 (`/acopio`):**
   * Selecciona a **Mateo Mamani Ticona** (Sapecho / El Ceibo).
   * Alterna el toggle iOS entre **Fresco en Baba** (factor automático 0.33) y **Fermentado y Seco** (merma automática si la humedad supera 7.5%).
   * Observa la actualización en tiempo real de la **Boleta Digital Transparente** y la parcela en el mapa satelital **Leaflet (EUDR Compliant)**.
   * Haz clic en **"Notarizar en Stellar & Emitir Boleta"**.
3. **Vista 2 (`/factoring`):**
   * Ajusta los **sliders del Oráculo Climático** (Precipitación, Humedad y Cosecha Esperada).
   * Observa cómo si la lluvia supera los 240 mm/mes o la humedad el 85%, el modelo ML recalcula el **Risk Score** alertando riesgo de *Moniliasis*.
   * Observa la cifra interpolada suavemente con `AnimatedCounter` y presiona **"Solicitar Adelanto Instantáneo"**.
4. **Vista 3 (`/settlement`):**
   * Confirma el monto pre-aprobado y presiona **"Ejecutar Desembolso DeFi"**.
   * Disfruta de la coreografía secuencial animada en 3 pasos:
     * *Paso 1: Reservando liquidez en Pool Vaquita...*
     * *Paso 2: Bloqueando garantía en Escrow Trustless Work...*
     * *Paso 3: Generando orden de pago QR en Pollar (Bs.)...*
   * Escanea o descarga el **Comprobante QR Bancario** emitido en Bolivianos (Bs.).
   * En la sección inferior, presiona **"Simular Venta y Cierre de Contrato"** para ver la distribución transparente de la comisión del 2.5% (2.0% retorno a LPs del Pool Vaquita y 0.5% fee de red).

---

## 🛠️ Compilación de Producción

```bash
npm run build
```

Genera el bundle optimizado en `dist/stellar-frontend`.
