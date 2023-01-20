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

		const pipelineSourceArtifact = new Artifact("pipelineSourceArtifact");
		const serviceSourceArtifact = new Artifact("serviceSourceArtifact");

		pipeline.addStage({
			stageName: "Source",
			actions: [
				new GitHubSourceAction({
					owner: "kimmi27789",
					repo: "aws-pipeline",
					branch: "main",
					actionName: "pipeline-source",
					output: pipelineSourceArtifact,
					oauthToken: SecretValue.secretsManager("git-secret"),
				}),
				new GitHubSourceAction({
					owner: "kimmi27789",
					repo: "docker",
					branch: "master",
					actionName: "service-source",
					output: serviceSourceArtifact,
					oauthToken: SecretValue.secretsManager("git-secret"),
				}),
			],
		});

		const pipelienBuildArtifact = new Artifact("pipelienBuildArtifact");
		const serviceBuildArtifact = new Artifact("serviceBuildArtifact");

		pipeline.addStage({
			stageName: "Build",
			actions: [
				new CodeBuildAction({
					actionName: "pipeline-build",
					input: pipelineSourceArtifact,
					outputs: [pipelienBuildArtifact],
					type: CodeBuildActionType.BUILD,
					project: new PipelineProject(this, "pipelineBuildProject", {
						environment: {
							buildImage: LinuxBuildImage.STANDARD_5_0,
						},
						buildSpec: BuildSpec.fromSourceFilename("buildspec.yml"),
					}),
				}),
				new CodeBuildAction({
					actionName: "service-build",
					input: serviceSourceArtifact,
					outputs: [serviceBuildArtifact],
					type: CodeBuildActionType.BUILD,
					project: new PipelineProject(this, "serviceBuildProject", {
						environment: {
							buildImage: LinuxBuildImage.STANDARD_5_0,
							privileged: true,
						},
						environmentVariables: {
							environment: {
								value: "dev",
							},
							AWS_DEFAULT_REGION: {
								value: "ap-south-1",
							},
							AWS_ACCOUNT_ID: {
								value: 874031905833,
							},
							IMAGE_REPO_NAME: {
								value: "sample-angular-app",
							},
							IMAGE_TAG: {
								value: "latest",
							},
							CONTAINER_NAME: {
								value: "sample-angular-app",
							},
							DOCKERHUB_USERNAME: {
								value: "kimmi27789",
							},
							DOCKERHUB_PASSWORD: {
								value: "kimmi27071989",
							},
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
					templatePath: pipelienBuildArtifact.atPath(
						"codePipeLineStack.template.json",
					),
				}),
			],
		});
	}
}
