# MS-Nequi-POS - Servicio Intermediario para Transacciones Nequi

## Descripción

MS-Nequi-POS es un microservicio NestJS que actúa como intermediario entre interfaces de punto de venta (POS) y el servicio `demo-nequi-push`. Este servicio se encarga de:

- Validar equipos POS autorizados mediante consulta a base de datos PostgreSQL
- Obtener credenciales y datos de configuración de equipos desde la tabla `equipos`
- Generar headers de autenticación (`x-station-code`, `x-equipment-code`) automáticamente
- Consumir las APIs del servicio `demo-nequi-push` para procesar transacciones Nequi
- Proporcionar endpoints REST simplificados para interfaces POS

## Arquitectura

```
[Interfaz POS] → [MS-Nequi-POS] → [Demo-Nequi-Push] → [Nequi API]
                      ↓
                [PostgreSQL DB]
                (Tabla equipos)
```

## Características Principales

### 🔐 Autenticación y Autorización
- Validación automática de equipos POS por MAC address
- Verificación de estado activo y autorización en base de datos
- Generación automática de headers de autenticación

### 🏪 Gestión de Equipos POS
- Consulta de datos de equipos desde tabla PostgreSQL
- Validación de equipos autorizados antes de procesar transacciones
- Soporte para múltiples equipos por empresa

### 💳 Operaciones de Pago
- **Pagos Push**: Envío de notificaciones push para pagos
- **Códigos QR**: Generación y gestión de códigos QR de pago
- **Consulta de Estado**: Verificación del estado de transacciones
- **Cancelaciones**: Cancelación de pagos y códigos QR
- **Reversiones**: Reversión de transacciones completadas

### 🔄 Integración con Demo-Nequi-Push
- Cliente HTTP configurado para consumir APIs de `demo-nequi-push`
- Manejo automático de headers de autenticación
- Propagación de errores y respuestas
- Logging detallado de todas las operaciones

## Instalación y Configuración

### Prerrequisitos

- Node.js 22.13.1 o superior
- PostgreSQL con tabla `equipos` configurada
- Servicio `demo-nequi-push` ejecutándose

### 1. Clonar el Repositorio

```bash
git clone https://github.com/IvanCastroRuizdevitech/ms-nequi-pos.git
cd ms-nequi-pos
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copiar el archivo de ejemplo y configurar las variables:

```bash
cp .env.example .env
```

Editar el archivo `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=your_database
DB_SSL=false

# Demo Nequi Push Service Configuration
DEMO_NEQUI_PUSH_URL=http://localhost:3000

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 4. Verificar Base de Datos

Asegúrate de que la tabla `equipos` esté creada en PostgreSQL:

```sql
CREATE TABLE public.equipos (
    id int8 NOT NULL,
    empresas_id int8 NULL,
    serial_equipo varchar(255) NOT NULL,
    almacenamientos_id int8 NULL,
    estado varchar(1) NOT NULL,
    equipos_tipos_id int8 NULL,
    equipos_protocolos_id int8 NULL,
    mac varchar(50) NOT NULL,
    ip varchar(255) NULL,
    port varchar(255) NULL,
    create_user int4 NOT NULL,
    create_date timestamp NOT NULL,
    update_user int4 NULL,
    update_date timestamp NULL,
    "token" text NOT NULL,
    "password" text NOT NULL,
    factor_precio int4 NULL,
    factor_importe int4 NULL,
    factor_inventario int4 NULL,
    lector_ip varchar(50) NULL,
    lector_port int4 NULL,
    impresora_ip varchar(50) NULL,
    impresora_port int4 NULL,
    url_foto varchar(255) NULL,
    autorizado varchar(1) NOT NULL,
    CONSTRAINT equipos_pk PRIMARY KEY (id)
);
```

### 5. Ejecutar el Servicio

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El servicio estará disponible en: `http://localhost:3001/api`

## API Endpoints

### Validación de Equipos

#### Validar Equipo
```http
GET /api/pos/equipment/validate/{mac}
```

**Parámetros:**
- `mac`: MAC address del equipo POS

**Respuesta:**
```json
{
  "success": true,
  "authorized": true,
  "equipment": {
    "id": 1,
    "serial": "POS001",
    "mac": "00:11:22:33:44:55",
    "ip": "192.168.1.100",
    "port": "8080"
  }
}
```

### Operaciones de Pago Push

#### Enviar Notificación Push
```http
POST /api/pos/payment/send-push
```

**Body:**
```json
{
  "phoneNumber": "3001234567",
  "value": 50000,
  "mac": "00:11:22:33:44:55"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Notificación push enviada exitosamente",
  "data": {
    "transactionId": "TXN123456789",
    "status": "PENDING"
  }
}
```

#### Cancelar Notificación Push
```http
POST /api/pos/payment/cancel-push
```

**Body:**
```json
{
  "transactionId": "TXN123456789",
  "mac": "00:11:22:33:44:55"
}
```

#### Consultar Estado de Transacción
```http
GET /api/pos/payment/status/{transactionId}/{mac}
```

#### Revertir Transacción
```http
POST /api/pos/payment/reverse
```

**Body:**
```json
{
  "transactionId": "TXN123456789",
  "mac": "00:11:22:33:44:55"
}
```

### Operaciones de Códigos QR

#### Crear Código QR
```http
POST /api/pos/qr/create
```

