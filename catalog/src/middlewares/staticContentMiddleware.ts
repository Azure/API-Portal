import * as express from "express";
import * as mime from "mime";
import { Req, Res, ExpressMiddlewareInterface, Middleware, NotFoundError, InternalServerError } from "routing-controllers";
import { Logger } from "@paperbits/common/logging";
import { IBlobStorage } from "@paperbits/common/persistence";


@Middleware({ type: "after" })
export class StaticContentMiddleware implements ExpressMiddlewareInterface {
    constructor(
        private readonly websiteStorage: IBlobStorage,
        private readonly designerStorage: IBlobStorage,
        private readonly logger: Logger
    ) {
        this.use = this.use.bind(this);
    }

    private isFile(path: string): boolean {
        return !!path.match(/\.\w*$/gm);
    }

    private isDesignerResource(@Req() request: express.Request): boolean {
        if (request.path.startsWith("/specs/")) {
            return false;
        }

        const referrer = request.headers?.referer
            ? new URL(request.headers?.referer)
            : null;

        return request.path.startsWith("/admin")
            || request.path.startsWith("/editors")
            || request.headers?.referer?.endsWith("?designtime=true")
            || referrer?.pathname.startsWith("/admin");
    }

    private async render(basePath: string, path: string, response: express.Response, sourceStorage: IBlobStorage): Promise<void> {
        path = basePath + path;

        const requestingFile = this.isFile(path);

        if (!requestingFile) {
            path += (path.endsWith("/") ? "" : "/") + "index.html";
        }

        const blob = await sourceStorage.downloadBlob(path);

        if (blob) {
            const fileName = path.split("/").pop();
            const contentType = mime.getType(fileName) || "application/octet-stream";

            response
                .header("Content-Type", contentType)
                .end(Buffer.from(blob), "binary");

            return;
        }

        const blob404 = await sourceStorage.downloadBlob(`/${basePath}/404/index.html`);

        if (blob404) {
            response
                .status(404)
                .header("Content-Type", "text/html")
                .end(Buffer.from(blob), "binary");
            return;
        }

        response
            .status(404)
            .header("Content-Type", "text/plain")
            .end("Resource not found");
    }

    public async processRequest(@Req() request: express.Request, @Res() response: express.Response): Promise<any> {
        let storage: IBlobStorage;
        let basePath: string;

        try {
            let path = decodeURIComponent(request.path);

            const requestingFile = this.isFile(path);

            if (this.isDesignerResource(request)) {
                storage = this.designerStorage;
                basePath = ``;

                if (!requestingFile) {
                    /**
                     * For admin the URL needs to be always rewritten to /index.html (designer root),
                     * to avoid "Resource not found" error on F5 refresh.
                     */
                    path = "/";
                }

                await this.render(basePath, path, response, storage);
                return;
            }

            // if no published website yet, we can serve specs from /data/spec folder directly

            // if (!websiteVersion) { // no website yet, non-admins receive error message.
            //     response.statusCode = 200;
            //     return "Developer portal has not been published yet.";
            // }

            storage = this.websiteStorage;
            // basePath = `${websiteVersion}`;

            basePath = ``;

            await this.render(basePath, path, response, storage);
        }
        catch (error) {
            console.log(error);
            
            response
                .status(500)
                .header("Content-Type", "text/html")
                .send("Oops. Something went wrong. Please try again later.");
        }
    }

    public use(@Req() request: express.Request, @Res() response: express.Response, next: express.NextFunction): any {
        this.processRequest(request, response)
            .then(() => next())
            .catch(error => next(error));
    }
}
