import { saveAs } from 'file-saver';

export const saveBlob = (blob: Blob, filename: string) => {
  saveAs(blob, filename);
};

export const saveText = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'application/json' });
  saveAs(blob, filename);
};
