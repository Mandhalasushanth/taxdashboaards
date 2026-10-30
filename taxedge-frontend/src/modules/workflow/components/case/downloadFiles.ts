import type { CaseDetailController } from '../../hooks/useCaseDetail';
import type { WorkflowCase } from '../../shared/workflow.types';

export interface DownloadableFile {
  readonly url: string;
  readonly name: string;
}

/** Starts a browser download for each file through a temporary link; the server-issued URLs carry the access check. */
export function downloadFiles(files: readonly DownloadableFile[]): number {
  const links = files.map((file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.rel = 'noopener';
    return link;
  });
  links.forEach((link) => {
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
  return links.length;
}

/** Downloads every uploaded document of the case, then records the download so portal work can start. */
export function downloadCaseDocuments(item: WorkflowCase, controller: CaseDetailController): Promise<boolean> {
  const files = item.documents.filter((doc) => doc.fileUrl).map((doc) => ({ url: doc.fileUrl as string, name: doc.fileName ?? `${doc.label}.pdf` }));
  downloadFiles(files);
  return controller.mutate({ type: 'DOCUMENTS_DOWNLOADED' });
}

/**
 * Opens a file in a new browser tab, as a real document link does. Browsers refuse to open inline
 * "data:" links in a tab, so those are turned into a local file link first. The tab is opened at once
 * (inside the click) so it is not treated as a pop-up.
 */
export function openFileInNewTab(url: string): void {
  const tab = window.open('', '_blank');
  if (!tab) {
    window.location.assign(url);
    return;
  }
  tab.opener = null;
  if (!url.startsWith('data:')) {
    tab.location.href = url;
    return;
  }
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      tab.location.href = URL.createObjectURL(blob);
    })
    .catch(() => tab.close());
}
