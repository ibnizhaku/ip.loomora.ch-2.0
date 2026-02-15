import { Module } from '@nestjs/common';
import { EmployeeContractsController } from './employee-contracts.controller';
import { EmployeeContractsService } from './employee-contracts.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeContractsController],
  providers: [EmployeeContractsService],
  exports: [EmployeeContractsService],
})
export class EmployeeContractsModule {}
