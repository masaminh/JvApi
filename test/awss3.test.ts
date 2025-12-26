import { Readable } from 'node:stream'
import { mockClient } from 'aws-sdk-client-mock'
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { sdkStreamMixin } from '@smithy/util-stream'
import 'aws-sdk-client-mock-vitest/extend'
import AwsS3 from '../src/awss3'

describe('AwsS3', () => {
  const s3Mock = mockClient(S3Client)

  beforeEach(() => {
    vitest.resetAllMocks()
    s3Mock.reset()
  })

  it('AwsS3.listObjects', async () => {
    s3Mock
      .on(ListObjectsV2Command, {
        Bucket: 'BUCKET',
        Prefix: 'PREFIX',
        Delimiter: '/',
      })
      .resolves({
        Contents: [{ Key: 'KEY1' }, { Key: 'KEY2' }, {}],
        CommonPrefixes: [{ Prefix: 'PREFIX1' }, { Prefix: 'PREFIX2' }, {}],
      })

    const result = await AwsS3.listObjects('BUCKET', 'PREFIX')
    expect(result.objects).toHaveLength(2)
    expect(result.objects).toEqual(expect.arrayContaining(['KEY1', 'KEY2']))
    expect(result.prefixes).toHaveLength(2)
    expect(result.prefixes).toEqual(expect.arrayContaining(['PREFIX1', 'PREFIX2']))
    expect(s3Mock).toHaveReceivedCommandTimes(ListObjectsV2Command, 1)
    expect(s3Mock).toHaveReceivedCommandWith(ListObjectsV2Command, {
      Bucket: 'BUCKET',
      Prefix: 'PREFIX',
      Delimiter: '/',
    })
  })

  it('AwsS3.listObjects: noContents, noCommonPrefix', async () => {
    s3Mock
      .on(ListObjectsV2Command, {
        Bucket: 'BUCKET',
        Prefix: 'PREFIX',
        Delimiter: '/',
      })
      .resolves({})

    const result = await AwsS3.listObjects('BUCKET', 'PREFIX')
    expect(result.objects).toHaveLength(0)
    expect(result.prefixes).toHaveLength(0)
    expect(s3Mock).toHaveReceivedCommandTimes(ListObjectsV2Command, 1)
    expect(s3Mock).toHaveReceivedCommandWith(ListObjectsV2Command, {
      Bucket: 'BUCKET',
      Prefix: 'PREFIX',
      Delimiter: '/',
    })
  })

  it('AwsS3.getObject', async () => {
    s3Mock
      .on(GetObjectCommand, {
        Bucket: 'BUCKET',
        Key: 'KEY',
      })
      .resolves({
        Body: sdkStreamMixin(Readable.from([Buffer.from('TEST MESSAGE')])) as any,
      })

    const result = await AwsS3.getObject('BUCKET', 'KEY')
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      result.on('data', (chunk) => chunks.push(chunk))
      result.on('end', () => {
        const buf = Buffer.concat(chunks)
        resolve(buf)
      })
      result.on('error', reject)
    })

    expect(buffer.toString()).toBe('TEST MESSAGE')
    expect(s3Mock).toHaveReceivedCommandTimes(GetObjectCommand, 1)
    expect(s3Mock).toHaveReceivedCommandWith(
      GetObjectCommand,
      {
        Bucket: 'BUCKET',
        Key: 'KEY',
      }
    )
  })
})
