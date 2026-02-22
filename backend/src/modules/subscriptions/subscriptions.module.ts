import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { WebhookService } from './webhook.service';
import { ZahlsService } from './zahls.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, WebhookService, ZahlsService],
  exports: [SubscriptionsService, WebhookService, ZahlsService],
})
export class SubscriptionsModule {}
