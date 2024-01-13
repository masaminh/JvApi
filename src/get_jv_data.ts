import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pipeline } from 'node:stream/promises';
import * as tar from 'tar';
import FsWrapper from './wrapper/fs_wrapper';
import AwsS3 from './awss3';
import JvData from './jv_data';

type JvDataProperties = {
  JvlinkVersion: string;
};

function isJvDataProperties(v: unknown): v is JvDataProperties {
  return (
    typeof v === 'object'
    && v !== null
    && 'JvlinkVersion' in v
    && typeof v.JvlinkVersion === 'string'
  );
}

export default async function getJvData(bucket: string, key: string): Promise<JvData> {
  const jvDataDir = await FsWrapper.mkdtemp(join(tmpdir(), 'jvdata-'));

  try {
    const objectStream = await AwsS3.getObject(bucket, key);

    await pipeline(objectStream, tar.x({ C: jvDataDir }));

    const properties = JSON.parse(await FsWrapper.readFileString(join(jvDataDir, 'properties'), 'utf-8'));

    if (!isJvDataProperties(properties)) {
      throw new Error(`Invalid properties: ${key}`);
    }

    const data = await FsWrapper.readFileBuffer(join(jvDataDir, 'data'));

    return { jvlinkVersion: properties.JvlinkVersion, data };
  } finally {
    await FsWrapper.rm(jvDataDir, { recursive: true, force: true });
  }
}
