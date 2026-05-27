import { AdvanceAssembler } from './advance.assembler.js';

export class AdvanceApi {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api/v1/progress';
    }

    async getAll() {
        const res = await fetch(this.baseUrl);
        if (!res.ok) throw new Error('Failed to fetch advances');
        const data = await res.json();
        return AdvanceAssembler.toEntityList(data);
    }

    async create(data) {
        const res = await fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create advance');
        const savedData = await res.json();
        return AdvanceAssembler.toEntity(savedData);
    }

    // ADDED: Method to update an existing record
    async update(id, data) {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Failed to update advance ${id}`);
        const updatedData = await res.json();
        return AdvanceAssembler.toEntity(updatedData);
    }

    // ADDED: Method to delete a record
    async delete(id) {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(`Failed to delete advance ${id}`);
    }
}