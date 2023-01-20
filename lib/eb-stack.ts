import { Stack, aws_iam, aws_elasticbeanstalk } from "aws-cdk-lib";
import { Construct } from "constructs";

interface EbsStackProps {}

export class EbsStack extends Stack {
	constructor(scope: Construct, id: string, props: EbsStackProps) {
		super(scope, id);
		const appName = "sample-app";
		// EBS IAM Roles
		const EbInstanceRole = new aws_iam.Role(
			this,
			`${appName}-aws-elasticbeanstalk-ec2-role`,
			{
				assumedBy: new aws_iam.ServicePrincipal("ec2.amazonaws.com"),
			},
		);

		const managedPolicy = aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
			"AWSElasticBeanstalkWebTier",
		);

		EbInstanceRole.addManagedPolicy(managedPolicy);

		const profileName = `${appName}-InstanceProfile`;
		const instanceProfile = new aws_iam.CfnInstanceProfile(this, profileName, {
			instanceProfileName: profileName,
			roles: [EbInstanceRole.roleName],
		});

		const node = this.node;
		const platform = node.tryGetContext("platform");

		const optionSettingProperties: aws_elasticbeanstalk.CfnEnvironment.OptionSettingProperty[] =
			[
				{
					namespace: "aws:autoscaling:launchconfiguration",
					optionName: "InstanceType",
					value: "t3.small",
				},
				{
					namespace: "aws:autoscaling:launchconfiguration",
					optionName: "IamInstanceProfile",
					value: profileName,
				},
			];

		// EBS Application and Environment
		const app = new aws_elasticbeanstalk.CfnApplication(this, "Application", {
			applicationName: `${appName}-EB-App`,
		});

		const env = new aws_elasticbeanstalk.CfnEnvironment(this, "Environment", {
			environmentName: `${appName}-EB-Env`,
			applicationName: `${appName}-EB-App`,
			platformArn: platform,
			solutionStackName: "64bit Amazon Linux 2 v3.5.3 running Docker",
			optionSettings: optionSettingProperties,
		});

		env.addDependency(app);
	}
}
