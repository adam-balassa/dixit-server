import { Router, Request, Response } from 'express';
import { RoutingError, Response as ResponseResult, Success, Error, ServerError, RequestError } from '../interfaces/exceptions';

export class Routes {
  router: Router;
  public constructor(router: Router) {
    this.router = router;

    this.addRoutes();

    this.router.use((req: Request, res: Response) => {
      res.send(new RoutingError('Route not found'));
    });
  }

  private addRoutes() {
    this.get('/', (req: Request) => {
      return Promise.resolve(new Success('Hello world!'));
    });
  }

  private get(uri: string, result: (request: Request) => Promise<ResponseResult>) {
    this.router.get(uri, (req, res) => {
      try {
        result(req)
          .then((_result: { statusCode: number; }) => { res.status(_result.statusCode).send(_result); })
          .catch((error: { statusCode: any; }) => { res.status(error.statusCode || 500).send(error); });
      }
      catch (error) {
        res.status(error.statusCode || 500).send(error);
      }
    });
  }

  private post(uri: string, result: (request: Request) => Promise<ResponseResult>) {
    this.router.post(uri, (req, res) => {
      try {
        result(req)
          .then((_result: { statusCode: number; }) => { res.status(_result.statusCode).send(_result); })
          .catch((error: { statusCode: any; }) => { res.status(error.statusCode || 500).send(error); });
      }
      catch (error) {
        res.status(error.statusCode || 500).send(error);
      }    });
  }

  private patch(uri: string, result: (request: Request) => Promise<ResponseResult>) {
    this.router.patch(uri, (req, res) => {
      try {
        result(req)
          .then((_result: { statusCode: number; }) => { res.status(_result.statusCode).send(_result); })
          .catch((error: { statusCode: any; }) => { res.status(error.statusCode || 500).send(error); });
      }
      catch (error) {
        res.status(error.statusCode || 500).send(error);
      }    });
  }

  private delete(uri: string, result: (request: Request) => Promise<ResponseResult>) {
    this.router.delete(uri, (req, res) => {
      try {
        result(req)
          .then((_result: { statusCode: number; }) => { res.status(_result.statusCode).send(_result); })
          .catch((error: { statusCode: any; }) => { res.status(error.statusCode || 500).send(error); });
      }
      catch (error) {
        res.status(error.statusCode || 500).send(error);
      }    });
  }

  private require(body: any, properties: string) {
    const propertyArray = properties.split('.');
    let obj = body;
    for (const property of propertyArray) {
      if (obj[property] === undefined)
        throw new RequestError('Body does not have a parameter ' + properties);
      obj = obj[property];
    }
  }
}
