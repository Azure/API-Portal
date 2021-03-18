import * as lunr from "lunr";
import * as Utils from "@paperbits/common/utils";
import { IPublisher } from "@paperbits/common/publishing";
import { IBlobStorage } from "@paperbits/common/persistence";
import { Logger } from "@paperbits/common/logging";
import { OpenApiConverter } from "../services/openApiConverter";


export class OpenApiPublisher implements IPublisher {
    constructor(
        private readonly specsBlobStorage: IBlobStorage,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly logger: Logger
    ) { }

    public async publish(): Promise<void> {
        try {
            const searchables = [];
            const converter = new OpenApiConverter();
            const downloadKeys = await this.specsBlobStorage.listBlobs();

            for (const blobKey of downloadKeys) {
                const specContent = await this.specsBlobStorage.downloadBlob(blobKey);
                const apiContract = converter.getApi(JSON.parse(Utils.uint8ArrayToString(specContent)));
                const uploadKey = Utils.identifier();

                searchables.push({
                    key: uploadKey,
                    name: apiContract.properties.displayName,
                    description: apiContract.properties.description
                });

                await this.outputBlobStorage.uploadBlob(`/specs/${uploadKey}.json`, specContent, "application/json");
                this.logger.trackEvent("Publishing", { message: `Publishing OpenAPI spec ${apiContract.properties.displayName}...` });
            }

            const buildIndexFunction = function (): void {
                this.ref("key");
                this.field("name");
                this.field("description");

                searchables.forEach(searchable => { this.add(searchable); }, this);
            };

            const index = lunr(buildIndexFunction);
            const indexFile = Utils.stringToUnit8Array(JSON.stringify(index));
            await this.outputBlobStorage.uploadBlob(`/specs/index.json`, indexFile, "application/json");
        }
        catch (error) {
            throw new Error(`Unable to complete OpenAPI specifications publishing. ${error.stack || error.message}`);
        }
    }
}
