import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Budget } from "./constructs/budget";

interface billingStackProps {
	budgetAmount: number;
	emailAddress: string;
}

export class BillingStack extends Stack {
	constructor(scope: Construct, id: string, props: billingStackProps) {
		super(scope, id);
		new Budget(this, "budget", {
			budgetAmount: props.budgetAmount,
			emailAddress: props.emailAddress,
		});
	}
}
