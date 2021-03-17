import {
    OpenApiComponents,
    OpenApiExternalDoc,
    OpenApiObjectInfo,
    OpenApiPaths,
    OpenApiServer,
    OpenApiTag
} from "./";

/**
 * This is the root document object of the
 */
export interface OpenApiSpec30 {
    /**
     * This string MUST be the semantic version number of the OpenAPI Specification version that the OpenAPI document uses.
     */
    openapi: string;

    /**
     * The available paths and operations for the API.
     */
    paths: OpenApiPaths;

    /**
     * Provides metadata about the API. The metadata MAY be used by tooling as required.
     */
    info: OpenApiObjectInfo;

    /**
     * Additional external documentation.
     */
    externalDocs?: OpenApiExternalDoc;

    /**
     * An array of Server Objects, which provide connectivity information to a target server.
     * If the servers property is not provided, or is an empty array, the default value would
     * be a Server Object with a URL value of /.
     */
    servers?: OpenApiServer[];

    /**
     * A list of tags used by the specification with additional metadata.
     */
    tags?: OpenApiTag[];

    /**
     * An element to hold various schemas for the specification.
     */
    components: OpenApiComponents;
}