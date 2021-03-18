import { OpenApiOperation } from "./openApiOperation";


export interface OpenApiPath {
    [key: string]: OpenApiOperation;
}
