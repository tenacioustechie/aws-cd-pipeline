import { Construct, Stack } from '@aws-cdk/core';
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codedeploy = require('@aws-cdk/aws-codedeploy');

export interface ServicePipelineProps {
  serviceName: string;
  githubOwner: string;
  githubRepo: string;
}

export class ServicePipeline extends Construct {
  constructor(scope: Construct, id: string, props: ServicePipelineProps) {
    super(scope, id);

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
    const build = new codebuild.Project(this, props.serviceName + '-Build', {
      source: gitHubSource,
      projectName: props.serviceName + '-Build'
    });

    // const pipeline = new codepipeline.Pipeline(this, 'MyFirstPipeline', {
    //   stages: [
    //     {
    //       stageName: 'Source',
    //       actions: [
    //         // see below...
    //       ],
    //     },
    //   ],
    // });
  }
}