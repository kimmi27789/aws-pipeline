#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkProject2Stack } from "../lib/cdk-project2-stack";
import { BillingStack } from "../lib/billing-stack";
import { CodepipelineStack } from "../lib/codepipeline-stack";

const app = new cdk.App();
new CdkProject2Stack(app, "CdkProject2Stack", {});
new BillingStack(app, "billing-stack", {
	budgetAmount: 2,
	emailAddress: "kimmi27789@gmail.com",
});
new CodepipelineStack(app, "codePipeLineStack", {});
