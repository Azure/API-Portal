export interface DataProvider  {
    loadData(): Promise<Object>;

    saveData(data: Object): Promise<void>;
}