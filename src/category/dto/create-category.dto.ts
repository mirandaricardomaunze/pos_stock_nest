import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class  CreateCategoryDto {
    @ApiProperty({ description: 'Category name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Category description', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Category company id', required: false })
    @IsNumber()
    @IsOptional()
    companyId: number;
}