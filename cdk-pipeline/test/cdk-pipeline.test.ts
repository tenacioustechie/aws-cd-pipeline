import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import CdkPipeline = require('../lib/PipelineStack');

// test('Empty Stack', () => {
//     const app = new cdk.App();
//     // WHEN
//     const stack = new CdkPipeline.PipelineStack(app, 'MyTestStack');
//     // THEN
//     expectCDK(stack).to(matchTemplate({
//       "Resources": {}
//     }, MatchStyle.EXACT))
// });