import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EquiposService } from '../common/equipos.service';

export interface SendPushNotificationDto {
  phoneNumber: string;
  value: number;
}

export interface CancelPushNotificationDto {
  transactionId: string;
}

export interface ReverseTransactionDto {
  transactionId: string;
}

export interface CreateQrDto {
  phoneNumber: string;
  value: number;
}

@Injectable()
export class NequiClientService {
  private readonly logger = new Logger(NequiClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly equiposService: EquiposService,
  ) {
    this.baseUrl = process.env.DEMO_NEQUI_PUSH_URL || 'http://localhost:3000';
  }

  /**
   * Obtiene los headers necesarios para las peticiones incluyendo datos del equipo
   */
  private async getHeaders(mac: string): Promise<Record<string, string>> {
    const equipoHeaders = await this.equiposService.obtenerHeadersEquipo(mac);
    
    if (!equipoHeaders) {
      throw new Error('Equipo no encontrado o no autorizado');
    }

    return {
      'Content-Type': 'application/json',
      'x-station-code': equipoHeaders['x-station-code'],
      'x-equipment-code': equipoHeaders['x-equipment-code'],
    };
  }

  /**
   * Envía una notificación push de pago a través de demo-nequi-push
   */
  async sendPushNotification(dto: SendPushNotificationDto, mac: string): Promise<any> {
    try {
      this.logger.log(`Enviando notificación push para ${dto.phoneNumber} desde equipo ${mac}`);
      
      const headers = await this.getHeaders(mac);
      const url = `${this.baseUrl}/payments/send-push`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, dto, { headers })
      );

      this.logger.log(`Notificación push enviada exitosamente: ${response.data?.transactionId || 'N/A'}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error enviando notificación push: ${error.message}`);
      throw new Error(`Error al enviar notificación push: ${error.message}`);
    }
  }

  /**
   * Cancela una notificación push a través de demo-nequi-push
   */
  async cancelPushNotification(dto: CancelPushNotificationDto, mac: string): Promise<any> {
    try {
      this.logger.log(`Cancelando notificación push ${dto.transactionId} desde equipo ${mac}`);
      
      const headers = await this.getHeaders(mac);
      const url = `${this.baseUrl}/payments/cancel-push`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, dto, { headers })
      );

      this.logger.log(`Notificación push cancelada exitosamente: ${dto.transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error cancelando notificación push: ${error.message}`);
      throw new Error(`Error al cancelar notificación push: ${error.message}`);
    }
  }

  /**
   * Consulta el estado de una transacción a través de demo-nequi-push
   */
  async getTransactionStatus(transactionId: string, mac: string): Promise<any> {
    try {
      this.logger.log(`Consultando estado de transacción ${transactionId} desde equipo ${mac}`);
      
      const headers = await this.getHeaders(mac);
      const url = `${this.baseUrl}/payments/status/${transactionId}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, { headers })
      );

      this.logger.log(`Estado de transacción consultado exitosamente: ${transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error consultando estado de transacción: ${error.message}`);
      throw new Error(`Error al consultar estado de transacción: ${error.message}`);
    }
  }

  /**
   * Revierte una transacción a través de demo-nequi-push
   */
  async reverseTransaction(dto: ReverseTransactionDto, mac: string): Promise<any> {
    try {
      this.logger.log(`Revirtiendo transacción ${dto.transactionId} desde equipo ${mac}`);
      
      const headers = await this.getHeaders(mac);
      const url = `${this.baseUrl}/payments/reverse`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, dto, { headers })
      );

      this.logger.log(`Transacción revertida exitosamente: ${dto.transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error revirtiendo transacción: ${error.message}`);
      throw new Error(`Error al revertir transacción: ${error.message}`);
    }
  }

  /**
   * Crea un código QR de pago a través de demo-nequi-push
   */
  async createQr(dto: CreateQrDto, mac: string): Promise<any> {
    try {
      this.logger.log(`Creando código QR para ${dto.phoneNumber} desde equipo ${mac}`);
      
      const headers = await this.getHeaders(mac);
      const url = `${this.baseUrl}/payments-qr/crear-qr`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, dto, { headers })
      );

      this.logger.log(`Código QR creado exitosamente`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error creando código QR: ${error.message}`);
      throw new Error(`Error al crear código QR: ${error.message}`);
    }
  }

  /**
   * Consulta el estado de un código QR a través de demo-nequi-push
   */
  async getQrStatus(qrId: string, mac: string): Promise<any> {
    try {
      this.logger.log(`Consultando estado de QR ${qrId} desde equipo ${mac}`);
      
      const headers = await this.getHeaders(mac);
      const url = `${this.baseUrl}/payments-qr/estado-qr/${qrId}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, { headers })
      );

      this.logger.log(`Estado de QR consultado exitosamente: ${qrId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error consultando estado de QR: ${error.message}`);
      throw new Error(`Error al consultar estado de QR: ${error.message}`);
    }
  }

  /**
   * Cancela un código QR a través de demo-nequi-push
   */
  async cancelQr(qrId: string, mac: string): Promise<any> {
    try {
      this.logger.log(`Cancelando código QR ${qrId} desde equipo ${mac}`);
      
      const headers = await this.getHeaders(mac);
      const url = `${this.baseUrl}/payments-qr/cancelar-qr/${qrId}`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, {}, { headers })
      );

      this.logger.log(`Código QR cancelado exitosamente: ${qrId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error cancelando código QR: ${error.message}`);
      throw new Error(`Error al cancelar código QR: ${error.message}`);
    }
  }
}

