import type { Clip, MediaAsset, Project } from '../../types';

type RenderSettings = { width: number; height: number; fps: number; quality: 'high' | 'medium' | 'low' };

const waitFor = (target: EventTarget, event: string) => new Promise<void>((resolve, reject) => {
  target.addEventListener(event, () => resolve(), { once: true });
  target.addEventListener('error', () => reject(new Error('A media source could not be decoded by this browser.')), { once: true });
});

function drawableClips(project: Project, time: number) {
  return project.tracks.flatMap((track, trackIndex) => track.hidden || track.type !== 'video' ? [] :
    track.clips.filter(clip => clip.startTime <= time && time < clip.endTime).map(clip => ({ clip, trackIndex })));
}

function draw(ctx: CanvasRenderingContext2D, element: CanvasImageSource, asset: MediaAsset, clip: Clip, width: number, height: number) {
  const sourceW = asset.width || width;
  const sourceH = asset.height || height;
  const scale = Math.min(width / sourceW, height / sourceH) * clip.transform.scale;
  ctx.save();
  ctx.translate(width / 2 + clip.transform.x, height / 2 + clip.transform.y);
  ctx.rotate(clip.transform.rotation * Math.PI / 180);
  ctx.scale(clip.transform.flipH ? -scale : scale, clip.transform.flipV ? -scale : scale);
  ctx.globalAlpha = clip.transform.opacity;
  ctx.drawImage(element, -sourceW / 2, -sourceH / 2, sourceW, sourceH);
  ctx.restore();
}

export async function renderTimeline(project: Project, settings: RenderSettings, onProgress: (progress: number) => void): Promise<Blob> {
  if (!('MediaRecorder' in window) || !HTMLCanvasElement.prototype.captureStream) throw new Error('This browser does not support WebM video export.');
  const duration = Math.max(0, ...project.tracks.flatMap(track => track.clips.map(clip => clip.endTime)));
  if (!duration) throw new Error('Add at least one clip to the timeline before exporting.');
  const canvas = document.createElement('canvas');
  canvas.width = settings.width; canvas.height = settings.height;
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0];
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: ({ high: 8, medium: 4, low: 1.5 }[settings.quality]) * 1_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
  const done = new Promise<Blob>((resolve, reject) => { recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' })); recorder.onerror = () => reject(new Error('The browser could not encode the timeline.')); });
  const assets = new Map(project.mediaAssets.map(asset => [asset.id, asset]));
  const videos = new Map<string, HTMLVideoElement>();
  const images = new Map<string, HTMLImageElement>();
  try {
    for (const asset of project.mediaAssets) {
      if (asset.type === 'video') { const video = document.createElement('video'); video.src = asset.url; video.muted = true; video.preload = 'auto'; await waitFor(video, 'loadedmetadata'); videos.set(asset.id, video); }
      if (asset.type === 'image') { const image = new Image(); image.src = asset.url; await waitFor(image, 'load'); images.set(asset.id, image); }
    }
    recorder.start();
    const frameCount = Math.ceil(duration * settings.fps);
    for (let frame = 0; frame < frameCount; frame++) {
      const time = frame / settings.fps;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create export canvas.');
      ctx.fillStyle = project.settings.backgroundColor; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const { clip } of drawableClips(project, time)) {
        const asset = assets.get(clip.assetId); if (!asset) continue;
        if (asset.type === 'image') { const image = images.get(asset.id); if (image) draw(ctx, image, asset, clip, canvas.width, canvas.height); }
        if (asset.type === 'video') { const video = videos.get(asset.id); if (video) { const sourceTime = clip.trimStart + time - clip.startTime; if (Math.abs(video.currentTime - sourceTime) > .002) { video.currentTime = sourceTime; await waitFor(video, 'seeked'); } draw(ctx, video, asset, clip, canvas.width, canvas.height); } }
      }
      (track as MediaStreamTrack & { requestFrame?: () => void }).requestFrame?.(); onProgress((frame + 1) / frameCount);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    recorder.stop(); return await done;
  } finally { videos.forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); }); track.stop(); }
}
