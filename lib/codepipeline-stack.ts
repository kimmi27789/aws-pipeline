import { SecretValue, Stack } from "aws-cdk-lib";
import {
	BuildSpec,
	LinuxBuildImage,
	PipelineProject,
} from "aws-cdk-lib/aws-codebuild";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import {
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
		const buildArtifact = new Artifact("BuildArtifact");

		pipeline.addStage({
			stageName: "Source",
			actions: [
				new GitHubSourceAction({
					owner: "kimmi27789",
					repo: "aws-pipeline",
					branch: "master",
					actionName: "pipeline-source",
					output: sourceArtifact,
					oauthToken: SecretValue.secretsManager("github-token"),
				}),
			],
		});

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
						buildSpec: BuildSpec.fromSourceFilename(
							"./build-spec/buildspec.yml",
						),
					}),
				}),
			],
		});
	}
}