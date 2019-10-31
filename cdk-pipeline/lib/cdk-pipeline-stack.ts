import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import { App } from '@aws-cdk/core';
import { PipelineStack } from './PipelineStack';

// export class CdkPipelineStack extends cdk.Stack {
//   constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     // The code that defines your stack goes here

//     // const secretGithubOAuthToken = new secretsmanager.Secret(this, 'githubOAuthToken', {
//     //   description: 'OAuth token used to access GitHub for Repository Component ' + props.serviceName
//     // });
//     //const secretGithubOAuthToken = new secretsmanager.Secret.fromSecretArn(this, 'githubOAuthToken', '');
//     // const secret = new secretsmanager.Secret(this, 'githubOAuthToken');
//     // const secret = Secret.fromSecretsManager({secretArn: 'insertARNlater'})
//     const oauth = SecretValue.secretsManager('my-github-token'); 

//     new PipelineStack( this, "CdPipelineStack", {
//       githubOwner: 'tenacioustechie',
//       githubRepo: 'aws-cd-pipeline',
//       stackName: 'CdPipelineStack'
//     });

//     const bucket = new s3.Bucket(this, id + '-packages', {
//       versioned: true
//     });
//   }
// }
