import React from "react";
import { Card, CardBody } from "@material-tailwind/react";
import Button from "./Button";

export default function CompanyPlans({ plans = [], subscription = null }) {
    if (!plans.length) {
        return <p>No plans available.</p>;
    }

    // Filter plans
    const filteredPlans = plans.filter(
        (plan) =>
            plan.active &&
            (!plan.is_custom ||
                (subscription && plan.id === subscription.plan_id))
    );

    return (
        <div className="space-y-5">
            <h2 className="text-xl font-bold">Company Plans</h2>

            <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
                {filteredPlans.map((plan) => {
                    const isSubscribed =
                        subscription && plan.id === subscription.plan_id;

                    return (
                        <Card
                            key={plan.id}
                            className={`rounded-2xl shadow-sm border-2 transition hover:shadow-md ${
                                isSubscribed
                                    ? "border-primary"
                                    : "border-gray-200"
                            }`}
                        >
                            <CardBody className="p-5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {plan.name}
                                    </h3>
                                    {plan.is_custom ? (
                                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                                            Custom
                                        </span>
                                    ) : null}
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Cards Included:
                                    </p>
                                    <p className="font-medium">
                                        {plan.cards_included}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Price:
                                    </p>
                                    <p className="font-medium">
                                        <span className="font-bold">
                                            £{plan.price_monthly}
                                        </span>
                                        /month or{" "}
                                        <span className="font-bold">
                                            £{plan.price_annual}
                                        </span>
                                        /year
                                    </p>
                                </div>

                                <div>
                                    {isSubscribed ? (
                                        <Button
                                            variant="secondary"
                                            className="w-full"
                                            disabled
                                        >
                                            Subscribed
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            className="w-full"
                                            onClick={() =>
                                                window.open(
                                                    "mailto:admin@ppsbusinesscards.de?subject=Plan%20Inquiry&body=I%20would%20like%20to%20subscribe%20to%20the%20plan:%20" +
                                                        plan.name,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            Contact Admin
                                        </Button>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
