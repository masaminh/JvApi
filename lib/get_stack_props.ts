import { Construct } from 'constructs';
import JvApiStackProps from './jv_api_stack_props';

export default function getStackProps(app: Construct): JvApiStackProps {
  const jvdataBucket = app.node.tryGetContext('jvdataBucket');
  const jvdataPrefix = app.node.tryGetContext('jvdataPrefix');
  const stage = app.node.tryGetContext('stage');
  const stackName = app.node.tryGetContext('stackName');

  if (typeof jvdataBucket !== 'string' || typeof jvdataPrefix !== 'string' || typeof stage !== 'string') {
    throw new Error('jvdataBucket and jvdataPrefix and stage must be set in context');
  }

  if (stackName !== undefined && typeof stackName !== 'string') {
    throw new Error('stackName must be string');
  }

  return {
    jvdataBucket, jvdataPrefix, stage, stackName,
  };
}
