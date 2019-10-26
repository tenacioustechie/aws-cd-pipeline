import sns = require('@aws-cdk/aws-sns');
import subs = require('@aws-cdk/aws-sns-subscriptions');
import sqs = require('@aws-cdk/aws-sqs');
import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');
import { Duration } from '@aws-cdk/core';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const CdPipelineAppFunction = new lambda.Function(this, 'CdPipelineApp', {
      runtime: lambda.Runtime.DOTNET_CORE_2_1, // execution environment
      code: lambda.Code.asset('..\\src\\aws-cd-pipeline\\bin\\Release\\netcoreapp2.1\\aws-cd-pipeline.zip'),
      handler: 'aws-cd-pipeline::aws_cd_pipeline.LambdaEntryPoint::FunctionHandlerAsync',
      timeout: Duration.seconds(30)
    });

    const gateway = new apigw.LambdaRestApi(this, 'ApiEndpoint', {
      handler: CdPipelineAppFunction,
      deployOptions: {
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        stageName: 'prod'
      }
    });

    const queue = new sqs.Queue(this, 'CdkQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const topic = new sns.Topic(this, 'CdkTopic');

    topic.addSubscription(new subs.SqsSubscription(queue));
  }
}
