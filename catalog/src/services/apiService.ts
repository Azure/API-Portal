import * as lunr from "lunr";
import { HttpClient, HttpResponse } from "@paperbits/common/http";
import { SearchQuery } from "../contracts/searchQuery";
import { Api } from "../models/api";
import { VersionSet } from "../models/versionSet";
import { Page } from "../models/page";
import { Operation } from "../models/operation";
import { Schema } from "../models/schema";
import { Utils } from "../utils";
import { TagGroup } from "../models/tagGroup";
import { Tag } from "../models/tag";
import { OpenApiConverter } from "./openApiConverter";

export class ApiService {
    constructor(private readonly httpClient: HttpClient) { }

    private async fetchSpecs(searchPattern: string = ""): Promise<any[]> {
        const response = await this.httpClient.send({ url: "/specs/index.json" });
        const indexData = response.toObject();
        const index = lunr.Index.load(indexData);
        const searchRawResults = index.search(`*${searchPattern}*`);

        const promises = searchRawResults
            .map(result => this.httpClient.send({ url: `/specs/${result.ref}` }));

        const results = await Promise.all<HttpResponse<any>>(promises);

        return results.map(response => response.toObject());
    }

    /**
     * Returns APIs matching search request (if specified).
     * @param searchQuery 
     */
    public async getApis(searchQuery?: SearchQuery): Promise<Page<Api>> {
        const specs = await this.fetchSpecs(searchQuery?.pattern);
        const converter = new OpenApiConverter();
        const apis = specs.map(spec => converter.getApi(spec));

        const page = new Page<Api>();
        page.value = apis.map(apiContract => new Api(apiContract));

        return page;
    }

    /**
     * Returns Tag/Operation pairs matching search request (if specified).
     * @param searchRequest Search request definition.
     */
    public async getOperationsByTags(apiId: string, searchQuery?: SearchQuery): Promise<Page<TagGroup<Operation>>> {
        return null;

        // if (!apiId) {
        //     throw new Error(`Parameter "apiId" not specified.`);
        // }

        // const skip = searchQuery && searchQuery.skip || 0;
        // const take = searchQuery && searchQuery.take || Constants.defaultPageSize;

        // let query = `apis/${apiId}/operationsByTags?includeNotTaggedOperations=true&$top=${take}&$skip=${skip}`;
        // const odataFilterEntries = [];

        // if (searchQuery) {
        //     if (searchQuery.tags && searchQuery.tags.length > 0) {
        //         const tagFilterEntries = searchQuery.tags.map((tag) => `tag/id eq '${Utils.getResourceName("tags", tag.id)}'`);
        //         odataFilterEntries.push(`(${tagFilterEntries.join(" or ")})`);
        //     }

        //     if (searchQuery.pattern) {
        //         const pattern = Utils.escapeValueForODataFilter(searchQuery.pattern);
        //         odataFilterEntries.push(`(contains(operation/name,'${encodeURIComponent(pattern)}'))`);
        //     }
        // }

        // if (odataFilterEntries.length > 0) {
        //     query = Utils.addQueryParameter(query, `$filter=` + odataFilterEntries.join(" and "));
        // }
        // const pagesOfOperationsByTag = await this.mapiClient.get<PageContract<ApiTagResourceContract>>(query);
        // const page = new Page<TagGroup<Operation>>();
        // const tagGroups: Bag<TagGroup<Operation>> = {};

        // pagesOfOperationsByTag.value.forEach(x => {
        //     const tagContract: TagContract = x.tag ? Utils.armifyContract("tags", x.tag) : null;
        //     const operationContract: OperationContract = x.operation ? Utils.armifyContract("operations", x.operation) : null;

        //     let tagGroup: TagGroup<Operation>;
        //     let tagName: string;

        //     if (tagContract) {
        //         tagName = tagContract.properties.displayName;
        //     } else {
        //         tagName = "Untagged";
        //     }
        //     tagGroup = tagGroups[tagName];

        //     if (!tagGroup) {
        //         tagGroup = new TagGroup<Operation>();
        //         tagGroup.tag = tagName;
        //         tagGroups[tagName] = tagGroup;
        //     }
        //     tagGroup.items.push(new Operation(operationContract));
        // });
        // page.value = Object.keys(tagGroups).map(x => tagGroups[x]);
        // page.nextLink = pagesOfOperationsByTag.nextLink;

        // return page;
    }

    /**
     * Returns Tag/API pairs matching search request (if specified).
     * @param searchRequest Search request definition.
     */
    public async getApisByTags(searchRequest?: SearchQuery): Promise<Page<TagGroup<Api>>> {
        const tagGroup = new TagGroup<Api>();

        const apis = await this.getApis(searchRequest);
        tagGroup.items.push(...apis.value);
        tagGroup.tag = "Untagged";

        const page = new Page<TagGroup<Api>>();
        page.value = [tagGroup];
        page.nextLink = null;

        return page;
    }

