import { Injectable } from "@nestjs/common";

@Injectable()
export class CadencesService {
    private cadences: Map<string, any> = new Map();

    create(cadence: any) {
        this.cadences.set(cadence.id, cadence);
    }

    get(id: string) {
        return this.cadences.get(id);
    }

    update(id: string, cadence: any) {
        this.cadences.set(id, cadence);
    }
}