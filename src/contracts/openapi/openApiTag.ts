import { OpenApiExternalDoc } from "./openApiExternalDoc";


export interface OpenApiTag {
    name: string;
    description?: string;
    externalDocs?: OpenApiExternalDoc;
}
