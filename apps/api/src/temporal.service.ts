import { Injectable } from "@nestjs/common";
import { Connection, WorkflowClient } from "@temporalio/client";
import { CadencesService } from "./cadences.service";

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || "localhost:7233";
const NAMESPACE = process.env.TEMPORAL_NAMESPACE || "default";
const TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE || "email-cadence";

@Injectable()
export class TemporalService {
    private connection: Connection;
    private client: WorkflowClient;

    constructor(private cadenceService: CadencesService) {
        this.connection = Connection.lazy({ address: TEMPORAL_ADDRESS });
        this.client = new WorkflowClient({ connection: this.connection, namespace: NAMESPACE });
    }

    async startWorkFlow(workflowId: string, cadenceId: string, contactEmail: string) {
        const cadence = this.cadenceService.get(cadenceId);
        if (!cadence) {
            throw new Error("Cadence not found");
        }

        const handle = await this.client.start('emailCadenceWorkflow', {
            args: [cadence.steps, contactEmail],
            taskQueue: TASK_QUEUE,
            workflowId,
        });
        return handle;
    }

    async getWorkflowState(workflowId: string) {
        const handle = this.client.getHandle<any>(workflowId);
        return await handle.query('getState');
    }

    async signalUpdateCadence(workflowId: string, newSteps: any[]) {
        const handle = this.client.getHandle<any>(workflowId);
        await handle.signal('updateCadence', newSteps);
    }
}
