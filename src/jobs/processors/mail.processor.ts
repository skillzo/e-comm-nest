import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Client } from 'postmark';
import { SendEmailDto } from '../dtos';

@Processor('email')
export class MailProcessor extends WorkerHost {
  private client: Client;

  constructor() {
    super();
    this.client = new Client(process.env.POSTMARK_API_KEY!);
  }

  async process(job: Job, token?: string): Promise<any> {
    const data = job.data as SendEmailDto;

    await this.signUpMail(data);
  }

  async signUpMail(data: SendEmailDto) {
    try {
      const res = await this.client.sendEmail({
        From: process.env.POSTMARK_EMAIL!,
        To: data.to,
        Subject: data.subject,
        TextBody: `<p>Hello ${data?.name},</p><p>Thanks for signing up. We're glad to have you!</p>`,
        MessageStream: 'outbound',
      });

      console.log('email processed', res);
    } catch (err) {
      console.log('error sending message', err);
      throw new Error(err);
    }
  }

  @OnWorkerEvent('active')
  onAdded(job: Job) {
    console.log(`job id of ${job.id} has been added`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`job id of ${job.id} has been completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    console.log(`job id of ${job.id} has been failed`);
  }
}
