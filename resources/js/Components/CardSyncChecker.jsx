import { useEffect, useState } from "react";
import axios from "axios";

export default function EmployeeSyncChecker({
    employees,
    setEmployees,
    isSyncingBg,
}) {
    const [pollingInterval, setPollingInterval] = useState(null);

    // Poll backend every 60 seconds if syncing
    useEffect(() => {
        if (!isSyncingBg) {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
            }
            return;
        }

        const interval = setInterval(async () => {
            try {
                const response = await axios.get(
                    "/company/cards/sync-status"
                );
                const { synced_employees } = response.data;
                // Expect backend to return [{id: 1, wallet_status: 'synced'}, ...]

                if (synced_employees && synced_employees.length) {
                    setEmployees((prevEmployees) =>
                        prevEmployees.map((emp) => {
                            const updated = synced_employees.find(
                                (e) => e.id === emp.id
                            );
                            if (updated) {
                                return {
                                    ...emp,
                                    is_syncing: 0,
                                    wallet_status: updated.wallet_status,
                                };
                            }
                            return emp;
                        })
                    );
                }

                // Stop polling if all employees are synced
                const allSynced = employees.every(
                    (emp) => Number(emp.is_syncing) === 0
                );
                if (allSynced) {
                    clearInterval(interval);
                    setPollingInterval(null);
                }
            } catch (error) {
                console.error("Error checking employee sync status:", error);
            }
        }, 30 * 1000); // 1 minute

        setPollingInterval(interval);

        return () => clearInterval(interval);
    }, [isSyncingBg, employees, setEmployees]);

    return null;
}
