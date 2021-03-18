import "reflect-metadata";
import * as express from "express";
import * as bodyParser from "body-parser";
import { InversifyInjector } from "@paperbits/common/injection";
import { useExpressServer, useContainer } from "routing-controllers";
import { UnhandledErrorMiddleware, StaticContentMiddleware } from "./middlewares";
import { MainHostModule } from "./main.host.module";
import { InversifyAdapter } from "./injection/inversifyAdapter";
import { ContentController } from "./controller/contentController";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const injector = new InversifyInjector();
injector.bindModule(new MainHostModule());

const adapter = new InversifyAdapter(injector);
useContainer(adapter);

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));


useExpressServer(app, {
    defaultErrorHandler: false,
    middlewares: [
        UnhandledErrorMiddleware,
        StaticContentMiddleware
    ],
    controllers: [
        ContentController
    ]
});

const port = process.env.PORT || 3000;
app.listen(port);

console.log(`Website proxy started. Listening port ${port}...`);