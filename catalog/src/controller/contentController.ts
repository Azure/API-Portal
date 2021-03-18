import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import { defaultFileEncoding, websiteContentFileName, metadataFileExt, dataPathSettingName, mediaPathSettingName } from "../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Controller, HttpCode, Get, Put, ContentType, Body, Param, UploadedFile, Res } from "routing-controllers";


@Controller()
export class ContentController {
    constructor(private readonly settingsProvider: ISettingsProvider) { }

    @HttpCode(200)
    @ContentType("application/json")
    @Get("/api/content.json")
    public async getData(): Promise<any> {
        const dataPath = await this.settingsProvider.getSetting<string>(dataPathSettingName);
        return JSON.parse(await fs.promises.readFile(path.resolve(__dirname, dataPath, websiteContentFileName), defaultFileEncoding));
    }

    @HttpCode(201)
    @ContentType("application/json")
    @Put("/api/content.json")
    public async setData(@Body() data: any): Promise<string> {
        const dataPath = await this.settingsProvider.getSetting<string>(dataPathSettingName);
        await fs.promises.mkdir(dataPath, { recursive: true });
        await fs.promises.writeFile(path.resolve(__dirname, dataPath, websiteContentFileName), JSON.stringify(data));

        return "OK";
    }

    @HttpCode(200)
    @Get("/_media/:blobKey")
    public async getBlob(@Res() response: express.Response, @Param("blobKey") blobKey: string): Promise<any> {
        try {
            const mediaPath = await this.settingsProvider.getSetting<string>(mediaPathSettingName);
            const filePath = path.resolve(__dirname, mediaPath, blobKey);

            if (!fs.existsSync(filePath)) {
                response.statusCode = 404;
                return null;
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

            await fs.promises.unlink(filePath);
            await fs.promises.unlink(filePath + ".metacontent.json");

            return "OK";
        }
        catch (error) {
            throw new Error(`Unable to delete media from storage. ${error.stack}`);
        }
    }
}
