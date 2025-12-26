#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { JvApiStack } from '../lib/jv_api-stack'
import getStackProps from '../lib/get_stack_props'

const app = new cdk.App()

// eslint-disable-next-line no-new
new JvApiStack(app, 'JvApiStack', getStackProps(app))