    /**
     * Returns tags associated with specified operation.
     * @param operationId {string} ARM-formatted operation identifier.
     */
    public async getOperationTags(operationId: string): Promise<Tag[]> {
        return [];
    }

    /**
     * Returns API with specified ID and revision.
     * @param apiId Unique API indentifier.
     * @param revision 
     */
    public async getApi(apiId: string): Promise<Api> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        const specs = await this.fetchSpecs();
        const converter = new OpenApiConverter();
        const spec = specs.find(spec => spec.info.title === apiId.replace("apis/", ""));
        const apiContract = converter.getApi(spec);

        if (!apiContract) {
            return null;
        }

        if (apiContract.properties.apiVersionSetId && !apiContract.properties.apiVersionSet) { // Filling the missing version set
            const setId = Utils.getResourceName("apiVersionSets", apiContract.properties.apiVersionSetId, "shortId");
            const apiVersionSetContract = await this.getApiVersionSet(setId);
            apiContract.properties.apiVersionSet = apiVersionSetContract;
        }

        return new Api(apiContract);
    }

    /**
     * Returns a document of exported API in specified format.
     * @param apiId {string} Unique identifier.
     * @param format {string} Export format.
     */
    public exportApi(apiId: string, format: string): Promise<any> {
        return null;

        // if (!apiId) {
        //     throw new Error(`Parameter "apiId" not specified.`);
        // }

        // const header: HttpHeader = {
        //     name: "Accept",
        //     value: "application/vnd.swagger.doc+json"
        // };
        // switch (format) {
        //     case "wadl":
        //         header.value = "application/vnd.sun.wadl+xml";
        //         break;
        //     case "wsdl":
        //         header.value = "application/wsdl+xml";
        //         break;
        //     case "swagger": // json 2.0
        //         header.value = "application/vnd.swagger.doc+json";
        //         break;
        //     case "openapi": // yaml 3.0
        //         header.value = "application/vnd.oai.openapi";
        //         break;
        //     case "openapi+json": // json 3.0
        //         header.value = "application/vnd.oai.openapi+json";
        //         break;
        //     default:
        // }

        // return this.mapiClient.get<string>(apiId, [header]);
    }

    public async getApiVersionSet(versionSetId: string): Promise<VersionSet> {
        // const versionSetContract = await this.mapiClient.get<VersionSetContract>(versionSetId);
        // return new VersionSet(versionSetContract.id, versionSetContract);

        return null;
    }

    public async getOperation(apiName: string, operationName: string): Promise<Operation> {
        const specs = await this.fetchSpecs();
        const converter = new OpenApiConverter();
        const spec = specs.find(spec => spec.info.title === apiName);
        const operations = converter.getOperations(spec);
        const contract = operations.find(x => x.name === operationName);
        return contract ? new Operation(contract) : undefined;
    }

    public async getOperations(apiId: string, searchQuery?: SearchQuery): Promise<Page<Operation>> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        // let query = `${apiId}/operations`;

        // let top;

        // if (searchQuery) {
        //     searchQuery.tags.forEach((tag, index) => {
        //         query = Utils.addQueryParameter(query, `tags[${index}]=${tag.name}`);
        //     });

        //     if (searchQuery.pattern) {
        //         const pattern = Utils.escapeValueForODataFilter(searchQuery.pattern);
        //         query = Utils.addQueryParameter(query, `$filter=contains(properties/displayName,'${encodeURIComponent(pattern)}')`);
        //     }

        //     top = searchQuery && searchQuery.take || Constants.defaultPageSize;

        //     if (searchQuery.skip) {
        //         query = Utils.addQueryParameter(query, `$skip=${searchQuery.skip}`);
        //     }
        // }
        // query = Utils.addQueryParameter(query, `$top=${top || 20}`);

        // const result = await this.mapiClient.get<Page<OperationContract>>(query);
        // const page = new Page<Operation>();

        // page.value = result.value.map(c => new Operation(<any>c));
        // page.nextLink = result.nextLink;

        // return page;

        const specs = await this.fetchSpecs();
        const converter = new OpenApiConverter();
        const spec = specs.find(spec => spec.info.title === apiId.replace("apis/", ""));
        const operations = converter.getOperations(spec);

        const page = new Page<Operation>();
        page.value = operations.map(x => new Operation(x));

        return page;
    }

    /**
     * Returns API schema with sepcified identifier.
     * @param schemaId {string} ARM-formatted schema identifier.
     */
    public async getApiSchema(apiName: string): Promise<Schema> {
        const specs = await this.fetchSpecs();
        const converter = new OpenApiConverter();
        const spec = specs.find(spec => spec.info.title === apiName);
        const schema = converter.getSchema(spec);

        return schema;
    }

    public async getApiHostnames(apiName: string): Promise<string[]> {
        const specs = await this.fetchSpecs();
        const converter = new OpenApiConverter();
        const spec = specs.find(spec => spec.info.title === apiName);

        return converter.getHostnames(spec);
    }
}