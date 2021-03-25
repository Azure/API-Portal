import * as lunr from "lunr";
import { OpenApiSpec30 } from "../contracts/openapi/openApi";

export interface SearchableDocument {
    /**
     * Unique identifier.
     */
    key: string;

    /**
     * API title.
     */
    name: string;

    /**
     * API description.
     */
    description: string;
}

export class OpenApiIndexBuilder {
    private documents: any[];

    constructor() {
        this.documents = [];
    }

    private getIndexerConfigFunc(documents: SearchableDocument[]): lunr.ConfigFunction {
        return function (): void {
            this.ref("key");
            this.field("name");
            this.field("description");

            documents.forEach(document => this.add(document), this);
        };
    }

    public appendSpec(key: string, spec: OpenApiSpec30): void {
        const searchable: SearchableDocument = {
            key: key,
            name: spec.info.title,
            description: spec.info.description
        };
        this.documents.push(searchable);
    }

    public buildIndex(): string {
        try {
            const index = lunr(this.getIndexerConfigFunc(this.documents));
            return index;
        }
        catch (error) {
            throw new Error(`Unable to build search index: ${error.stack || error.message}`);
        }
    }
}