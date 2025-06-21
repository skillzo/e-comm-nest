import { registerAs } from '@nestjs/config';

export default registerAs('postmark', () => ({
  apiKey: process.env.POSTMARK_API_KEY,
  fromEmail: process.env.POSTMARK_EMAIL,
}));
