export interface BatchDetail {
    createdAt: string;
    modifiedAt: string;
    isCompleted: boolean;
    isCsvDownloaded?: any;
    printFilePath: string;
    batchId: string;
}