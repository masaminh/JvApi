import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { JvApiStack } from '../lib/jv_api-stack';

test('snapshot test', () => {
  const app = new cdk.App();

  const stack = new JvApiStack(app, 'MyTestStack', {
    env: { region: 'ap-northeast-1' },
    jvdataBucket: 'jvbucket',
    jvdataPrefix: 'JVDATAPREFIX',
    stage: 'STAGE',
  });

  // スタックからテンプレート(JSON)を生成
  const template = Template.fromStack(stack).toJSON();

  // 生成したテンプレートとスナップショットが同じか検証
  expect(template).toMatchSnapshot();
});
