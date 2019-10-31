import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import { App } from '@aws-cdk/core';
import { PipelineStack } from './PipelineStack';

export class CdkPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    new PipelineStack( this, "CdPipelineStack", {
      githubOwner: 'tenacioustechie',
      githubRepo: 'aws-cd-pipeline',
      stackName: 'CdPipelineStack'
    });

    const bucket = new s3.Bucket(this, id + '-packages', {
      versioned: true
    });
  }
}
