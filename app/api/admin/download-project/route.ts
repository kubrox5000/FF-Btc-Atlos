import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

const EXCLUDE_DIRS = new Set([
  'node_modules', '.next', '.git', '.cache', '.turbo',
  'dist', 'coverage', 'tmp', '.vercel', '.pi',
  'attachements', 'attachments',
])
const EXCLUDE_FILES = new Set([
  '.env.local', '.env.development', '.env.production',
])

// ── CRC-32 ────────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf: Buffer): number {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function dosDateTime() {
  const d = new Date()
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date: (((d.getFullYear() - 1980) & 0x7f) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  }
}

// ── Collect files ─────────────────────────────────────────────────────────────
async function collectFiles(
  dir: string,
  rel: string,
  out: { rel: string; abs: string }[],
) {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    const relPath = rel ? `${rel}/${e.name}` : e.name
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (!EXCLUDE_DIRS.has(e.name)) await collectFiles(abs, relPath, out)
    } else {
      if (!EXCLUDE_FILES.has(e.name)) out.push({ rel: relPath, abs })
    }
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const root = process.cwd()
  const fileList: { rel: string; abs: string }[] = []
  await collectFiles(root, '', fileList)

  // Read all file contents in parallel batches
  const BATCH = 30
  const entries: { name: Buffer; data: Buffer }[] = []
  for (let i = 0; i < fileList.length; i += BATCH) {
    const batch = fileList.slice(i, i + BATCH)
    const read = await Promise.all(
      batch.map(async (f) => {
        try {
          const data = await fs.readFile(f.abs)
          return { name: Buffer.from(f.rel, 'utf8'), data }
        } catch {
          return null
        }
      }),
    )
    for (const r of read) if (r) entries.push(r)
  }

  // ── Build ZIP in memory ───────────────────────────────────────────────────
  const localHeaders: Buffer[] = []
  const centralHeaders: Buffer[] = []
  const fileData: Buffer[] = []
  const offsets: number[] = []
  let dataOffset = 0
  const { time, date } = dosDateTime()

  for (const { name, data } of entries) {
    const crc = crc32(data)
    const sz = data.length
    offsets.push(dataOffset)

    // Local file header (30 bytes + name)
    const lh = Buffer.alloc(30)
    lh.writeUInt32LE(0x04034b50, 0)  // signature
    lh.writeUInt16LE(20, 4)           // version needed
    lh.writeUInt16LE(0x0800, 6)       // UTF-8 flag
    lh.writeUInt16LE(0, 8)            // no compression
    lh.writeUInt16LE(time, 10)
    lh.writeUInt16LE(date, 12)
    lh.writeUInt32LE(crc, 14)
    lh.writeUInt32LE(sz, 18)
    lh.writeUInt32LE(sz, 22)
    lh.writeUInt16LE(name.length, 26)
    lh.writeUInt16LE(0, 28)

    localHeaders.push(lh)
    fileData.push(name, data)
    dataOffset += 30 + name.length + sz
  }

  // Central directory
  const centralOffset = dataOffset
  for (let i = 0; i < entries.length; i++) {
    const { name, data } = entries[i]
    const crc = crc32(data)
    const sz = data.length

    const ch = Buffer.alloc(46)
    ch.writeUInt32LE(0x02014b50, 0)  // signature
    ch.writeUInt16LE(20, 4)
    ch.writeUInt16LE(20, 6)
    ch.writeUInt16LE(0x0800, 8)
    ch.writeUInt16LE(0, 10)
    ch.writeUInt16LE(time, 12)
    ch.writeUInt16LE(date, 14)
    ch.writeUInt32LE(crc, 16)
    ch.writeUInt32LE(sz, 20)
    ch.writeUInt32LE(sz, 24)
    ch.writeUInt16LE(name.length, 28)
    ch.writeUInt16LE(0, 30)
    ch.writeUInt16LE(0, 32)
    ch.writeUInt16LE(0, 34)
    ch.writeUInt16LE(0, 36)
    ch.writeUInt32LE(0, 38)
    ch.writeUInt32LE(offsets[i], 42)

    centralHeaders.push(ch, name)
  }

  const centralSize = centralHeaders.reduce((s, b) => s + b.length, 0)

  // End of central directory
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(entries.length, 8)
  eocd.writeUInt16LE(entries.length, 10)
  eocd.writeUInt32LE(centralSize, 12)
  eocd.writeUInt32LE(centralOffset, 16)
  eocd.writeUInt16LE(0, 20)

  // Combine local headers + data
  const localParts: Buffer[] = []
  let di = 0
  for (const lh of localHeaders) {
    localParts.push(lh, fileData[di], fileData[di + 1])
    di += 2
  }

  const zip = Buffer.concat([...localParts, ...centralHeaders, eocd])

  return new NextResponse(new Uint8Array(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="ff-diamond-project.zip"',
      'Content-Length': String(zip.length),
    },
  })
}
