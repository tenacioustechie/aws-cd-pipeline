import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
// import cdk from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');
import s3 = require('@aws-cdk/aws-s3');
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import codedeploy = require('@aws-cdk/aws-codedeploy');
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { GitHubSourceAction } from '@aws-cdk/aws-codepipeline-actions';

export interface ServicePipelineProps {
  serviceName: string;
  githubOwner: string;
  githubRepo: string;
  githubTokenSsmPath: string;
}

export class ServicePipeline extends Stack {
  constructor(scope: Construct, id: string, props: ServicePipelineProps) {
    super(scope, id);

    const bucket = new s3.Bucket(this, id + '-artefacts');

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

    const gitHubSource = codebuild.Source.gitHub({
      owner: props.githubOwner,
      repo: props.githubRepo,
      webhook: true, // optional, default: true if `webhookFilteres` were provided, false otherwise
      // webhookFilters: [
      //   codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH), //.andBranchIs('master'),
      //   codebuild.FilterGroup.inEventOf(codebuild.EventAction.PULL_REQUEST_CREATED),
      //   codebuild.FilterGroup.inEventOf(codebuild.EventAction.PULL_REQUEST_UPDATED),
      //   codebuild.FilterGroup.inEventOf(codebuild.EventAction.PULL_REQUEST_MERGED)
      // ], // optional, by default all pushes and Pull Requests will trigger a build
    });

    const githubSourcePiepline = new codepipeline_actions.GitHubSourceAction( {
      actionName: 'GitHub-Source',
      runOrder: 1,
      owner: props.githubOwner + '/' + props.githubRepo,
      repo: props.githubRepo,
      oauthToken: gitHubSource, //  cdk.SecretParameter.SecretParameter('mygithubtoken'),
      branch: 'master',
      trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
      output: sourceOutput,
    });

    const oauth = cdk.SecretValue.secretsManager('my-github-token'); 
    var source = new gitHubSource(this, 'GitHubAction', { 
      oauthToken: oauth,
    });

    // TODO: convert to PipelineProject
    const buildProject = new codebuild.PipelineProject(this, props.serviceName + '-Build', {
      projectName: props.serviceName + '-Build',
      badge: true, 
      buildSpec: codebuild.BuildSpec.fromSourceFilename( 'buildspec.yaml')
      // TODO: add more properties from documentation here
      // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-codebuild.PipelineProject.html
      // artifacts: bucket
    });

    const sourceOutput = new codepipeline.Artifact();
    const cdkBuildOutput = new codepipeline.Artifact('CdkBuildOutput');
    const lambdaBuildOutput = new codepipeline.Artifact('LambdaBuildOutput');

    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      stages: [
        {
          stageName: codepipeline.ActionCategory.SOURCE,
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              actionName: 'GitHub-Source',
              runOrder: 1,
              owner: props.githubOwner + '/' + props.githubRepo,
              oauthToken: gitHubSource, //  cdk.SecretParameter.SecretParameter('mygithubtoken'),
              branch: 'master',
              trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
              output: sourceOutput,
            })
          ],
        },
      ],
    });
  }
}