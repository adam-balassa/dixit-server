import { Router, Request, Response } from 'express';
import { RoutingError, Response as ResponseResult, Success, Error, ServerError, RequestError } from './request.model';
import { Controller } from '../controller/controller';

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

    this.post('/rooms', (req: Request) => {
      this.require(req.body, 'name');
      const controller = new Controller();
      return controller.createNewRoom(req.body.name);
    });

    this.post('/rooms/:roomId/members', (req: Request) => {
      this.require(req.body, 'name');
      const controller = new Controller();
      return controller.joinRoom(req.params.roomId, req.body.name);
    });

    this.patch('/games/:gameId', (req: Request) => {
      const controller = new Controller();
      return controller.startGame(req.params.gameId);
    });

    this.patch('/games/:gameId/round', (req: Request) => {
      const controller = new Controller();
      return controller.startNewRound(req.params.gameId);
    });

    this.get('/games/:gameId', (req: Request) => {
      const controller = new Controller();
      return controller.getGame(req.params.gameId);
    });

    this.post('/games/:gameId/round', (req: Request) => {
      this.require(req.body, 'title');
      this.require(req.body, 'card');
      const controller = new Controller();
      return controller.addRoundTitle(req.params.gameId, req.body.title, req.body.card);
    });

    this.post('/games/:gameId/choice', (req: Request) => {
      this.require(req.body, 'choice');
      this.require(req.body, 'playerId');
      const controller = new Controller();
      return controller.addChoice(req.params.gameId, req.body.choice, req.body.playerId);
    });

    this.post('/games/:gameId/vote', (req: Request) => {
      this.require(req.body, 'vote');
      this.require(req.body, 'playerId');
      const controller = new Controller();
      return controller.addVote(req.params.gameId, req.body.vote, req.body.playerId);
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
      }
    });
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
      }
    });
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
      }
    });
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
