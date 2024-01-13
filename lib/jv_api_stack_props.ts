import { StackProps } from 'aws-cdk-lib';

interface JvApiStackProps extends StackProps {
  jvdataBucket: string;
  jvdataPrefix: string;
  stage: string;
}

export default JvApiStackProps;
