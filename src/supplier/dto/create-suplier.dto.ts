import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEmail, IsUrl, Length } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Informações legais
  @IsString()
  @IsNotEmpty()
  legalBusinessName: string;

  @IsString()
  @IsNotEmpty()
  tradingName: string;

  @IsString()
  @IsNotEmpty()
  @Length(9, 9, { message: 'NUIT deve ter exatamente 9 dígitos' })
  nuit: string;

  // Endereço
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  addressNumber: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  // Contato
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @IsString()
  @IsNotEmpty()
  contactPosition: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  // Dados bancários
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  bankAccountNumber: string;

  @IsString()
  @IsNotEmpty()
  bankBranch: string;

  @IsNotEmpty()
  companyId: number;
}