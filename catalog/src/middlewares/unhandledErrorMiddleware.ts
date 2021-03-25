import * as express from "express";
import { Middleware, ExpressErrorMiddlewareInterface, NotFoundError } from "routing-controllers";
import { Logger } from "@paperbits/common/logging";

@Middleware({ type: "after" })
export class UnhandledErrorMiddleware implements ExpressErrorMiddlewareInterface {
    constructor(private readonly logger: Logger) { }

    public error(error: any, request: express.Request, response: express.Response, next: express.NextFunction): void {
        this.logger.trackError(error, { httpMethod: request.method, url: request.url });

        if (error instanceof NotFoundError) {
            response.status(404).send({
                code: "NotFound",
                message: error.message || "Resoure not found."
            });
            return;
        }

        response
            .header("Content-Type", "application/json")
            .status(500)
            .send({
                code: "InternalServerError",
                message: `Oops, something went wrong.`
            });
    }
}