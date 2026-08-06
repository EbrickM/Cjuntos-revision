# 4. Plataforma Digital y Operaciones — B-Morï / Bonafide Ecosistema Digital

**Versión:** 1.0  
**Fecha:** Julio 2026  
**Confidencial — uso interno**

---

## 4.1 Puerta de Enlace API (API Gateway) de B-Morï

La plataforma B-Morï se articula en torno a una **API Gateway centralizada** que actúa como punto único de entrada para todas las operaciones digitales entre los tres actores del ecosistema: **Bonafide** (administrador del programa), **Contratantes** (empresas grandes o entidades públicas) y **PYMEs beneficiarias**.

### Arquitectura general

```
[PYME / App Móvil-Web]
        │
        ▼
┌──────────────────────────────┐
│      API Gateway B-Morï      │  ← Autenticación, enrutamiento,
│  (punto único de entrada)    │    limitación de tasa, trazabilidad
└────────────┬─────────────────┘
             │
     ┌───────┴────────┐
     ▼                ▼
[Servicio de       [Servicio de
 Facturación]       Créditos]
     │                │
     ▼                ▼
[Servicio de       [Servicio de
 Contratos]         Pagos / IPI]
             │
             ▼
   [Integraciones externas]
   SAP · ERP · Banca · KYC
```

### Funciones principales del Gateway

| Función | Descripción |
|---|---|
| **Autenticación** | OTP + JWT por sesión. Cada actor (Admin, Contratante, PYME) recibe un token de rol con permisos granulares. |
| **Enrutamiento** | Dirige cada petición al microservicio correspondiente (facturas, créditos, contratos, pagos). |
| **Control de tasa** | Limitación de solicitudes por actor para proteger la plataforma ante usos abusivos. |
| **Trazabilidad** | Registro de auditoría de todas las operaciones: quién, qué, cuándo, desde qué IP. |
| **Validación de esquema** | Verifica la integridad de los datos antes de que lleguen a los servicios internos. |
| **Cifrado en tránsito** | TLS 1.3 en todas las comunicaciones externas e internas. |

### Entornos

- **Desarrollo / Staging:** Prototipo funcional de interfaz web desplegado en contenedor Docker + Nginx.
- **Producción (roadmap):** API Gateway sobre infraestructura cloud con alta disponibilidad, logs centralizados y monitoreo en tiempo real.

---

## 4.2 Flujo de Trabajo de Procesamiento de Facturas

B-Morï soporta dos modalidades de facturación:

### A) Facturación Inversa (principal)

Es el flujo estándar del programa: el Contratante genera u origina la factura en nombre de la PYME, que luego la valida y recibe el pago anticipado sobre ella.

```
 PYME / Contratante          Bonafide Admin            Sistema de Pago
       │                           │                         │
       │  1. Creación de factura   │                         │
       │  (FAC-2026-XXXX)          │                         │
       │──────────────────────────►│                         │
       │                           │                         │
       │  2. Envío formal          │                         │
       │  (estado: Enviada)        │                         │
       │──────────────────────────►│                         │
       │                           │ 3. Validación documental│
       │                           │    y de contrato        │
       │                           │─────────────────────────┤
       │                           │ 4. Aprobación           │
       │◄──────────────────────────│    (estado: Validada)   │
       │                           │                         │
       │  5. Emisión de IPI        │                         │
       │  (Instrucción de Pago     │────────────────────────►│
       │   Irrevocable)            │                         │
       │                           │                         │
       │  6. Liquidación           │                         │
       │◄──────────────────────────│◄────────────────────────│
       │  (estado: Pagada)         │                         │
```

**Estados del ciclo de vida:**

| Estado | Descripción |
|---|---|
| `Creada` | La factura ha sido registrada en el sistema con sus datos básicos. |
| `Enviada` | La PYME o el Contratante ha enviado formalmente la factura para revisión. |
| `Validada` | Bonafide ha verificado que la factura corresponde a un contrato activo y los datos son correctos. |
| `IPI Emitido` | Se ha generado la Instrucción de Pago Irrevocable. El pago está comprometido. |
| `Pagada` | El monto ha sido liquidado a la PYME. El ciclo está completo. |

### B) Facturación Directa

La PYME emite directamente la factura al Contratante. El flujo es más corto:

```
Creada → Enviada → Validada → Pagada
```

No genera IPI, ya que el pago sigue los términos contractuales ordinarios sin anticipo de liquidez.