**Body:**
```json
{
  "phoneNumber": "3001234567",
  "value": 25000,
  "mac": "00:11:22:33:44:55"
}
```

#### Consultar Estado de QR
```http
GET /api/pos/qr/status/{qrId}/{mac}
```

#### Cancelar Código QR
```http
POST /api/pos/qr/cancel
```

**Body:**
```json
{
  "qrId": "QR123456789",
  "mac": "00:11:22:33:44:55"
}
```

## Estructura del Proyecto

```
src/
├── common/
│   ├── equipos.service.ts      # Servicio para gestión de equipos
│   └── common.module.ts        # Módulo común
├── database/
│   ├── database.service.ts     # Servicio de conexión PostgreSQL
│   └── database.module.ts      # Módulo de base de datos
├── nequi-client/
│   ├── nequi-client.service.ts # Cliente para demo-nequi-push
│   └── nequi-client.module.ts  # Módulo cliente Nequi
├── pos/
│   ├── dto/
│   │   └── pos-payment.dto.ts  # DTOs para validación
│   ├── pos.controller.ts       # Controlador principal POS
│   └── pos.module.ts           # Módulo POS
├── app.module.ts               # Módulo principal
└── main.ts                     # Punto de entrada
```

## Validaciones y Seguridad

### Validación de Equipos
- Verificación de MAC address en tabla `equipos`
- Validación de estado activo (`estado = '1'`)
- Verificación de autorización (`autorizado = '1'`)

### Validación de Datos
- Validación automática de DTOs con `class-validator`
- Sanitización de datos de entrada
- Validación de tipos y formatos

### Manejo de Errores
- Logging detallado de errores
- Respuestas HTTP apropiadas
- Propagación controlada de errores desde `demo-nequi-push`

## Logging y Monitoreo

### Logs de Aplicación
- Registro de todas las operaciones POS
- Logging de validaciones de equipos
- Registro de llamadas a `demo-nequi-push`
- Logging de errores y excepciones

### Ejemplo de Logs
```
[PosController] Solicitud de pago push desde POS: 00:11:22:33:44:55 para 3001234567
[NequiClientService] Enviando notificación push para 3001234567 desde equipo 00:11:22:33:44:55
[NequiClientService] Notificación push enviada exitosamente: TXN123456789
```

## Desarrollo y Testing

### Ejecutar en Modo Desarrollo
```bash
npm run start:dev
```

### Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

### Linting y Formato
```bash
# Linting
npm run lint

# Formato
npm run format
```

## Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=3001
DB_HOST=your-production-db-host
DB_USERNAME=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_DATABASE=your-production-database
DEMO_NEQUI_PUSH_URL=https://your-demo-nequi-push-service.com
```

### Docker (Opcional)
```dockerfile
FROM node:22.13.1-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

## Integración con Demo-Nequi-Push

### Headers Automáticos
El servicio genera automáticamente los headers requeridos:
- `x-station-code`: Obtenido del campo `serial_equipo`
- `x-equipment-code`: Obtenido del campo `mac`

### Endpoints Consumidos
- `POST /payments/send-push` - Envío de notificaciones push
- `POST /payments/cancel-push` - Cancelación de notificaciones
- `GET /payments/status/:id` - Consulta de estado
- `POST /payments/reverse` - Reversión de transacciones
- `POST /payments-qr/crear-qr` - Creación de códigos QR
- `GET /payments-qr/estado-qr/:id` - Estado de códigos QR
- `POST /payments-qr/cancelar-qr/:id` - Cancelación de códigos QR

## Casos de Uso

### 1. Pago en POS Físico
1. POS envía solicitud de pago con MAC address
2. MS-Nequi-POS valida el equipo en base de datos
3. Se obtienen credenciales y se generan headers
4. Se envía solicitud a `demo-nequi-push`
5. Se retorna respuesta al POS

### 2. Validación de Equipo
1. POS solicita validación con MAC address
2. MS-Nequi-POS consulta tabla `equipos`
3. Se verifica estado y autorización
4. Se retorna información del equipo

### 3. Consulta de Estado
1. POS solicita estado de transacción
2. MS-Nequi-POS valida equipo
3. Se consulta estado en `demo-nequi-push`
4. Se retorna estado actualizado

## Troubleshooting

### Problemas Comunes

#### Error: "Equipo no autorizado o no encontrado"
- Verificar que el MAC address esté registrado en la tabla `equipos`
- Confirmar que `estado = '1'` y `autorizado = '1'`
- Revisar formato del MAC address

#### Error de Conexión a Base de Datos
- Verificar variables de entorno de base de datos
- Confirmar conectividad de red
- Revisar credenciales de PostgreSQL

#### Error de Conexión a Demo-Nequi-Push
- Verificar variable `DEMO_NEQUI_PUSH_URL`
- Confirmar que el servicio esté ejecutándose
- Revisar logs de red y conectividad

### Logs de Depuración
Activar logs detallados configurando:
```env
NODE_ENV=development
```

## Contribución

1. Fork del repositorio
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o reportar problemas:
- Crear issue en GitHub
- Contactar al equipo de desarrollo
- Revisar documentación de `demo-nequi-push`

---

**Autor:** IvanCastroRuizdevitech  
**Versión:** 1.0.0  
**Última actualización:** 2025-01-13

