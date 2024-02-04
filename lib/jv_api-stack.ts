import { Stack, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import JvApiStackProps from './jv_api_stack_props';

// eslint-disable-next-line import/prefer-default-export
export class JvApiStack extends Stack {
  constructor(scope: Construct, id: string, props: JvApiStackProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, 'ApiFunctionLogGroup', {
      logGroupName: `${this.stackName}/ApiFunction`,
      retention: RetentionDays.ONE_MONTH,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const apiFunction = new NodejsFunction(this, 'ApiFunction', {
      entry: 'src/handler.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(30),
      environment: {
        JVDATA_BUCKET: props.jvdataBucket,
        JVDATA_PREFIX: props.jvdataPrefix,
      },
      logGroup,
    });

    const url = apiFunction.addFunctionUrl();

    const s3 = Bucket.fromBucketName(this, 'CacheBucket', props.jvdataBucket);

    s3.grantRead(apiFunction);

    // eslint-disable-next-line no-new
    new StringParameter(this, 'ApiUrlParameter', {
      parameterName: `/${props.stage}/JvApi/Url`,
      stringValue: url.url,
    });

    // eslint-disable-next-line no-new
    new StringParameter(this, 'FunctionArnParameter', {
      parameterName: `/${props.stage}/JvApi/FunctionArn`,
      stringValue: apiFunction.functionArn,
    });
  }
}
