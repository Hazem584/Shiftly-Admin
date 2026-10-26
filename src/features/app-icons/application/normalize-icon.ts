export async function normalizeIcon(file: File): Promise<Blob> {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 4 * 1024 * 1024
  )
    throw new Error("INVALID_ICON");
  const bitmap = await createImageBitmap(file);
  try {
    if (
      bitmap.width < 128 ||
      bitmap.height < 128 ||
      bitmap.width > 4096 ||
      bitmap.height > 4096
    )
      throw new Error("INVALID_ICON");
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("INVALID_ICON");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, 512, 512);
    const size = Math.min(bitmap.width, bitmap.height);
    context.drawImage(
      bitmap,
      (bitmap.width - size) / 2,
      (bitmap.height - size) / 2,
      size,
      size,
      0,
      0,
      512,
      512,
    );
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (v) => (v ? resolve(v) : reject(new Error("INVALID_ICON"))),
        "image/png",
      ),
    );
    if (blob.size > 1024 * 1024) throw new Error("INVALID_ICON");
    return blob;
  } finally {
    bitmap.close();
  }
}
