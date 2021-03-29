import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import { OpenApiSpec30 } from "./../contracts/openapi/openApi";
import { defaultFileEncoding, websiteContentFileName, metadataFileExt, dataPathSettingName, mediaPathSettingName, openapiSpecsPathSettingName } from "../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Controller, HttpCode, Get, Put, ContentType, Body, Param, UploadedFile, Res, NotFoundError } from "routing-controllers";
import { OpenApiIndexBuilder } from "../services/openApiIndexBuilder";


@Controller()
export class ContentController {
    constructor(private readonly settingsProvider: ISettingsProvider) { }

    @HttpCode(200)
    @ContentType("application/json")
    @Get("/data/:fileKey")
    public async getData(@Param("fileKey") fileKey: string): Promise<any> {
        const dataPath = await this.settingsProvider.getSetting<string>(dataPathSettingName);

        if (!dataPathSettingName) {
            throw new Error(`Setting "${dataPathSettingName}" not specified.`);
        }

        try {
            const contentFilePath = path.resolve(__dirname, dataPath, fileKey);
            return JSON.parse(await fs.promises.readFile(contentFilePath, defaultFileEncoding));
        }
        catch (error) {
            throw new Error(`Unable to load content from storage. ${error.stack}`);
        }
    }

    @HttpCode(201)
    @ContentType("application/json")
    @Put("/data/content.json")
    public async setData(@Body() data: any): Promise<string> {
        const dataPath = await this.settingsProvider.getSetting<string>(dataPathSettingName);

        if (!dataPathSettingName) {
            throw new Error(`Setting "${dataPathSettingName}" not specified.`);
        }

        try {
            const contentFilePath = path.resolve(__dirname, dataPath, websiteContentFileName);
            await fs.promises.writeFile(contentFilePath, JSON.stringify(data));
            return "OK";
        }
        catch (error) {
            throw new Error(`Unable to save content to storage. ${error.stack}`);
        }
    }

    @HttpCode(200)
    @Get("/_media/:blobKey")
    public async getBlob(@Res() response: express.Response, @Param("blobKey") blobKey: string): Promise<any> {
        try {
            const mediaPath = await this.settingsProvider.getSetting<string>(mediaPathSettingName);
            const filePath = path.resolve(__dirname, mediaPath, blobKey);

            if (!fs.existsSync(filePath)) {
                throw new NotFoundError();
            }

            const metadataFile = await fs.promises.readFile(filePath + metadataFileExt, defaultFileEncoding);
            const metadata = JSON.parse(metadataFile);
            response.contentType(metadata.mimetype);

            const media = await fs.promises.readFile(filePath, { encoding: "binary" });
            return Buffer.from(media, "binary");
        }
        catch (error) {
            throw new Error(`Unable to download media from storage. ${error.stack}`);
        }
    }

    @HttpCode(201)
    @Put("/_media/:blobKey")
    public async uploadBlob(@Param("blobKey") blobKey: string, @UploadedFile("media") media: any): Promise<string> {
        try {
            const mediaPath = await this.settingsProvider.getSetting<string>(mediaPathSettingName);
            const mediaFolder = path.resolve(__dirname, mediaPath);
            const filePath = path.resolve(mediaFolder, blobKey);

            await fs.promises.mkdir(mediaFolder, { recursive: true });
            await fs.promises.writeFile(filePath, media.buffer);
            await fs.promises.writeFile(filePath + metadataFileExt, JSON.stringify({ mimetype: media.mimetype }));

            return "OK";
        }
        catch (error) {
            throw new Error(`Unable to upload media to storage. ${error.stack}`);
        }
    }

    @HttpCode(201)
    @Put("/_media/:blobKey")
    public async deleteBlob(@Param("blobKey") blobKey: string): Promise<string> {
        try {
            const mediaPath = await this.settingsProvider.getSetting<string>(mediaPathSettingName);
            const mediaFolder = path.resolve(__dirname, mediaPath);
            const filePath = path.resolve(mediaFolder, blobKey);

            if (!fs.existsSync(filePath)) {
                return "OK";
            }

            await fs.promises.unlink(filePath);
            await fs.promises.unlink(filePath + ".metacontent.json");

            return "OK";
        }
        catch (error) {
            throw new Error(`Unable to delete media from storage. ${error.stack}`);
        }
    }

    @HttpCode(200)
    @ContentType("application/json")
    @Get("/specs/index.json")
    public async getSpecsIndex(): Promise<Object> {
        try {
            const basePath = path.dirname(__filename);
            const openapiSpecsFolder = await this.settingsProvider.getSetting<string>(openapiSpecsPathSettingName);
            const specsFolderPath = path.resolve(basePath, openapiSpecsFolder);
            const fileNames = await fs.promises.readdir(specsFolderPath);
            const openApiIndexBuilder = new OpenApiIndexBuilder();

            for (const fileName of fileNames) {
                const specKey = fileName.startsWith("/") ? fileName.substr(1) : fileName;
                const filePath = path.resolve(specsFolderPath, fileName);
                const spec: OpenApiSpec30 = JSON.parse(await fs.promises.readFile(filePath, defaultFileEncoding));
                openApiIndexBuilder.appendSpec(specKey, spec);
            }

            const searchIndex = openApiIndexBuilder.buildIndex();
            return JSON.parse(JSON.stringify(searchIndex));
        }
        catch (error) {
            throw new Error(`Unable to build spec index. ${error.stack}`);
        }
    }

    @HttpCode(200)
    @ContentType("application/json")
    @Get("/specs/:specKey")
    public async getSpecs(@Param("specKey") specKey: string): Promise<Object> {
        const basePath = path.dirname(__filename);
        const openapiSpecsFolder = await this.settingsProvider.getSetting<string>(openapiSpecsPathSettingName);
        const specsFilePath = path.resolve(basePath, openapiSpecsFolder, specKey);
        const spec: OpenApiSpec30 = JSON.parse(await fs.promises.readFile(specsFilePath, defaultFileEncoding));

        return spec;
    }
}
