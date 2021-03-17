import * as express from "express";
import * as mime from "mime-types";
import { Req, Res, ExpressMiddlewareInterface, Middleware } from "routing-controllers";
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

    private async render(basePath: string, path: string, response: express.Response, selectedStorage: IBlobStorage): Promise<void> {
        path = basePath + path;

        const requestingFile = this.isFile(path);

        if (!requestingFile) {
            path += (path.endsWith("/") ? "" : "/") + "index.html";
        }

        const fileName = path.split("/").pop();
        const contentType = mime.lookup(fileName) || "application/octet-stream";
        response.setHeader("Content-Type", contentType);

        const blob = await selectedStorage.downloadBlob(path);
        response.end(Buffer.from(blob), "binary");
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
            if (error.statusCode && error.statusCode === 404) {
                try {
                    response.setHeader("Content-Type", "text/html");
                    // const readableStream = await storage.getBlobAsStream(`/${basePath}/404/index.html`);
                    // readableStream.pipe(response);
                    response.send("Not found");
                }
                catch (er) {
                    if (error.statusCode && error.statusCode === 404) {
                        response.send("Resource not found.");
                    }
                    else {
                        this.logger.trackError(er);
                        response.send("Oops. Something went wrong. Please try again later.");
                    }
                }
            }
            else {
                this.logger.trackError(error);
                response.send("Oops. Something went wrong. Please try again later.");
            }
        }
    }

    public use(@Req() request: express.Request, @Res() response: express.Response, next: express.NextFunction): any {
        if (response.headersSent) {
            next();
            return;
        }

        this.processRequest(request, response)
            .finally(() => next());
    }
}
