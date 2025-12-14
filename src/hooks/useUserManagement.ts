import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  status: 'active' | 'pending';
  created_at: string;
}

export function useUserManagement() {
  const queryClient = useQueryClient();

  // Fetch all users with their roles
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-management'],
    queryFn: async () => {
      // Get profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, created_at');

      if (profilesError) throw profilesError;

      // Get roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRole[] = profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: '', // Will be fetched from auth if needed
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: userRole?.role || 'editor',
          status: 'active' as const,
          created_at: profile.created_at || '',
        };
      });

      return usersWithRoles;
    },
  });

  // Fetch pending users (users without approved role)
  const { data: pendingUsers = [] } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      // For now, pending users would need a separate status table
      // This is a placeholder - implement based on your approval flow
      return [] as UserWithRole[];
    },
  });

  // Invite user mutation
  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      // Use Supabase auth admin invite (requires service role)
      // For now, just show a success message - implement with edge function
      console.log('Inviting user:', email);
      // This would call an edge function to send invite
      return { email };
    },
    onSuccess: (data) => {
      toast.success(`Convite enviado para ${data.email}`);
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao enviar convite', {
        description: error.message,
      });
    },
  });

  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Update user role to approved
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'editor' });

      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      toast.success('Usuário aprovado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao aprovar usuário', {
        description: error.message,
      });
    },
  });

  // Reject user mutation
  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      // For now, just log - implement based on your rejection flow
      console.log('Rejecting user:', userId);
      return userId;
    },
    onSuccess: () => {
      toast.success('Usuário rejeitado');
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao rejeitar usuário', {
        description: error.message,
      });
    },
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { userId, avatarUrl: publicUrl };
    },
    onSuccess: () => {
      toast.success('Avatar atualizado');
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar avatar', {
        description: error.message,
      });
    },
  });

  return {
    users,
    pendingUsers,
    isLoadingUsers,
    inviteUser: inviteMutation.mutate,
    approveUser: approveMutation.mutate,
    rejectUser: rejectMutation.mutate,
    updateAvatar: updateAvatarMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    isApproving: approveMutation.isPending,
  };
}
