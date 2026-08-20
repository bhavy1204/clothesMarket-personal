import { useRef, useState, useCallback, useEffect } from "react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

/**
 * ImageCropModal
 * A dependency-free crop + rotate + zoom editor built on <canvas>.
 *
 * Usage:
 *   <ImageCropModal
 *     isOpen={!!file}
 *     file={file}
 *     aspect={1}            // 1 = square (avatar), 16/9 or 3/1 etc for banner
 *     shape="circle"        // "circle" | "rect" — just the visual guide, output is always rect
 *     onClose={() => setFile(null)}
 *     onConfirm={(blob) => { ...upload blob... }}
 *   />
 */
export default function ImageCropModal({
  isOpen,
  file,
  aspect = 1,
  shape = "rect",
  onClose,
  onConfirm,
}) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  const [rotation, setRotation] = useState(0); // degrees, multiples of 90
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // px pan, in frame space
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dragState = useRef(null);

  // Frame size shown on screen (CSS px). Keep it reasonably sized for mobile.
  const FRAME_W = 300;
  const FRAME_H = Math.round(FRAME_W / aspect);

  useEffect(() => {
    if (!file) {
      setImgSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    const img = new Image();
    img.onload = () => setNaturalSize({ w: img.width, h: img.height });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Reset editor state each time a new file is loaded
  useEffect(() => {
    setRotation(0);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [file]);

  const handlePointerDown = (e) => {
    const point = "touches" in e ? e.touches[0] : e;
    dragState.current = {
      startX: point.clientX,
      startY: point.clientY,
      origOffset: { ...offset },
    };
  };

  const handlePointerMove = useCallback((e) => {
    if (!dragState.current) return;
    const point = "touches" in e ? e.touches[0] : e;
    const dx = point.clientX - dragState.current.startX;
    const dy = point.clientY - dragState.current.startY;
    setOffset({
      x: dragState.current.origOffset.x + dx,
      y: dragState.current.origOffset.y + dy,
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const rotateBy = (deg) => setRotation((r) => (r + deg + 360) % 360);

  // Base scale so the image fully covers the frame at zoom=1, accounting for rotation swap
  const getCoverScale = () => {
    if (!naturalSize.w || !naturalSize.h) return 1;
    const swapped = rotation === 90 || rotation === 270;
    const iw = swapped ? naturalSize.h : naturalSize.w;
    const ih = swapped ? naturalSize.w : naturalSize.h;
    return Math.max(FRAME_W / iw, FRAME_H / ih);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const blob = await renderCroppedBlob({
        imgSrc,
        naturalSize,
        rotation,
        zoom,
        offset,
        frameW: FRAME_W,
        frameH: FRAME_H,
        outputW: aspect === 1 ? 512 : 1200,
      });
      onConfirm(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!file) return null;

  const coverScale = getCoverScale();
  const totalScale = coverScale * zoom;
  const swapped = rotation === 90 || rotation === 270;
  const displayW = (swapped ? naturalSize.h : naturalSize.w) * totalScale;
  const displayH = (swapped ? naturalSize.w : naturalSize.h) * totalScale;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit photo" size="sm">
      <div className="flex flex-col gap-4 items-center">
        <div
          ref={containerRef}
          className="relative overflow-hidden bg-black/80 touch-none select-none"
          style={{
            width: FRAME_W,
            height: FRAME_H,
            borderRadius: shape === "circle" ? "9999px" : "8px",
            cursor: "grab",
          }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        >
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Crop preview"
              draggable={false}
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{
                width: displayW,
                height: displayH,
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={() => rotateBy(-90)}
            className="p-2 rounded-md border border-border hover:bg-surface-raised"
            aria-label="Rotate left"
          >
            <RotateCcw size={18} />
          </button>
          <button
            type="button"
            onClick={() => rotateBy(90)}
            className="p-2 rounded-md border border-border hover:bg-surface-raised"
            aria-label="Rotate right"
          >
            <RotateCw size={18} />
          </button>
          <div className="flex items-center gap-2 flex-1 max-w-45">
            <ZoomOut size={16} className="text-text-muted shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <ZoomIn size={16} className="text-text-muted shrink-0" />
          </div>
        </div>

        <div className="flex justify-end gap-2 w-full pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            isLoading={isSubmitting}
            onClick={handleConfirm}
          >
            Use photo
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Renders the current crop/rotate/zoom state to an off-screen canvas
 * and resolves a JPEG Blob, cropped exactly to the visible frame.
 */
function renderCroppedBlob({
  imgSrc,
  naturalSize,
  rotation,
  zoom,
  offset,
  frameW,
  frameH,
  outputW,
}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const outputH = Math.round((frameH / frameW) * outputW);
      const canvas = document.createElement("canvas");
      canvas.width = outputW;
      canvas.height = outputH;
      const ctx = canvas.getContext("2d");

      // Scale factor from on-screen frame px -> output canvas px
      const scaleUp = outputW / frameW;

      const swapped = rotation === 90 || rotation === 270;
      const coverScale = Math.max(
        frameW / (swapped ? naturalSize.h : naturalSize.w),
        frameH / (swapped ? naturalSize.w : naturalSize.h),
      );
      const totalScale = coverScale * zoom * scaleUp;

      ctx.save();
      ctx.translate(
        outputW / 2 + offset.x * scaleUp,
        outputH / 2 + offset.y * scaleUp,
      );
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(
        img,
        (-naturalSize.w * totalScale) / 2,
        (-naturalSize.h * totalScale) / 2,
        naturalSize.w * totalScale,
        naturalSize.h * totalScale,
      );
      ctx.restore();

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
        "image/jpeg",
        0.9,
      );
    };
    img.onerror = reject;
    img.src = imgSrc;
  });
}
