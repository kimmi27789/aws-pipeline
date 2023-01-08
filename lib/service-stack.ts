import { Stack, aws_elasticbeanstalk, aws_s3_assets } from "aws-cdk-lib";
import { Construct } from "constructs";

interface serviceStackProps {}

export class ServiceStack extends Stack {
	constructor(scope: Construct, id: string, props: serviceStackProps) {
		super(scope, id);

		// Construct an S3 asset from the ZIP located from directory up.
		const elbZipArchive = new aws_s3_assets.Asset(this, "MyElbAppZip", {
			path: `${__dirname}/../php.zip`,
		});

		const appName = "MyApp";
		const app = new aws_elasticbeanstalk.CfnApplication(this, "Application", {
			applicationName: appName,
		});

		// Example of some options which can be configured
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
					// Here you could reference an instance profile by ARN (e.g. myIamInstanceProfile.attrArn)
					// For the default setup, leave this as is (it is assumed this role exists)
					// https://stackoverflow.com/a/55033663/6894670
					value: "aws-elasticbeanstalk-ec2-role",
				},
				{
					namespace: "aws:elasticbeanstalk:container:nodejs",
					optionName: "NodeVersion",
					value: "10.16.3",
				},
			];

		// Create an app version from the S3 asset defined above
		// The S3 "putObject" will occur first before CF generates the template
		const appVersionProps = new aws_elasticbeanstalk.CfnApplicationVersion(
			this,
			"AppVersion",
			{
				applicationName: appName,
				sourceBundle: {
					s3Bucket: elbZipArchive.s3BucketName,
					s3Key: elbZipArchive.s3ObjectKey,
				},
			},
		);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const elbEnv = new aws_elasticbeanstalk.CfnEnvironment(
			this,
			"Environment",
			{
				environmentName: "MySampleEnvironment",
				applicationName: app.applicationName || appName,
				optionSettings: optionSettingProperties,
				solutionStackName: "64bit Amazon Linux 2 v3.5.3 running PHP 8.1",
				// This line is critical - reference the label created in this same stack
				versionLabel: appVersionProps.ref,
			},
		);
		// Also very important - make sure that `app` exists before creating an app version
		appVersionProps.addDependency(app);
	}
}
