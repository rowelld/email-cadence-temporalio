import { defineQuery, defineSignal, proxyActivities, setHandler, sleep } from '@temporalio/workflow';
import type * as activities from '../activities/activities';

type Step = {
    id: string;
    type: 'SEND_EMAIL' | 'WAIT';
    subject?: string;
    body?: string;
    seconds?: number;
};

type CadenceState = {
    currentStepIndex: number;
    stepsVersion: number;
    status: 'RUNNING' | 'COMPLETED';
    steps: Step[];
};

const { sendEmail } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

export const updateCadence = defineSignal<[Step[]]>('updateCadence');
export const getState = defineQuery<CadenceState>('getState');

export async function emailCadenceWorkflow(steps: Step[], contactEmail: string): Promise<void> {
    let currentSteps = steps;
    let currentStepIndex = 0;
    let stepsVersion = 1;
    let status: CadenceState['status'] = 'RUNNING';

    const maybeComplete = () => {
        if (currentStepIndex >= currentSteps.length) {
            status = 'COMPLETED';
        }
    };

    setHandler(updateCadence, (newSteps) => {
        currentSteps = newSteps;
        stepsVersion += 1;
        maybeComplete();
    });

    setHandler(getState, () => ({
        currentStepIndex,
        stepsVersion,
        status,
        steps: currentSteps,
    }));

    while (status === 'RUNNING') {
        if (currentStepIndex >= currentSteps.length) {
            status = 'COMPLETED';
            break;
        }

        const step = currentSteps[currentStepIndex];
        if (step?.type === 'WAIT') {
            const delaySeconds = step.seconds ?? 0;
            if (delaySeconds > 0) {
                await sleep(delaySeconds * 1000);
            }
        } else if (step?.type === 'SEND_EMAIL') {
            await sendEmail({
                to: contactEmail,
                subject: step.subject ?? '',
                body: step.body ?? '',
            });
        }

        currentStepIndex += 1;
    }
}
