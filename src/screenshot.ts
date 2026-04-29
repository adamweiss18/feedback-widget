import html2canvas from "html2canvas-pro";

export async function captureViewport(): Promise<Blob> {
  const canvas = await html2canvas(document.body, {
    useCORS: true,
    logging: false,
    scale: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: null,
  });
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob returned null"))),
      "image/png",
      0.9,
    );
  });
}
