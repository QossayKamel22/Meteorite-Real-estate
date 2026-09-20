"use client";

/**
 * Resizes and compresses an image file in the browser, returning a base64
 * data URL. Used instead of Firebase Storage (which now requires the paid
 * Blaze plan on new projects) — the result is stored directly as a string
 * field on the Firestore document. Firestore's per-document limit is 1MiB,
 * so images are kept well under that with resizing + JPEG compression.
 */
export function resizeAndEncodeImage(
  file: File,
  { maxDimension = 800, quality = 0.82 }: { maxDimension?: number; quality?: number } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error("Image is too large (max 15MB)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load the image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas isn't supported in this browser."));
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        if (dataUrl.length > 900_000) {
          reject(new Error("Image is still too large after compression — try a smaller photo."));
          return;
        }
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
