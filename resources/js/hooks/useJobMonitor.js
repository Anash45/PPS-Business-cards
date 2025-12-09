import { useEffect, useRef } from "react";
import axios from "axios";

/**
 * Hook to monitor wallet sync jobs
 * Polls the backend and sets isSyncingBg to false when all jobs are complete
 */
export function useWalletSyncMonitor(isSyncingBg, setIsSyncingBg) {
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!isSyncingBg) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Start polling every 5 seconds
        intervalRef.current = setInterval(async () => {
            try {
                const response = await axios.get("/wallet-jobs/status");
                const { hasRunningJob } = response.data;

                if (!hasRunningJob) {
                    setIsSyncingBg(false);
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            } catch (error) {
                console.error("Error checking wallet job status:", error);
            }
        }, 5000);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isSyncingBg, setIsSyncingBg]);
}

/**
 * Hook to monitor email sending jobs
 * Polls the backend and sets isSendingEmails to false when all jobs are complete
 */
export function useEmailSendingMonitor(isSendingEmails, setIsSendingEmails) {
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!isSendingEmails) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Start polling every 5 seconds
        intervalRef.current = setInterval(async () => {
            try {
                const response = await axios.get("/email-jobs/status");
                const { hasRunningJob } = response.data;

                if (!hasRunningJob) {
                    setIsSendingEmails(false);
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            } catch (error) {
                console.error("Error checking email job status:", error);
            }
        }, 5000);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isSendingEmails, setIsSendingEmails]);
}
