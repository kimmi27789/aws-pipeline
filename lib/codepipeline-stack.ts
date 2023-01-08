import { SecretValue, Stack } from "aws-cdk-lib";
import {
	BuildSpec,
	LinuxBuildImage,
	PipelineProject,
} from "aws-cdk-lib/aws-codebuild";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import {
	CloudFormationCreateUpdateStackAction,
	CodeBuildAction,
	CodeBuildActionType,
	GitHubSourceAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import { Construct } from "constructs";

interface codePipeLineStackProps {}

export class CodepipelineStack extends Stack {
	constructor(
		scope: Construct,
		id: "codePipeLineStack",
		props: codePipeLineStackProps,
	) {
		super(scope, id);
		const pipeline = new Pipeline(this, "codePipeLine", {
			pipelineName: "sample-angular-app-pipeline",
			crossAccountKeys: false,
		});

		const sourceArtifact = new Artifact("SourceArtifact");

		pipeline.addStage({
			stageName: "Source",
			actions: [
				new GitHubSourceAction({
					owner: "kimmi27789",
					repo: "aws-pipeline",
					branch: "main",
					actionName: "pipeline-source",
					output: sourceArtifact,
					oauthToken: SecretValue.secretsManager("git-secret"),
				}),
			],
		});

		const buildArtifact = new Artifact("BuildArtifact");

		pipeline.addStage({
			stageName: "Build",
			actions: [
				new CodeBuildAction({
					actionName: "pipeline-build",
					input: sourceArtifact,
					outputs: [buildArtifact],
					type: CodeBuildActionType.BUILD,
					project: new PipelineProject(this, "buildProject", {
						environment: {
							buildImage: LinuxBuildImage.STANDARD_5_0,
						},
						buildSpec: BuildSpec.fromSourceFilename("buildspec.yml"),
					}),
				}),
			],
		});

		pipeline.addStage({
			stageName: "Update",
			actions: [
				new CloudFormationCreateUpdateStackAction({
					actionName: "pipeline-update",
					stackName: "codePipeLineStack",
					adminPermissions: true,
					templatePath: buildArtifact.atPath("codePipeLineStack.template.json"),
				}),
			],
		});
	}
}
