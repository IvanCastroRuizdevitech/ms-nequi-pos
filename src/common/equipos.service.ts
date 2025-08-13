import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface EquipoData {
  id: number;
  empresas_id: number;
  serial_equipo: string;
  mac: string;
  ip: string;
  port: string;
  token: string;
  password: string;
  autorizado: string;
}

@Injectable()
export class EquiposService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Obtiene los datos de un equipo por su MAC address
   * @param mac MAC address del equipo
   * @returns Datos del equipo o null si no se encuentra
   */
  async obtenerEquipoPorMac(mac: string): Promise<EquipoData | null> {
    const query = `
      SELECT 
        id,
        empresas_id,
        serial_equipo,
        mac,
        ip,
        port,
        token,
        password,
        autorizado
      FROM public.equipos 
      WHERE mac = $1 AND estado = '1' AND autorizado = '1'
      LIMIT 1;
    `;
    
    try {
      const { rows } = await this.databaseService.query(query, [mac]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error obteniendo equipo por MAC:', error.message);
      throw new Error(`Error al obtener datos del equipo: ${error.message}`);
    }
  }

  /**
   * Obtiene los datos de un equipo por su serial
   * @param serial Serial del equipo
   * @returns Datos del equipo o null si no se encuentra
   */
  async obtenerEquipoPorSerial(serial: string): Promise<EquipoData | null> {
    const query = `
      SELECT 
        id,
        empresas_id,
        serial_equipo,
        mac,
        ip,
        port,
        token,
        password,
        autorizado
      FROM public.equipos 
      WHERE serial_equipo = $1 AND estado = '1' AND autorizado = '1'
      LIMIT 1;
    `;
    
    try {
      const { rows } = await this.databaseService.query(query, [serial]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error obteniendo equipo por serial:', error.message);
      throw new Error(`Error al obtener datos del equipo: ${error.message}`);
    }
  }

  /**
   * Obtiene los datos de un equipo por su ID
   * @param id ID del equipo
   * @returns Datos del equipo o null si no se encuentra
   */
  async obtenerEquipoPorId(id: number): Promise<EquipoData | null> {
    const query = `
      SELECT 
        id,
        empresas_id,
        serial_equipo,
        mac,
        ip,
        port,
        token,
        password,
        autorizado
      FROM public.equipos 
      WHERE id = $1 AND estado = '1' AND autorizado = '1'
      LIMIT 1;
    `;
    
    try {
      const { rows } = await this.databaseService.query(query, [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error obteniendo equipo por ID:', error.message);
      throw new Error(`Error al obtener datos del equipo: ${error.message}`);
    }
  }

  /**
   * Valida si un equipo está autorizado y activo
   * @param mac MAC address del equipo
   * @returns true si está autorizado, false en caso contrario
   */
  async validarEquipoAutorizado(mac: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM public.equipos 
      WHERE mac = $1 AND estado = '1' AND autorizado = '1';
    `;
    
    try {
      const { rows } = await this.databaseService.query(query, [mac]);
      return parseInt(rows[0].count) > 0;
    } catch (error) {
      console.error('Error validando autorización del equipo:', error.message);
      return false;
    }
  }

  /**
   * Obtiene los headers necesarios para las peticiones a demo-nequi-push
   * @param mac MAC address del equipo
   * @returns Headers con x-station-code y x-equipment-code
   */
  async obtenerHeadersEquipo(mac: string): Promise<{ 'x-station-code': string; 'x-equipment-code': string } | null> {
    const equipo = await this.obtenerEquipoPorMac(mac);
    
    if (!equipo) {
      return null;
    }

    return {
      'x-station-code': equipo.serial_equipo,
      'x-equipment-code': equipo.mac
    };
  }
}

