import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities/activities';

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
const NAMESPACE = process.env.TEMPORAL_NAMESPACE || 'default';
const TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE || 'email-cadence';

async function run() {
    const connection = await NativeConnection.connect({ address: TEMPORAL_ADDRESS });
    const worker = await Worker.create({
        connection,
        namespace: NAMESPACE,
        workflowsPath: require.resolve('./workflows/cadence.workflow'),
        taskQueue: TASK_QUEUE,
        activities,
    });

    await worker.run();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
