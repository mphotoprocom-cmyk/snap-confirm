import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CloudUpload, CheckCircle, XCircle, Loader2, Database, ArrowRight, Cloud } from 'lucide-react';

interface MigrationResult {
  migrated: number;
  failed: number;
  errors: string[];
}

interface MigrationResults {
  portfolio_images: MigrationResult;
  delivery_images: MigrationResult;
  profiles_logo: MigrationResult;
  profiles_signature: MigrationResult;
  invitation_images: MigrationResult;
  delivery_covers: MigrationResult;
  invitation_covers: MigrationResult;
}

export default function AdminMigration() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<MigrationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      if (authLoading) return; // รอ auth loading ก่อน
      
      if (!user) {
        setCheckingAdmin(false);
        return;
      }
      
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        setIsAdmin(!!data);
      } catch (err) {
        console.error('Error checking admin:', err);
      } finally {
        setCheckingAdmin(false);
      }
    }
    checkAdmin();
  }, [user, authLoading]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const runMigration = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('migrate-to-r2', {
        method: 'POST',
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResults(data.results);
      toast.success('การย้ายข้อมูลเสร็จสิ้น!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error('เกิดข้อผิดพลาด: ' + errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  const getTotalStats = () => {
    if (!results) return { migrated: 0, failed: 0 };
    
    return Object.values(results).reduce(
      (acc, r) => ({
        migrated: acc.migrated + r.migrated,
        failed: acc.failed + r.failed,
      }),
      { migrated: 0, failed: 0 }
    );
  };

  const categoryLabels: Record<string, string> = {
    portfolio_images: 'รูปภาพ Portfolio',
    delivery_images: 'รูปภาพ Delivery',
    profiles_logo: 'โลโก้โปรไฟล์',
    profiles_signature: 'ลายเซ็น',
    invitation_images: 'รูปภาพการ์ดเชิญ',
    delivery_covers: 'ปก Delivery Gallery',
    invitation_covers: 'ปกการ์ดเชิญ',
  };

  return (
    <>
      <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-6 mb-8`}>
        <div className="flex items-center gap-2 mb-2">
          <Database className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <ArrowRight className="w-4 h-4" />
          <Cloud className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>ย้ายข้อมูลไปยัง Cloudflare R2</h2>
        </div>
        <p className={`text-sm mb-6 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          ย้ายไฟล์รูปภาพทั้งหมดจาก Supabase Storage ไปยัง Cloudflare R2
          และอัปเดต URL ในฐานข้อมูลอัตโนมัติ
        </p>

        <div className="space-y-6">
          {/* Info */}
          <div className={`rounded-lg p-4 text-sm space-y-2 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <p className={isDark ? 'text-white' : 'text-gray-900'}><strong>ข้อมูลที่จะย้าย:</strong></p>
            <ul className={`list-disc list-inside space-y-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                <li>รูปภาพ Portfolio (portfolio_images)</li>
                <li>รูปภาพส่งงาน Delivery (delivery_images, cover)</li>
                <li>โลโก้และลายเซ็นโปรไฟล์ (profiles)</li>
                <li>รูปภาพการ์ดเชิญ (invitation_images, cover)</li>
              </ul>
            <p className="text-amber-500 mt-3">
              ⚠️ การดำเนินการนี้อาจใช้เวลาหลายนาที ขึ้นอยู่กับจำนวนไฟล์
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={runMigration}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังย้ายข้อมูล...
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4" />
                เริ่มย้ายข้อมูลไปยัง R2
              </>
            )}
          </button>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-4 flex items-start gap-2">
                <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">เกิดข้อผิดพลาด</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

          {/* Results */}
          {results && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex gap-4">
                <div className={`flex-1 rounded-lg p-4 text-center ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                  <div className="text-3xl font-bold text-green-500">{getTotalStats().migrated}</div>
                  <div className="text-sm text-green-500">ย้ายสำเร็จ</div>
                </div>
                <div className={`flex-1 rounded-lg p-4 text-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                  <div className="text-3xl font-bold text-red-500">{getTotalStats().failed}</div>
                  <div className="text-sm text-red-500">ล้มเหลว</div>
                </div>
              </div>

              {/* Details */}
              <div className={`rounded-lg divide-y ${isDark ? 'border-white/10 divide-white/10' : 'border-gray-200 divide-gray-200'} border`}>
                {Object.entries(results).map(([key, result]) => (
                  <div key={key} className="flex items-center justify-between p-3">
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{categoryLabels[key] || key}</span>
                    <div className="flex items-center gap-2">
                      {result.migrated > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {result.migrated}
                        </Badge>
                      )}
                      {result.failed > 0 && (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          {result.failed}
                        </Badge>
                      )}
                      {result.migrated === 0 && result.failed === 0 && (
                        <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>ไม่มีข้อมูล</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
