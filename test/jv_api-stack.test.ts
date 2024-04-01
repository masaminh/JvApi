import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { readFileSync } from 'node:fs';
import { JvApiStack } from '../lib/jv_api-stack';

describe('JvApiStack', () => {
  let template: Template;
  let context: any;

  beforeAll(() => {
    context = JSON.parse(readFileSync('cdk.context.json', 'utf-8'));
    const app = new cdk.App();
    const stack = new JvApiStack(app, 'NotifyHorseInfosStack', {
      jvdataBucket: context.jvdataBucket,
      jvdataPrefix: context.jvdataPrefix,
      stage: context.stage,
      stackName: context.stackName,
    });

    template = Template.fromStack(stack);
  });

  it('Parameter FunctionARN', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: `/${context.stage}/JvApi/FunctionArn`,
      Type: 'String',
    });
  });

  it('Url AuthType', () => {
    template.hasResourceProperties('AWS::Lambda::Url', {
      AuthType: 'NONE',
    });
  });

  it('Lambda Runtime Version', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs20.x',
    });
  });

  it('Tracing', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      TracingConfig: { Mode: 'Active' },
    });
  });
});
