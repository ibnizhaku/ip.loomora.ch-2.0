import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { WebhookService } from './webhook.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, WebhookService],
  exports: [SubscriptionsService, WebhookService],
})
export class SubscriptionsModule {}
