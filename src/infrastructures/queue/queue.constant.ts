export const QueueName = {
    ADD_NOTE: 'add-note',
    NOTIFICATION: 'notification',
} as const;

export const JobName = {
    PROCESS_WORD: 'process-word',
    SEND_NOTIFICATION: 'send-notification',
    BROADCAST_NOTIFICATION: 'broadcast-notification',
    SEND_EMAIL_NOTIFICATION: 'send-email-notification',
} as const;
