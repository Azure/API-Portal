import { HttpClient, HttpHeader, HttpMethod } from "@paperbits/common/http";

export class RemoteBlobStorage {
    constructor(private readonly httpClient: HttpClient) { }

    /**
     * Uploads specified content.
     * @param blobKey 
     * @param content 
     * @param contentType 
     */
    public async uploadBlob(blobKey: string, content: Uint8Array, contentType?: string): Promise<void> {
        try {
            const media = new Blob([content], { type: contentType });
            const formData = new FormData();
            formData.append("media", media);

            await this.httpClient.send<any>({
                url: `/_media/${blobKey}`,
                method: HttpMethod.put,
                body: formData
            });
        }
        catch (error) {
            throw new Error(`Could not upload '${blobKey}'. Error: ${error}`);
        }
    }

    /**
     * Returns download URL of uploaded blob.
     * @param blobKey 
     */
    public async getDownloadUrl(blobKey: string): Promise<string> {
        try {
            const downloadUrl = `/_media/${blobKey}`;
            return downloadUrl;
        }
        catch (error) {
            if (error?.code === "ResourceNotFound") {
                return null;
            }
            else {
                console.error(error);
                throw new Error(`Could not get download url '${blobKey}'.`);
            }
        }
    }

    /**
     * Removes specified blob from server.
     * @param blobKey 
     */
    public async deleteBlob(blobKey: string): Promise<void> {
        try {
            const headers: HttpHeader[] = [];
            headers.push({ name: "If-Match", value: "*" });

            await this.httpClient.send<any>({
                url: `/_media/${blobKey}`,
                method: HttpMethod.delete
            });
        }
        catch (error) {
            throw new Error(`Could not delete file '${blobKey}'. Error: ${error}`);
        }
    }

    public async downloadBlob?(blobKey: string): Promise<Uint8Array> {
        try {
            const dataObject = await this.httpClient.send<Uint8Array>({
                url: `/files/${blobKey}`,
                headers: []
            });

            return dataObject.toByteArray();
        }
        catch (error) {
            throw new Error(`Could not delete file '${blobKey}'. Error: ${error}`);
        }
    }
}