---

### Tiempos de proceso estimados

| Etapa | Tiempo objetivo |
|---|---|
| Creación → Envío | Inmediato (autoservicio digital) |
| Envío → Validación | 24–48 horas hábiles |
| Validación → IPI Emitido | Mismo día hábil |
| IPI Emitido → Pago liquidado | 24–72 horas (según banco corresponsal) |

---

## 4.3 Facturas Certificadas e Instrucciones de Pago Irrevocables (IPI)

### ¿Qué es una Factura Certificada en B-Morï?

Una factura certificada es aquella que ha superado el proceso de validación de Bonafide y cumple los siguientes requisitos:

1. **Vinculada a un contrato activo** — existe un contrato registrado en el sistema (CTR-2026-XXXX) entre la PYME y el Contratante.
2. **Datos consistentes** — el monto, concepto y fechas coinciden con las condiciones del contrato.
3. **Documentación KYC vigente** — tanto la PYME como el Contratante tienen su perfil KYC aprobado y sin alertas.
4. **Dentro del límite de crédito** — el monto no excede el techo de crédito asignado al contrato.

Una vez certificada, la factura queda sellada digitalmente y no puede modificarse. Cualquier corrección requiere anulación y emisión de una nueva factura.

### Ejemplo de Factura Certificada

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  B-MORÏ · BONAFIDE ECOSISTEMA DIGITAL
  FACTURA CERTIFICADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  N.º Factura    : FAC-2026-1031
  Contrato ref.  : CTR-2026-002
  Estado         : Pagada ✓ Certificada

  EMISOR (PYME)
  Empresa        : Constructora Local GE, S.L.
  NIF/RUC        : GE-2020-00445
  Dirección      : Malabo, Bioko Norte, GE

  RECEPTOR (CONTRATANTE)
  Empresa        : Evans Construction & Engineering
  Concepto       : Construcción Fase 1 — Cimentación
  Período        : Abril 2026

  IMPORTE
  Monto neto     : XAF 18.000.000
  IVA (0% GE)    : XAF 0
  TOTAL FACTURA  : XAF 18.000.000

  Fecha emisión  : 15/04/2026
  Fecha vencim.  : 15/05/2026
  Fecha pago     : 22/04/2026 (anticipado vía IPI)

  Hash de integridad : a3f9c2...b74d1e
  Sello Bonafide     : VALIDADA Y CERTIFICADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ¿Qué es una IPI (Instrucción de Pago Irrevocable)?

La IPI es el instrumento clave del modelo de financiamiento de B-Morï. Es una orden de pago emitida por el Contratante, dirigida al banco corresponsal, instruyendo el pago **irrevocable** de una factura validada a favor de la PYME, con independencia de cualquier disputa comercial posterior.

**Características de la IPI:**

- **Irrevocable:** Una vez emitida y aceptada por el banco, el Contratante no puede cancelarla unilateralmente.
- **Vinculada a factura:** Cada IPI referencia exactamente una factura certificada.
- **Garante de liquidez:** Permite a Bonafide anticipar el pago a la PYME antes del vencimiento de la factura.
- **Trazable:** Registrada en la plataforma con número de serie único.

### Ejemplo de IPI

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  INSTRUCCIÓN DE PAGO IRREVOCABLE (IPI)
  B-MORÏ · BONAFIDE ECOSISTEMA DIGITAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  N.º IPI        : IPI-2026-0089
  Factura ref.   : FAC-2026-1031
  Contrato ref.  : CTR-2026-002
  Fecha emisión  : 18/04/2026
  Estado         : EJECUTADA

  ORDENANTE (CONTRATANTE)
  Razón social   : Evans Construction & Engineering
  Banco          : BGFI Bank Guinea Ecuatorial
  Cuenta IBAN    : GQ XX XXXX XXXX XXXX XXXX

  BENEFICIARIO (PYME)
  Razón social   : Constructora Local GE, S.L.
  Banco destino  : CCEI Bank GE
  Cuenta IBAN    : GQ XX XXXX XXXX XXXX XXXX

  INSTRUCCIÓN
  El Ordenante instruye irrevocablemente al banco
  indicado que transfiera al Beneficiario el importe
  de XAF 18.000.000 con fecha valor 22/04/2026,
  en concepto de liquidación de la factura
  FAC-2026-1031, correspondiente al contrato
  CTR-2026-002 activo en la plataforma B-Morï.

  Esta instrucción no podrá ser revocada ni
  modificada por el Ordenante una vez aceptada
  por la entidad bancaria.

  Firma digital Bonafide: [SELLO ELECTRÓNICO]
  Hash de trazabilidad  : c7a1b3...f92e44
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 4.4 Capacidades de Integración con Sistemas ERP Corporativos

