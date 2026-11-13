export async function uploadFile(file: File): Promise<string> {
  const compressedFile = await compressImage(file);
  
  const fd = new FormData();
  fd.append("file", compressedFile);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.url;
}

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => processCanvas(img, file, resolve);
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function processCanvas(img: HTMLImageElement, originalFile: File, resolve: (value: File) => void) {
  const MAX_WIDTH = 1200;
  const MAX_HEIGHT = 1200;
  let width = img.width;
  let height = img.height;

  if (width > height && width > MAX_WIDTH) {
    height *= MAX_WIDTH / width;
    width = MAX_WIDTH;
  } else if (height >= width && height > MAX_HEIGHT) {
    width *= MAX_HEIGHT / height;
    height = MAX_HEIGHT;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    resolve(originalFile);
    return;
  }
  
  ctx.drawImage(img, 0, 0, width, height);

  canvas.toBlob(
    (blob) => {
      if (blob) {
        const newFile = new File([blob], originalFile.name.replace(/\.[^/.]+$/, "") + ".jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        resolve(newFile);
      } else {
        resolve(originalFile);
      }
    },
    "image/jpeg",
    0.8
  );
}

export function formatThaiDate(date: string | Date, includeTime = false) {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    
    return d.toLocaleDateString('th-TH-u-ca-buddhist', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

export function formatThaiDateLong(date: string | Date) {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    
    return d.toLocaleDateString('th-TH-u-ca-buddhist', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Returns current Thailand (GMT+7) date/time in YYYY-MM-DDTHH:mm format
 * suitable for initialization of date/time inputs.
 * Uses Intl.DateTimeFormat for robust timezone handling on any environment (VPS/Local).
 */
export function getThaiNowISO(): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(new Date());
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;
    
    return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
}

/**
 * Returns current Thailand (GMT+7) date in YYYY-MM-DD format
 */
export function getThaiNowDate(): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const parts = formatter.formatToParts(new Date());
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;
    
    return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
}

/**
 * Formats a date string/object to Thai locale with time and Buddhist Era
 * @example "13 มี.ค. 2567 14:30"
 */
export function formatThaiDateTime(date: string | Date) {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    
    return d.toLocaleString('th-TH-u-ca-buddhist', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
