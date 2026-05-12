export class NcrRepository {
    constructor() {
        this.storageKey = 'kipu_ncr_reports';
    }

    async save(ncr) {
        const records = await this.getAll();
        records.push(ncr);
        localStorage.setItem(this.storageKey, JSON.stringify(records));
        return ncr;
    }

    async getAll() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }
}