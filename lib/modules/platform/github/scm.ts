import * as git from '../../../util/git/index.ts';
import type {
  CommitFilesConfig,
  CommitFilesResult,
} from '../../../util/git/types.ts';
import { DefaultGitScm } from '../default-scm.ts';
import { assertPrNotInMergeQueue, commitFiles, isGHApp } from './index.ts';

export class GithubScm extends DefaultGitScm {
  override async commitAndPush(
    commitConfig: CommitFilesConfig,
  ): Promise<CommitFilesResult> {
    let platformCommit = commitConfig.platformCommit;
    if (platformCommit === 'auto' && isGHApp()) {
      platformCommit = 'enabled';
    }

    // a queued PR could otherwise merge before the pushed changes take effect
    await assertPrNotInMergeQueue(
      commitConfig.branchName,
      commitConfig.baseBranch,
    );

    return platformCommit === 'enabled'
      ? commitFiles(commitConfig)
      : git.commitFiles(commitConfig);
  }
}
