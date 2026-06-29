const supabase = require('../config/database');
const { Resend } = require('resend');

class UserController {
  static async getAllUsers(req, res) {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (req.user.role === 'supervisor') {
        query = query.eq('supervisor_id', req.user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
  
  static async getSupervisors(req, res) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, department')
        .eq('role', 'supervisor')
        .order('full_name');
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Get supervisors error:', error);
      res.status(500).json({ error: 'Failed to fetch supervisors' });
    }
  }
  
  static async createUser(req, res) {
    try {
      const { email, password, full_name, role, department, employment_start_date, supervisor_id } = req.body;
      
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          role,
          department,
          employment_start_date,
        },
      });
      
      if (authError) throw authError;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email,
          full_name,
          role,
          department,
          employment_start_date: role === 'intern' ? employment_start_date : null,
          supervisor_id: role === 'intern' ? supervisor_id : null,
        }])
        .select()
        .single();
      
      if (profileError) throw profileError;
      
      res.status(201).json(profile);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: error.message || 'Failed to create user' });
    }
  }
  
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      console.log('🔧 updateUser called for id:', id);
      console.log('🔧 updates payload:', updates);
      
      delete updates.id;
      delete updates.email;
      delete updates.created_at;
      delete updates.role; // role changes should go through a dedicated flow, not generic update

      // Convert empty string to null for optional fields (avoids type/constraint errors)
      if (updates.supervisor_id === '') updates.supervisor_id = null;
      if (updates.employment_start_date === '') updates.employment_start_date = null;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('🔧 Supabase update error:', error);
        throw error;
      }

      console.log('🔧 Update succeeded:', data);
      res.json(data);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: error.message || 'Failed to update user' });
    }
  }
  
  static async resetPassword(req, res) {
    try {
      const { email } = req.body;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      });
      
      if (error) throw error;
      
      res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to send reset email' });
    }
  }
  
  static async getMyProfile(req, res) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.user.id)
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
  
  static async updateMyProfile(req, res) {
    try {
      const updates = req.body;
      delete updates.id;
      delete updates.email;
      delete updates.role;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  static async changeMyPassword(req, res) {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const { error } = await supabase.auth.admin.updateUserById(req.user.id, {
        password: newPassword,
      });

      if (error) throw error;

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to update password', details: error.message });
    }
  }
  
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      const { data: user } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', id)
        .single();
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const { error } = await supabase.auth.admin.deleteUser(id);
      
      if (error) throw error;
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  static async deactivateUser(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({ error: 'Failed to deactivate user', details: error.message });
    }
  }

  static async reactivateUser(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Reactivate user error:', error);
      res.status(500).json({ error: 'Failed to reactivate user', details: error.message });
    }
  }
  
  static async getTeamMembers(req, res) {
    try {
      if (req.user.role === 'intern') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'intern')
        .order('full_name');
      
      if (req.user.role === 'supervisor') {
        query = query.eq('supervisor_id', req.user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Get team members error:', error);
      res.status(500).json({ error: 'Failed to fetch team members' });
    }
  }

  static async getAdminSummary(req, res) {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role, is_active');

      if (profilesError) throw profilesError;

      const totalInterns = profiles.filter(p => p.role === 'intern' && p.is_active !== false).length;
      const totalSupervisors = profiles.filter(p => p.role === 'supervisor' && p.is_active !== false).length;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: requests, error: requestsError } = await supabase
        .from('leave_requests')
        .select('id, status, created_at');

      if (requestsError) throw requestsError;

      const pending = requests.filter(r => r.status === 'pending').length;
      const approved = requests.filter(r => r.status === 'approved').length;
      const rejected = requests.filter(r => r.status === 'rejected').length;
      const thisMonth = requests.filter(r => new Date(r.created_at) >= startOfMonth).length;

      res.json({
        totalInterns,
        totalSupervisors,
        pending,
        approved,
        rejected,
        thisMonth,
      });
    } catch (error) {
      console.error('Get admin summary error:', error);
      res.status(500).json({ error: 'Failed to fetch admin summary', details: error.message });
    }
  }

  static async getSystemSettings(req, res) {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*');

      if (error) throw error;

      const settings = {};
      data.forEach(row => {
        settings[row.config_key] = row.config_value;
      });

      res.json(settings);
    } catch (error) {
      console.error('Get system settings error:', error);
      res.status(500).json({ error: 'Failed to fetch settings', details: error.message });
    }
  }

  static async updateSystemSetting(req, res) {
    try {
      const { key, value } = req.body;

      const { data, error } = await supabase
        .from('system_config')
        .upsert(
          { config_key: key, config_value: String(value), updated_by: req.user.id, updated_at: new Date() },
          { onConflict: 'config_key' }
        )
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Update system setting error:', error);
      res.status(500).json({ error: 'Failed to update setting', details: error.message });
    }
  }
}

module.exports = UserController;