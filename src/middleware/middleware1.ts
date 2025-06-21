import { NextFunction, Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

export default (req: Request, res: Response, next: NextFunction) => {
  console.log('middleware1');
  res.send({ message: 'middleware1' });
  // next();
};

@Injectable()
export class MiddleWare2 implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('middleware2');
    next();
  }
}
