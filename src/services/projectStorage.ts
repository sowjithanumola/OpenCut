import { openDB } from 'idb';
import type { MediaAsset, Project } from '../types';

const dbPromise = openDB('opencut', 1, {
  upgrade(db) {
    db.createObjectStore('projects', { keyPath: 'id' });
    db.createObjectStore('media', { keyPath: 'id' });
  },
});

type StoredAsset = Omit<MediaAsset, 'file' | 'url' | 'thumbnailUrl'> & { thumbnailUrl?: string };
type StoredProject = Omit<Project, 'mediaAssets'> & { mediaAssets: StoredAsset[] };

function serialise(project: Project): StoredProject {
  return {
    ...project,
    mediaAssets: project.mediaAssets.map(({ file: _file, url: _url, ...asset }) => asset),
  };
}

async function hydrate(project: StoredProject): Promise<Project> {
  const db = await dbPromise;
  const assets = await Promise.all(project.mediaAssets.map(async asset => {
    const file = await db.get('media', asset.id) as File | undefined;
    if (!file) throw new Error(`The source file for “${asset.name}” is missing from local storage.`);
    return { ...asset, file, url: URL.createObjectURL(file) } as MediaAsset;
  }));
  return { ...project, mediaAssets: assets };
}

export async function saveProject(project: Project): Promise<void> {
  const db = await dbPromise;
  const tx = db.transaction(['projects', 'media'], 'readwrite');
  for (const asset of project.mediaAssets) {
    if (!asset.file) throw new Error(`Cannot save “${asset.name}”: its original file is unavailable.`);
    await tx.objectStore('media').put(asset.file, asset.id);
  }
  await tx.objectStore('projects').put(serialise(project));
  await tx.done;
}

export async function loadProject(id: string): Promise<Project | null> {
  const stored = await (await dbPromise).get('projects', id) as StoredProject | undefined;
  return stored ? hydrate(stored) : null;
}

export async function listProjects(): Promise<StoredProject[]> {
  return (await (await dbPromise).getAll('projects') as StoredProject[])
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteStoredMedia(assetId: string): Promise<void> {
  await (await dbPromise).delete('media', assetId);
}
