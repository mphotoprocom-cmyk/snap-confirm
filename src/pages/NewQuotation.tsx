import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QuotationForm } from '@/components/QuotationForm';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewQuotation() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const createQuotation = useCreateQuotation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
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
    <>
      <div className="mb-6">
        <Link to="/quotations">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isDark ? 'glass-btn' : 'light-glass-btn'}`}>
            <ArrowLeft className="w-4 h-4" />
            กลับไปรายการใบเสนอราคา
          </button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className={`text-2xl font-semibold font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
          สร้างใบเสนอราคา
        </h1>
        <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
          สร้างใบเสนอราคาใหม่สำหรับลูกค้า
        </p>
      </div>

      <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6`}>
        <QuotationForm
          onSubmit={handleSubmit}
          isSubmitting={createQuotation.isPending}
        />
      </div>
    </>
  );
}
