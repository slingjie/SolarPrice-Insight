export type PickFileOptions = {
  description?: string;
  mimeTypes?: Record<string, string[]>;
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
};

const isSecureTopLevelContext = () => {
  if (typeof window === 'undefined') return false;
  if (!window.isSecureContext) return false;
  try {
    return window.top === window;
  } catch {
    return false;
  }
};

const isAbortError = (err: unknown) => {
  const name = (err as any)?.name;
  return name === 'AbortError';
};

export const canUseOpenFilePicker = () =>
  isSecureTopLevelContext() && typeof (window as any).showOpenFilePicker === 'function';

export const canUseSaveFilePicker = () =>
  isSecureTopLevelContext() && typeof (window as any).showSaveFilePicker === 'function';

export const pickSingleFile = async (options: PickFileOptions = {}): Promise<File | null> => {
  const w = window as any;
  if (!isSecureTopLevelContext() || typeof w?.showOpenFilePicker !== 'function') return null;

  const {
    description = 'Select a file',
    mimeTypes = { 'application/octet-stream': ['.*'] },
    multiple = false,
    excludeAcceptAllOption = true
  } = options;

  try {
    const handles = await w.showOpenFilePicker({
      multiple,
      excludeAcceptAllOption,
      types: [
        {
          description,
          accept: mimeTypes
        }
      ]
    });

    const first = handles?.[0];
    if (!first) return null;
    return (await first.getFile()) as File;
  } catch (err) {
    if (isAbortError(err)) return null;
    throw err;
  }
};

export type SaveTextFileOptions = {
  suggestedName: string;
  mimeType?: string;
  description?: string;
  extensions?: string[];
  text: string;
};

export const saveTextFile = async (options: SaveTextFileOptions): Promise<boolean> => {
  const w = window as any;
  if (!isSecureTopLevelContext() || typeof w?.showSaveFilePicker !== 'function') return false;

  const {
    suggestedName,
    mimeType = 'application/octet-stream',
    description = 'Save file',
    extensions = [],
    text
  } = options;

  try {
    const handle = await w.showSaveFilePicker({
      suggestedName,
      types: extensions.length
        ? [
            {
              description,
              accept: {
                [mimeType]: extensions
              }
            }
          ]
        : undefined
    });

    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
    return true;
  } catch (err) {
    if (isAbortError(err)) return true;
    if (
      err instanceof DOMException &&
      err.name === 'NotAllowedError' &&
      /file picker already active/i.test(err.message)
    ) {
      // Chromium can get into a "stuck" state where it believes a picker is already open.
      // Let callers fall back to the <a download> path instead of hard-failing.
      return false;
    }
    throw err;
  }
};
