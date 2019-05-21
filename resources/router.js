const express = require('express');
const stream = require('stream');

const Log = require('./log');

const { Router } = express;
const { PassThrough, Stream } = stream;

const createErrorHandlerFn = (res, errorStatusCode) => (err) => {
  Log.error(`${err.status || errorStatusCode} :: ${err.message || err.toString()}`);
  Log.error(JSON.stringify(err));
  Log.error(err.toString());
  let { message } = err;
  if (message === 'Validation error') {
    message = err.original.sqlMessage;
  }
  return res.status(err.status || errorStatusCode).json({ message: `${message || err.toString()}` });
};

const createRoutingHandler = (
  fn,
  successStatusCode = 200,
  errorStatusCode = 500,
) => (req, res) => fn(req)
  .then((entity) => {
    if (entity) {
      return res.status(successStatusCode).json(entity);
    }

    throw new Error({ status: 404, message: `Entity not found ${entity}` });
  })
  .catch(createErrorHandlerFn(res, errorStatusCode));

export default class ApiRouter {
  constructor() {
    this.expressRouter = new Router({
      mergeParams: true,
    });
  }

  get(path, ...middlewares) {
    const businessLayerFn = middlewares.pop();
    const routeHandler = createRoutingHandler(businessLayerFn);
    this.expressRouter.get(path, ...middlewares, routeHandler);

    return this;
  }

  post(path, ...middlewares) {
    const businessLayerFn = middlewares.pop();
    const routeHandler = createRoutingHandler(businessLayerFn, 201);
    this.expressRouter.post(path, ...middlewares, routeHandler);

    return this;
  }

  put(path, ...middlewares) {
    const businessLayerFn = middlewares.pop();
    const routeHandler = createRoutingHandler(businessLayerFn, 201);
    this.expressRouter.put(path, ...middlewares, routeHandler);

    return this;
  }

  delete(path, ...middlewares) {
    const businessLayerFn = middlewares.pop();
    const routeHandler = createRoutingHandler(businessLayerFn, 201);
    this.expressRouter.delete(path, ...middlewares, routeHandler);

    return this;
  }

  download(path, ...middlewares) {
    const businessLayerFn = middlewares.pop();

    this.expressRouter.get(
      path,
      ...middlewares,
      (req, res) => businessLayerFn(req)
        .then(({ content, contentType, filename }) => {
          const readStream = new PassThrough();
          readStream.end(content);

          res.set('Content-disposition', `attachment; filename=${filename}`);
          res.set('Content-Type', contentType);

          readStream.pipe(res);
        })
        .catch(createErrorHandlerFn(res, 500))
    );

    return this;
  }

  router() {
    return this.expressRouter;
  }
}
