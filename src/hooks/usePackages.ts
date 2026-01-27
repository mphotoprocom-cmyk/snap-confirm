import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package } from '@/types/package';
import { toast } from 'sonner';

export function usePackages() {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Package[];
    },
  });
}

export function useActivePackages() {
  return useQuery({
    queryKey: ['packages', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Package[];
    },
  });
}

export function usePackage(id: string | undefined) {
  return useQuery({
    queryKey: ['package', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Package;
    },
    enabled: !!id,
  });
}

interface CreatePackageData {
  name: string;
  price: number;
  description?: string;
  job_type?: string;
  is_active?: boolean;
  sort_order?: number;
}

export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePackageData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertData: any = {
        name: data.name,
        price: data.price,
        description: data.description || null,
        job_type: data.job_type || null,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
        user_id: user.id,
      };

      const { data: pkg, error } = await supabase
        .from('packages')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return pkg as Package;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('สร้างแพ็กเกจสำเร็จ');
    },
    onError: (error) => {
      toast.error('ไม่สามารถสร้างแพ็กเกจได้: ' + error.message);
    },
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Package> & { id: string }) => {
      const { data: pkg, error } = await supabase
        .from('packages')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return pkg as Package;
    },
    onSuccess: (pkg) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['package', pkg.id] });
      toast.success('อัพเดทแพ็กเกจสำเร็จ');
    },
    onError: (error) => {
      toast.error('ไม่สามารถอัพเดทแพ็กเกจได้: ' + error.message);
    },
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('ลบแพ็กเกจสำเร็จ');
    },
    onError: (error) => {
      toast.error('ไม่สามารถลบแพ็กเกจได้: ' + error.message);
    },
  });
}
