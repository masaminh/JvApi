import { mkdtemp as fsMkdtemp, readFile as fsReadFile, rm as fsRm } from 'node:fs/promises'

namespace FsWrapper {
  export function mkdtemp (prefix: string): Promise<string> {
    return fsMkdtemp(prefix)
  }

  export function readFileString (path: string, encoding: BufferEncoding): Promise<string> {
    return fsReadFile(path, encoding)
  }

  export function readFileBuffer (path: string): Promise<Buffer> {
    return fsReadFile(path)
  }

  export function rm (path: string, options: { recursive: boolean, force: boolean }): Promise<void> {
    return fsRm(path, options)
  }
}

export default FsWrapper
