import { Stack } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { Construct } from "constructs";

interface ecrStackProps {}
export class EcrStack extends Stack {
	constructor(scope: Construct, id: string, props: ecrStackProps) {
		super(scope, id);
		new Repository(this, "ecrRepo", {
			repositoryName: "sample-angular-app",
		});
	}
}
