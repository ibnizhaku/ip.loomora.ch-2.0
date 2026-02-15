import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController, PayslipsController } from './payroll.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PayrollController, PayslipsController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
