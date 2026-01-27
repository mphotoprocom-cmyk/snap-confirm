import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { QuotationForm } from '@/components/QuotationForm';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewQuotation() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const createQuotation = useCreateQuotation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (data: any) => {
    const quotation = await createQuotation.mutateAsync(data);
    navigate(`/quotations/${quotation.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-6">
          <Link to="/quotations">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              กลับไปรายการใบเสนอราคา
            </Button>
          </Link>
        </div>

        <div className="page-header">
          <h1 className="page-title">สร้างใบเสนอราคา</h1>
          <p className="page-subtitle">สร้างใบเสนอราคาใหม่สำหรับลูกค้า</p>
        </div>

        <div className="card-elevated p-6 animate-fade-in">
          <QuotationForm
            onSubmit={handleSubmit}
            isSubmitting={createQuotation.isPending}
          />
        </div>
      </main>
    </div>
  );
}
