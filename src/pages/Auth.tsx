import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('ยินดีต้อนรับกลับมา!');
        navigate('/');
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('อีเมลนี้ถูกลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ');
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success('สร้างบัญชีสำเร็จ! ยินดีต้อนรับสู่สตูดิโอของคุณ');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/50">
      <Card className="w-full max-w-md p-8 card-elevated animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-7 h-7 text-accent-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            ระบบจองถ่ายภาพ
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? 'ยินดีต้อนรับกลับมายังสตูดิโอของคุณ' : 'สร้างบัญชีช่างภาพของคุณ'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-elegant"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-elegant"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isLogin ? 'กำลังเข้าสู่ระบบ...' : 'กำลังสร้างบัญชี...'}
              </>
            ) : (
              isLogin ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? (
              <>ยังไม่มีบัญชี? <span className="text-accent font-medium">สมัครสมาชิก</span></>
            ) : (
              <>มีบัญชีอยู่แล้ว? <span className="text-accent font-medium">เข้าสู่ระบบ</span></>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}
