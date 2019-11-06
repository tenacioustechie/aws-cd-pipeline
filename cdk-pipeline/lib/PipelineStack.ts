import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
//import lambda = require('@aws-cdk/aws-lambda');
import s3 = require('@aws-cdk/aws-s3');
import cdk = require('@aws-cdk/core');
import { App, Stack, StackProps } from '@aws-cdk/core';
//import secretsmanager = require('@aws-cdk/aws-secretsmanager');
//import { CfnTaskDefinition } from '@aws-cdk/aws-ecs';
//import { Secret } from '@aws-cdk/aws-ecs';

export interface PipelineStackProps extends StackProps {
  githubOwner: string;
  githubRepo: string;
  //githubOauthSecret: secretsmanager.ISecret;
  //githubTokenSsmPath: string;
  // Not sure we need this, its from: https://docs.aws.amazon.com/cdk/latest/guide/codepipeline_example.html#codepipeline_example_stack
  //readonly lambdaCode: lambda.CfnParametersCode;
}

export class PipelineStack extends Stack {
  constructor(scope: App, id: string, props: PipelineStackProps) {
    super(scope, id);

    const bucketArtefacts = new s3.Bucket(this, id + '-artefacts', {
      versioned: true
    });
    const bucketPackages = new s3.Bucket(this, id + '-packages', {
      versioned: true
    });
    // const secretGithubOAuthToken = new secretsmanager.Secret.fromSecretArn(this, 'githubOAuthToken', '');
    // const oauth = SecretValue.secretsManager('githubOauthToken');
    const secret = cdk.SecretValue.secretsManager('ARN of Secret Manager Object', {
      jsonField: 'GitHubToken',
      versionId: '7bc1e52e-d441-4588-bb3a-d37860674287',
      versionStage: 'AWSCURRENT'
    });

    // TODO: if you go into Codebuild console
    //     - start adding a project
    //     - connect github via oAuth
    //     - then deploy the stack
    //   it will have the oauth connection to github and be able to create this stack
    // or use this command: 
    //   aws codebuild import-source-credentials --server-type GITHUB --auth-type PERSONAL_ACCESS_TOKEN --token <token_value>
    // const oauth = new cdk.SecretParameter(scope, 'GithubPersonalAccessToken', {
    //   ssmParameter: props.service.githubTokenSsmPath
    // });

    // TODO: check we need these
    const sourceOutput = new codepipeline.Artifact();
    const buildOutputApplication = new codepipeline.Artifact('BuildOutputApplication');
    const buildOutputInfrastructure = new codepipeline.Artifact('BuildOutputInfrastructure');

    const githubSourcePiepline = new codepipeline_actions.GitHubSourceAction( {
      actionName: 'GitHub-Source',
      runOrder: 1,
      owner: props.githubOwner,
      repo: props.githubRepo,
      oauthToken: secret,
      //oauthToken: props.githubOauthSecret.secretValue, 
      //oauthToken: secretGithubOAuthToken.secretValue,
      // secretGithubOAuthToken.secretValue,
      //oauthToken: oauth, // gitHubSource, //  cdk.SecretParameter.SecretParameter('mygithubtoken'),
      branch: 'master',
      trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
      output: sourceOutput,
    });
    
    // CodeBuild Application Build Project
    const buildApplication = new codebuild.PipelineProject(this, props.stackName + '-Build', {
      projectName: props.stackName + '-BuildApplication',
      badge: true, 
      buildSpec: codebuild.BuildSpec.fromSourceFilename( 'buildspec-application.yaml')
      // TODO: add more properties from documentation here
      // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-codebuild.PipelineProject.html
    });

    // CodeBuild Infrastructure Build Project
    const buildInfrastructure = new codebuild.PipelineProject(this, props.stackName + '-Build', {
      projectName: props.stackName + '-BuildInfrastructure',
      badge: true,
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec-infrastructure.yaml')
      // TODO: add more properties from documentation here
      // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-codebuild.PipelineProject.html
      // artifacts: bucket
    });

    // Pipline Definition
    const pipeline = new codepipeline.Pipeline(this, props.stackName + '-Pipeline', {
      stages: [
        {
          stageName: codepipeline.ActionCategory.SOURCE,
          actions: [
            githubSourcePiepline
          ],
        },
        {
          stageName: codepipeline.ActionCategory.BUILD,
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: props.stackName + '-BuildApplication',
              project: buildApplication,
              input: sourceOutput,
              outputs: [buildOutputApplication],
            }),
            new codepipeline_actions.CodeBuildAction({
              actionName: props.stackName + '-BuildInfrastructure',
              project: buildInfrastructure,
              input: sourceOutput,
              outputs: [buildOutputInfrastructure],
            }),
            // can add subsequent build steps here (can build CDK app infrastructure code as separate build to functional application code)
          ],
        },
        // Can add additional steps here to perform Approvals, Testing, Invoking (lambda functions)
        {
          stageName: codepipeline.ActionCategory.DEPLOY,
          actions: [
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              actionName: 'InfrastructureApplication',
              templatePath: buildOutputInfrastructure.atPath('cdk-stack.template.json'),
              stackName: props.stackName + 'AppStack',
              adminPermissions: true,
              parameterOverrides: {
              //  ...props.lambdaCode.assign( buildOutputApplication.s3Location),
              },
              extraInputs: [ buildOutputApplication, buildOutputInfrastructure],
            }),
          ],
        },
      ],
    });
  }
}