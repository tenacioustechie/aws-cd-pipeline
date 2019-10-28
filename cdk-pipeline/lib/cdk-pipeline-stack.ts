import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import { ServicePipeline } from './ServicePipelineStack';
import { App } from '@aws-cdk/core';

export class CdkPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    new ServicePipeline( this, "CdPipelineStack", {
      githubOwner: 'tenacioustechie',
      githubRepo: 'aws-cd-pipeline',
      serviceName: id
    });

    const bucket = new s3.Bucket(this, id + '-packages', {
      versioned: true
    });
  }
}
