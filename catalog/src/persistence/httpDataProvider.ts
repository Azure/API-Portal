import { HttpClient } from "@paperbits/common/http";
import { DataProvider } from "./dataProvider";

export class HttpDataProvider implements DataProvider {
    private initPromise: Promise<void>;
    private dataObject: Object;

    constructor(private readonly httpClient: HttpClient) { }

    private async initialize(): Promise<void> {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise<void>(async (resolve) => {
            const response = await this.httpClient.send({
                url: "/data/content.json",
                method: "GET"
            });

            this.dataObject = response.toObject();

            resolve();
        });

        return this.initPromise;
    }

    public async loadData(): Promise<Object> {
        await this.initialize();

        return this.dataObject;
    }

    public async saveData(data: Object): Promise<void> {
        await this.httpClient.send({
            url: "/data/content.json",
            method: "PUT",
            headers: [{ name: "Content-Type", value: "application/json" }],
            body: JSON.stringify(data)
        });
    }
}