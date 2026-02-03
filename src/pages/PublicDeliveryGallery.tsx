import { useState } from "react";
import { useParams } from "react-router-dom";
import { usePublicDeliveryGallery, DeliveryImage } from "@/hooks/useDeliveryGallery";
import { useParallelDownload } from "@/hooks/useParallelDownload";
import { useFaceSearch } from "@/hooks/useFaceSearch";
import { FaceSearchDialog } from "@/components/FaceSearchDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DownloadProgressDialog } from "@/components/DownloadProgressDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Camera,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Image,
  Calendar,
  Loader2,
  UserRound,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { PublicGalleryImageGrid } from "@/components/PublicGalleryImageGrid";
import type { GalleryLayout } from "@/components/GalleryLayoutSelector";
import { supabase } from "@/integrations/supabase/client";
import { SafeImage } from "@/components/SafeImage";
import { cn } from "@/lib/utils";

export default function PublicDeliveryGallery() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = usePublicDeliveryGallery(token);
  const [selectedImage, setSelectedImage] = useState<DeliveryImage | null>(null);
  const [isDownloadingSingle, setIsDownloadingSingle] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showFaceSearchDialog, setShowFaceSearchDialog] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const { progress, isDownloading, downloadAll, cancel, reset } = useParallelDownload();

  // Derive safe values – hooks below must be called unconditionally (Rules of Hooks)
  const gallery = data?.gallery ?? null;
  const images: DeliveryImage[] = data?.images ?? [];
  const profile = data?.profile ?? null;

  const galleryLayout = (gallery?.layout as GalleryLayout) || "grid-4";
  const faceSearchEnabled = (gallery as any)?.face_search_enabled !== false;

  // Face search hook – must be called before any early return
  const faceSearch = useFaceSearch(images);

  // Display images - show matched images if face search has results, otherwise all images (sorted)
  const sortedImages = [...images].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });
  const displayImages = faceSearch.matchedImages.length > 0 ? faceSearch.matchedImages : sortedImages;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-xl font-semibold mb-2">ไม่พบแกลเลอรี่</h1>
            <p className="text-muted-foreground">ลิงก์นี้ไม่ถูกต้อง หมดอายุ หรือถูกปิดใช้งาน</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = displayImages.findIndex((img) => img.id === selectedImage.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : displayImages.length - 1;
    setSelectedImage(displayImages[prevIndex]);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = displayImages.findIndex((img) => img.id === selectedImage.id);
    const nextIndex = currentIndex < displayImages.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(displayImages[nextIndex]);
  };

  const handleDownloadSingle = async (image: DeliveryImage) => {
    setIsDownloadingSingle(true);
    try {
      const { data, error } = await supabase.functions.invoke("download-image", {
        body: { url: image.image_url },
      });

      if (error || !data?.data) {
        console.error("Failed to fetch image via proxy:", error);
        toast.error("ดาวน์โหลดไม่สำเร็จ");
        return;
      }

      const binaryString = atob(data.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: data.contentType || "image/jpeg" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = image.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("ดาวน์โหลดสำเร็จ");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("ดาวน์โหลดไม่สำเร็จ");
    } finally {
      setIsDownloadingSingle(false);
    }
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;

    reset();
    setShowProgressDialog(true);

    const result = await downloadAll(images, gallery.title);

    if (result.success) {
      if (result.totalFailed > 0) {
        toast.warning(`ดาวน์โหลดได้ ${result.totalSuccess} รูป (${result.totalFailed} รูปไม่สำเร็จ)`);
      } else {
        toast.success(`ดาวน์โหลดสำเร็จ ${result.totalSuccess} รูป`);
      }
    } else if (result.totalSuccess === 0) {
      toast.error("ไม่สามารถดาวน์โหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleCancelDownload = () => {
    cancel();
    toast.info("ยกเลิกการดาวน์โหลด");
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = images.reduce((sum, img) => sum + (img.file_size || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className={cn("py-4", gallery.full_width_layout ? "px-4 md:px-8" : "container max-w-6xl")}>
          <div className="flex items-center gap-3">
            {profile?.logo_url ? (
              <SafeImage
                src={profile.logo_url}
                alt={profile.studio_name}
                loading="eager"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                <Camera className="w-5 h-5 text-accent-foreground" />
              </div>
            )}
            <div>
              <h1 className="font-display font-semibold">{profile?.studio_name || "Photo Studio"}</h1>
              {profile?.full_name && <p className="text-sm text-muted-foreground">{profile.full_name}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {gallery.show_cover && gallery.cover_image_url && (
        <div className="relative w-full">
          <div className="aspect-[21/9] md:aspect-[3/1] w-full overflow-hidden">
            <SafeImage
              src={gallery.cover_image_url}
              alt={gallery.title}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className={gallery.full_width_layout ? "px-4 md:px-8" : "container max-w-6xl"}>
              <h1 className="text-2xl md:text-4xl font-display font-semibold text-white mb-2">{gallery.title}</h1>
              <p className="text-white/90 text-lg">สำหรับคุณ {gallery.client_name}</p>
            </div>
          </div>
        </div>
      )}

      <main className={cn("py-8", gallery.full_width_layout ? "px-4 md:px-8" : "container max-w-6xl")}>
        {/* Gallery Info - Only show if no cover */}
        {(!gallery.show_cover || !gallery.cover_image_url) && (
          <div className="mb-8">
            <h1 className="text-2xl font-display font-semibold mb-2">{gallery.title}</h1>
            <p className="text-muted-foreground mb-4">สำหรับคุณ {gallery.client_name}</p>
          </div>
        )}

        {gallery.description && <p className="text-sm text-muted-foreground mb-4">{gallery.description}</p>}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
          <span className="flex items-center gap-1">
            <Image className="w-4 h-4" />
            {images.length} รูปภาพ
          </span>
          {totalSize > 0 && <span>ขนาดรวม {formatFileSize(totalSize)}</span>}
          {gallery.expires_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              ดาวน์โหลดได้ถึง {format(new Date(gallery.expires_at), "d MMM yyyy", { locale: th })}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {images.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={handleDownloadAll} disabled={isDownloading} className="gap-2">
              {isDownloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  กำลังดาวน์โหลด...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  ดาวน์โหลดทั้งหมด ({displayImages.length} รูป)
                </>
              )}
            </Button>

            {faceSearchEnabled && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowFaceSearchDialog(true)}
                disabled={faceSearch.isLoading}
                className="gap-2"
              >
                <UserRound className="w-5 h-5" />
                ค้นหารูปของฉัน
              </Button>
            )}

            {/* Sorting */}
            <div className="flex items-center gap-2 ml-auto">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">ล่าสุดก่อน</SelectItem>
                  <SelectItem value="oldest">เก่าสุดก่อน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {images.length > 500 && (
              <p className="text-sm text-muted-foreground w-full">
                * Gallery นี้มีรูปภาพมากกว่า 500 รูป จะถูกแบ่งเป็นหลายไฟล์ ZIP
              </p>
            )}
          </div>
        )}

        {/* Face Search Results Banner */}
        {faceSearch.matchedImages.length > 0 && (
          <div className="mb-6 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
            <span className="text-sm">
              แสดง <span className="font-semibold text-primary">{faceSearch.matchedImages.length}</span>{" "}
              รูปที่พบใบหน้าของคุณ (จากทั้งหมด {images.length} รูป)
            </span>
            <Button variant="ghost" size="sm" onClick={faceSearch.resetSearch}>
              แสดงทั้งหมด
            </Button>
          </div>
        )}

        {/* Gallery Grid */}
        {images.length > 0 ? (
          <PublicGalleryImageGrid
            images={displayImages}
            layout={galleryLayout}
            onImageClick={setSelectedImage}
            onDownload={handleDownloadSingle}
          />
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">ยังไม่มีรูปภาพ</h2>
              <p className="text-muted-foreground">ช่างภาพยังไม่ได้อัปโหลดรูปภาพ</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Download Progress Dialog */}
      <DownloadProgressDialog
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
        progress={progress}
        onCancel={handleCancelDownload}
      />

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent 
          className={cn(
            "p-0 border-none",
            gallery.fullscreen_mode 
              ? "max-w-none w-screen h-screen max-h-screen bg-black" 
              : "max-w-4xl bg-black/95"
          )}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white p-2"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white p-2"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {selectedImage && (
            <div className={cn(
              "flex items-center justify-center",
              gallery.fullscreen_mode ? "w-full h-full" : "min-h-[50vh]"
            )}>
              <SafeImage
                src={selectedImage.image_url}
                alt={selectedImage.filename}
                loading="eager"
                className={cn(
                  "object-contain",
                  gallery.fullscreen_mode 
                    ? "max-w-full max-h-full w-full h-full" 
                    : "max-w-full max-h-[80vh]"
                )}
              />
            </div>
          )}

          {selectedImage && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{selectedImage.filename}</p>
                {selectedImage.file_size && (
                  <p className="text-white/70 text-sm">{formatFileSize(selectedImage.file_size)}</p>
                )}
              </div>
              <Button
                variant="secondary"
                onClick={() => handleDownloadSingle(selectedImage)}
                disabled={isDownloadingSingle}
              >
                {isDownloadingSingle ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                ดาวน์โหลด
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Face Search Dialog */}
      <FaceSearchDialog
        open={showFaceSearchDialog}
        onOpenChange={setShowFaceSearchDialog}
        isLoading={faceSearch.isLoading}
        progress={faceSearch.progress}
        error={faceSearch.error}
        matchedCount={faceSearch.matchedImages.length}
        onSearch={faceSearch.searchFaces}
        onReset={faceSearch.resetSearch}
      />
    </div>
  );
}
