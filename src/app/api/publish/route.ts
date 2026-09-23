import { writeFileSync } from 'fs';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const password = req.headers.get('x-cms-password');
  if (!process.env.CMS_PASSWORD) {
    return NextResponse.json({ error: 'CMS_PASSWORD env var not set' }, { status: 500 });
  }
  if (password !== process.env.CMS_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  // ── Parse body ──────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const content = JSON.stringify(body, null, 2);

  // ── Env config ──────────────────────────────────────────────────────────
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? 'main';
  const filePath = process.env.GITHUB_CONTENT_PATH ?? 'content/site-data.json';

  if (!token || !owner || !repo) {
    return NextResponse.json(
      { error: 'Missing GitHub env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO' },
      { status: 500 }
    );
  }

  // ── Push to GitHub ──────────────────────────────────────────────────────
  const octokit = new Octokit({ auth: token });

  try {
    // Fetch current SHA — required by the GitHub API to update an existing file
    const { data: current } = await octokit.repos.getContent({
      owner, repo, path: filePath, ref: branch,
    });

    if (Array.isArray(current) || current.type !== 'file') {
      return NextResponse.json({ error: 'Target path is not a file' }, { status: 400 });
    }

    const { data: commit } = await octokit.repos.createOrUpdateFileContents({
      owner, repo, path: filePath, branch,
      message: 'content: update via CMS',
      content: Buffer.from(content).toString('base64'),
      sha: current.sha,
    });

    // Also write locally so the dev site reflects the change immediately
    writeFileSync(join(process.cwd(), 'content', 'site-data.json'), content, 'utf-8');

    return NextResponse.json({ sha: commit.commit.sha });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'GitHub push failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
