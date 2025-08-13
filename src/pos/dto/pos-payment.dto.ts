import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class PosPaymentDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNumber()
  @Min(1)
  value: number;

  @IsString()
  @IsNotEmpty()
  mac: string;
}

export class PosCancelPaymentDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  mac: string;
}

export class PosReversePaymentDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  mac: string;
}

export class PosStatusDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  mac: string;
}

export class PosCreateQrDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNumber()
  @Min(1)
  value: number;

  @IsString()
  @IsNotEmpty()
  mac: string;
}

export class PosQrStatusDto {
  @IsString()
  @IsNotEmpty()
  qrId: string;

  @IsString()
  @IsNotEmpty()
  mac: string;
}

export class PosCancelQrDto {
  @IsString()
  @IsNotEmpty()
  qrId: string;

  @IsString()
  @IsNotEmpty()
  mac: string;
}

