import { aws_budgets as budgets } from "aws-cdk-lib";
import { Construct } from "constructs";

interface BudgetProps {
	budgetAmount: number;
	emailAddress: string;
}

export class Budget extends Construct {
	constructor(scope: Construct, id: string, props: BudgetProps) {
		super(scope, id);
		new budgets.CfnBudget(this, "cfnbudget", {
			budget: {
				budgetName: "mybudget",
				budgetType: "COST",
				timeUnit: "MONTHLY",
				budgetLimit: {
					amount: props.budgetAmount,
					unit: "USD",
				},
			},
			notificationsWithSubscribers: [
				{
					notification: {
						threshold: 50,
						notificationType: "ACTUAL",
						comparisonOperator: "GREATER_THAN",
						thresholdType: "PERCENTAGE",
					},
					subscribers: [
						{
							address: props.emailAddress,
							subscriptionType: "EMAIL",
						},
					],
				},
			],
		});
	}
}
