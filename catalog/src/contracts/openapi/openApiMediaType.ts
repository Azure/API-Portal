import { OpenApiExample } from "./openApiExample";


export interface OpenApiMediaType {
    schema: any; // OpenApiSchema | OpenApiReference;
    example: OpenApiExample;
    examples: any;
    encoding: any;
}
