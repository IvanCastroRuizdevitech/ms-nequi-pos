import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Logger, 
  HttpException, 
  HttpStatus,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { NequiClientService } from '../nequi-client/nequi-client.service';
import { EquiposService } from '../common/equipos.service';
import {
  PosPaymentDto,
  PosCancelPaymentDto,
  PosReversePaymentDto,
  PosStatusDto,
  PosCreateQrDto,
  PosQrStatusDto,
  PosCancelQrDto
} from './dto/pos-payment.dto';

@Controller('pos')
@UsePipes(new ValidationPipe({ transform: true }))
export class PosController {
  private readonly logger = new Logger(PosController.name);

  constructor(
    private readonly nequiClientService: NequiClientService,
    private readonly equiposService: EquiposService,
  ) {}

  /**
   * Endpoint para enviar notificación push de pago
   */
  @Post('payment/send-push')
  async sendPushPayment(@Body() dto: PosPaymentDto) {
    try {
      this.logger.log(`Solicitud de pago push desde POS: ${dto.mac} para ${dto.phoneNumber}`);
      
      // Validar que el equipo esté autorizado
      const isAuthorized = await this.equiposService.validarEquipoAutorizado(dto.mac);
      if (!isAuthorized) {
        throw new HttpException(
          'Equipo no autorizado o no encontrado',
          HttpStatus.UNAUTHORIZED
        );
      }

      // Enviar la solicitud a demo-nequi-push
      const result = await this.nequiClientService.sendPushNotification(
        { phoneNumber: dto.phoneNumber, value: dto.value },
        dto.mac
      );

      this.logger.log(`Pago push procesado exitosamente para equipo ${dto.mac}`);
      return {
        success: true,
        message: 'Notificación push enviada exitosamente',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error procesando pago push: ${error.message}`);
      throw new HttpException(
        error.message || 'Error interno del servidor',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para cancelar notificación push
   */
  @Post('payment/cancel-push')
  async cancelPushPayment(@Body() dto: PosCancelPaymentDto) {
    try {
      this.logger.log(`Solicitud de cancelación desde POS: ${dto.mac} para transacción ${dto.transactionId}`);
      
      // Validar que el equipo esté autorizado
      const isAuthorized = await this.equiposService.validarEquipoAutorizado(dto.mac);
      if (!isAuthorized) {
        throw new HttpException(
          'Equipo no autorizado o no encontrado',
          HttpStatus.UNAUTHORIZED
        );
      }

      // Enviar la solicitud a demo-nequi-push
      const result = await this.nequiClientService.cancelPushNotification(
        { transactionId: dto.transactionId },
        dto.mac
      );

      this.logger.log(`Cancelación procesada exitosamente para equipo ${dto.mac}`);
      return {
        success: true,
        message: 'Notificación push cancelada exitosamente',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error cancelando pago push: ${error.message}`);
      throw new HttpException(
        error.message || 'Error interno del servidor',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para consultar estado de transacción
   */
  @Get('payment/status/:transactionId/:mac')
  async getPaymentStatus(@Param('transactionId') transactionId: string, @Param('mac') mac: string) {
    try {
      this.logger.log(`Consulta de estado desde POS: ${mac} para transacción ${transactionId}`);
      
      // Validar que el equipo esté autorizado
      const isAuthorized = await this.equiposService.validarEquipoAutorizado(mac);
      if (!isAuthorized) {
        throw new HttpException(
          'Equipo no autorizado o no encontrado',
          HttpStatus.UNAUTHORIZED
        );
      }

      // Consultar el estado en demo-nequi-push
      const result = await this.nequiClientService.getTransactionStatus(transactionId, mac);

      this.logger.log(`Estado consultado exitosamente para equipo ${mac}`);
      return {
        success: true,
        message: 'Estado de transacción consultado exitosamente',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error consultando estado: ${error.message}`);
      throw new HttpException(
        error.message || 'Error interno del servidor',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para revertir transacción
   */
  @Post('payment/reverse')
  async reversePayment(@Body() dto: PosReversePaymentDto) {
    try {
      this.logger.log(`Solicitud de reversión desde POS: ${dto.mac} para transacción ${dto.transactionId}`);
      
      // Validar que el equipo esté autorizado
      const isAuthorized = await this.equiposService.validarEquipoAutorizado(dto.mac);
      if (!isAuthorized) {
        throw new HttpException(
          'Equipo no autorizado o no encontrado',
          HttpStatus.UNAUTHORIZED
        );
      }

      // Enviar la solicitud a demo-nequi-push
      const result = await this.nequiClientService.reverseTransaction(
        { transactionId: dto.transactionId },
        dto.mac
      );

      this.logger.log(`Reversión procesada exitosamente para equipo ${dto.mac}`);
      return {
        success: true,
        message: 'Transacción revertida exitosamente',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error revirtiendo transacción: ${error.message}`);
      throw new HttpException(
        error.message || 'Error interno del servidor',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para crear código QR
   */
  @Post('qr/create')
  async createQr(@Body() dto: PosCreateQrDto) {
    try {
      this.logger.log(`Solicitud de creación QR desde POS: ${dto.mac} para ${dto.phoneNumber}`);
      
      // Validar que el equipo esté autorizado
      const isAuthorized = await this.equiposService.validarEquipoAutorizado(dto.mac);
      if (!isAuthorized) {
        throw new HttpException(
          'Equipo no autorizado o no encontrado',
          HttpStatus.UNAUTHORIZED
        );
      }

      // Enviar la solicitud a demo-nequi-push
      const result = await this.nequiClientService.createQr(
        { phoneNumber: dto.phoneNumber, value: dto.value },
        dto.mac
      );

      this.logger.log(`QR creado exitosamente para equipo ${dto.mac}`);
      return {
        success: true,
        message: 'Código QR creado exitosamente',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error creando QR: ${error.message}`);
      throw new HttpException(
        error.message || 'Error interno del servidor',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para consultar estado de QR
   */
  @Get('qr/status/:qrId/:mac')
  async getQrStatus(@Param('qrId') qrId: string, @Param('mac') mac: string) {
    try {
      this.logger.log(`Consulta de estado QR desde POS: ${mac} para QR ${qrId}`);
      
      // Validar que el equipo esté autorizado
      const isAuthorized = await this.equiposService.validarEquipoAutorizado(mac);
      if (!isAuthorized) {
        throw new HttpException(
          'Equipo no autorizado o no encontrado',
          HttpStatus.UNAUTHORIZED
        );
      }

      // Consultar el estado en demo-nequi-push
      const result = await this.nequiClientService.getQrStatus(qrId, mac);

      this.logger.log(`Estado QR consultado exitosamente para equipo ${mac}`);
      return {
        success: true,
        message: 'Estado de QR consultado exitosamente',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error consultando estado QR: ${error.message}`);
      throw new HttpException(
        error.message || 'Error interno del servidor',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para cancelar código QR
   */
  @Post('qr/cancel')
  async cancelQr(@Body() dto: PosCancelQrDto) {
    try {
      this.logger.log(`Solicitud de cancelación QR desde POS: ${dto.mac} para QR ${dto.qrId}`);
      
      // Validar que el equipo esté autorizado
      const isAuthorized = await this.equiposService.validarEquipoAutorizado(dto.mac);
      if (!isAuthorized) {
        throw new HttpException(
          'Equipo no autorizado o no encontrado',
          HttpStatus.UNAUTHORIZED
        );
      }

      // Enviar la solicitud a demo-nequi-push
      const result = await this.nequiClientService.cancelQr(dto.qrId, dto.mac);

      this.logger.log(`QR cancelado exitosamente para equipo ${dto.mac}`);
      return {
        success: true,
        message: 'Código QR cancelado exitosamente',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error cancelando QR: ${error.message}`);
      throw new HttpException(
        error.message || 'Error interno del servidor',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para validar que un equipo esté autorizado
   */
  @Get('equipment/validate/:mac')
  async validateEquipment(@Param('mac') mac: string) {
    try {
      this.logger.log(`Validación de equipo: ${mac}`);
      
      const isAuthorized = await this.equiposService.validarEquipoAutorizado(mac);
      const equipoData = isAuthorized ? await this.equiposService.obtenerEquipoPorMac(mac) : null;

      return {
        success: true,
        authorized: isAuthorized,
        equipment: equipoData ? {
          id: equipoData.id,
          serial: equipoData.serial_equipo,
          mac: equipoData.mac,
          ip: equipoData.ip,
          port: equipoData.port
        } : null
      };
    } catch (error) {
      this.logger.error(`Error validando equipo: ${error.message}`);
      throw new HttpException(
        error.message || 'Error interno del servidor',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