### Principio de integración

La arquitectura de B-Morï está diseñada para ser **agnóstica al ERP** del Contratante. La plataforma expone una API REST documentada (OpenAPI 3.0) que permite a cualquier sistema externo consultar, enviar y recibir datos de facturas, contratos y pagos.

### Integración con SAP

| Módulo SAP | Punto de integración B-Morï | Método |
|---|---|---|
| **FI (Finanzas)** | Sincronización de facturas de proveedores (PYMEs) | API REST → iDoc / BAPI |
| **MM (Gestión de materiales)** | Verificación de órdenes de compra vinculadas a contratos | Webhook saliente desde SAP |
| **AP (Cuentas a pagar)** | Confirmación de pagos / IPI emitidos | Notificación automática vía webhook |
| **CO (Controlling)** | Datos de contratos activos para imputación de costes | Consulta periódica (batch) |

**Flujo de integración SAP ↔ B-Morï:**

```
SAP (Contratante)                 B-Morï API Gateway
      │                                  │
      │  1. Orden de compra aprobada     │
      │─────────────────────────────────►│
      │                                  │  2. Crea/actualiza contrato
      │                                  │     en la plataforma
      │                                  │
      │  3. PYME emite factura en B-Morï │
      │◄─────────────────────────────────│  (webhook a SAP)
      │                                  │
      │  4. SAP registra factura         │
      │     en módulo FI (cta. pagar)    │
      │─────────────────────────────────►│  Confirma validación
      │                                  │
      │  5. B-Morï emite IPI             │
      │◄─────────────────────────────────│  (webhook a SAP)
      │                                  │
      │  6. SAP registra pago            │
      │     y cierra posición FI         │
```

### Integración con otros ERPs

| Sistema | Estado de integración |
|---|---|
| **SAP S/4HANA / ECC** | Diseñado — conector en desarrollo |
| **Microsoft Dynamics 365** | Compatible vía API REST estándar |
| **Oracle NetSuite** | Compatible vía API REST estándar |
| **Odoo** | Compatible vía API REST estándar |
| **ERPs locales / a medida** | Compatible mediante webhooks configurables |

### Modalidades de integración disponibles

1. **API REST (síncrona):** Para consultas en tiempo real — estado de facturas, saldos de crédito disponible, contratos activos.
2. **Webhooks (asíncrona):** Notificaciones automáticas ante eventos clave — factura validada, IPI emitido, pago ejecutado.
3. **Batch / Reconciliación (programada):** Exportación periódica de datos en formato CSV/JSON/XML para carga masiva en ERP.
4. **Portal manual:** Para Contratantes sin ERP propio, la plataforma web B-Morï ofrece las mismas operaciones a través de su interfaz.

### Seguridad en integraciones

- **Autenticación:** OAuth 2.0 (Client Credentials) para integraciones máquina a máquina.
- **Firma de webhooks:** Cada evento incluye firma HMAC-SHA256 para verificar origen.
- **IP Allowlisting:** Posibilidad de restringir conexiones a IPs corporativas del Contratante.
- **Entorno de sandbox:** Disponible para que los equipos IT de los Contratantes prueben la integración antes de producción.

---

## Resumen Ejecutivo — Sección 4

| Tema | Estado actual | Roadmap |
|---|---|---|
| Interfaz digital (web/móvil) | ✅ Prototipo funcional completo | Despliegue producción Q3 2026 |
| API Gateway | ✅ Arquitectura definida | Implementación backend Q3 2026 |
| Flujo de facturas (UI) | ✅ Operativo en prototipo | Conexión backend Q3 2026 |
| IPI digital | ✅ Flujo diseñado e integrado en UI | Firma electrónica legal Q4 2026 |
| Integración SAP | 🔄 Conector en desarrollo | Piloto con primer Contratante Q4 2026 |
| Integración otros ERPs | 📋 Especificación lista | Según demanda de Contratantes |

---

*Documento preparado por el equipo técnico de Bonafide Ecosistema Digital — LiderShore.*  
*Para consultas técnicas: informatica@lidershore.com*
