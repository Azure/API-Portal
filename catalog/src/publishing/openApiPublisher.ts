import * as Utils from "@paperbits/common/utils";
import { IPublisher } from "@paperbits/common/publishing";
import { IBlobStorage } from "@paperbits/common/persistence";
import { Logger } from "@paperbits/common/logging";
import { OpenApiIndexBuilder } from "../services/openApiIndexBuilder";
import { OpenApiSpec30 } from "../contracts/openapi/openApi";


export class OpenApiPublisher implements IPublisher {
    constructor(
        private readonly specsBlobStorage: IBlobStorage,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly logger: Logger
    ) { }

    public async publish(): Promise<void> {
        try {
            const openApiIndexBuilder = new OpenApiIndexBuilder();
            const downloadKeys = await this.specsBlobStorage.listBlobs();

            for (const blobKey of downloadKeys) {
                const specKey = blobKey.startsWith("/") ? blobKey.substr(1) : blobKey;
                const specContent = await this.specsBlobStorage.downloadBlob(specKey);
                const openApiSpec: OpenApiSpec30 = JSON.parse(Utils.uint8ArrayToString(specContent));

                openApiIndexBuilder.appendSpec(specKey, openApiSpec);

                await this.outputBlobStorage.uploadBlob(`/specs/${specKey}`, specContent, "application/json");
                this.logger.trackEvent("Publishing", { message: `Publishing OpenAPI spec ${openApiSpec.info.title}...` });
            }

            const index = openApiIndexBuilder.buildIndex();
            const indexFile = Utils.stringToUnit8Array(JSON.stringify(index));
            await this.outputBlobStorage.uploadBlob(`/specs/index.json`, indexFile, "application/json");
        }
        catch (error) {
            throw new Error(`Unable to complete OpenAPI specifications publishing. ${error.stack || error.message}`);
        }
    }
}