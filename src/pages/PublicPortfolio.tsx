import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicPortfolio, PortfolioImage } from '@/hooks/usePortfolio';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Camera, MapPin, Phone, Mail, Package, X, ChevronLeft, ChevronRight } from 'lucide-react';

const JOB_TYPE_LABELS: Record<string, string> = {
  wedding: 'งานแต่งงาน',
  event: 'อีเว้นท์',
  corporate: 'องค์กร',
  portrait: 'Portrait',
  other: 'อื่นๆ',
};

export default function PublicPortfolio() {
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading, error } = usePublicPortfolio(userId);
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);
  const [activeTab, setActiveTab] = useState('all');

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

  if (error || !data?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-xl font-semibold mb-2">ไม่พบ Portfolio</h1>
            <p className="text-muted-foreground">Portfolio นี้ไม่มีอยู่หรือถูกปิดการใช้งาน</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, images, packages } = data;

  // Get unique job types from images
  const jobTypes = ['all', ...new Set(images.map((img) => img.job_type))];

  const filteredImages = activeTab === 'all' 
    ? images 
    : images.filter((img) => img.job_type === activeTab);

  const handlePrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    setSelectedImage(filteredImages[prevIndex]);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
    const nextIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const handleShare = (platform: 'line' | 'facebook' | 'copy') => {
    const url = window.location.href;
    const text = `ดู Portfolio ผลงานของ ${profile.studio_name}`;
    
    switch (platform) {
      case 'line':
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container max-w-6xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile.logo_url ? (
                <img 
                  src={profile.logo_url} 
                  alt={profile.studio_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-accent-foreground" />
                </div>
              )}
              <div>
                <h1 className="font-display font-semibold">{profile.studio_name}</h1>
                {profile.full_name && (
                  <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                )}
              </div>
            </div>
            
            {/* Share buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('line')}
                className="gap-1.5 text-[#00B900] hover:text-[#00B900] hover:bg-[#00B900]/10"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                <span className="hidden sm:inline">LINE</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="gap-1.5 text-[#1877F2] hover:text-[#1877F2] hover:bg-[#1877F2]/10"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="hidden sm:inline">Facebook</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl py-8">
        {/* Contact Info */}
        {(profile.phone || profile.email || profile.address) && (
          <div className="flex flex-wrap gap-4 mb-8 text-sm text-muted-foreground">
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                <Phone className="w-4 h-4" />
                {profile.phone}
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                <Mail className="w-4 h-4" />
                {profile.email}
              </a>
            )}
            {profile.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {profile.address}
              </span>
            )}
          </div>
        )}

        {/* Gallery */}
        {images.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-display font-semibold mb-6">ผลงาน</h2>
            
            {jobTypes.length > 2 && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                  {jobTypes.map((type) => (
                    <TabsTrigger key={type} value={type}>
                      {type === 'all' ? 'ทั้งหมด' : JOB_TYPE_LABELS[type] || type}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className="group relative overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <AspectRatio ratio={1}>
                    <img
                      src={image.image_url}
                      alt={image.title || 'Portfolio image'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </AspectRatio>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  {image.is_featured && (
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      แนะนำ
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Packages */}
        {packages.length > 0 && (
          <section>
            <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
              <Package className="w-6 h-6" />
              แพ็กเกจบริการ
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{pkg.name}</h3>
                      {pkg.job_type && (
                        <Badge variant="outline">
                          {JOB_TYPE_LABELS[pkg.job_type] || pkg.job_type}
                        </Badge>
                      )}
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">
                        {pkg.description}
                      </p>
                    )}
                    <p className="text-xl font-semibold text-primary">
                      ฿{pkg.price.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {images.length === 0 && packages.length === 0 && (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">ยังไม่มีผลงาน</h2>
            <p className="text-muted-foreground">ช่างภาพยังไม่ได้เพิ่มผลงานลงใน Portfolio</p>
          </div>
        )}
      </main>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          
          {filteredImages.length > 1 && (
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
            <div className="flex items-center justify-center min-h-[50vh]">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title || 'Portfolio image'}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          )}
          
          {selectedImage?.title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white font-semibold">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-white/80 text-sm">{selectedImage.description}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
