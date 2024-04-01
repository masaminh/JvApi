import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { getTracer } from './powertools';

const client = getTracer().captureAWSv3Client(new S3Client({}));

namespace AwsS3 {
  export type ListObjectsResult = {
    objects: string[];
    prefixes: string[];
  };

  export async function listObjects(bucket: string, prefix: string): Promise<ListObjectsResult> {
    const command = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, Delimiter: '/' });
    const output = await client.send(command);
    const objects = output.Contents?.flatMap((item) => item.Key ?? []) ?? [];
    const prefixes = output.CommonPrefixes?.flatMap((item) => item.Prefix ?? []) ?? [];
    return { objects, prefixes };
  }

  export async function getObject(bucket: string, key: string): Promise<Readable> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const output = await client.send(command);
    const stream = output.Body as Readable;
    return stream;
  }
}

export default AwsS3;
