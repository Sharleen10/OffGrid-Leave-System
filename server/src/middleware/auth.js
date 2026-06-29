const supabase = require('../config/database');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('🔍 Auth header received:', authHeader ? 'YES' : 'NO');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No valid Bearer token');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('🔑 Token extracted, length:', token?.length);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    console.log('👤 Supabase getUser result:', { user: user?.id, error: error?.message });
    
    if (error || !user) {
      console.log('❌ Token validation failed:', error?.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log('📋 Profile lookup result:', { profile: profile?.email, error: profileError?.message });
    
    if (profileError || !profile) {
      console.log('❌ Profile not found:', profileError?.message);
      return res.status(401).json({ error: 'User profile not found' });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      profile,
    };
    
    console.log('✅ Auth successful for:', user.email);
    next();
  } catch (error) {
    console.error('💥 Auth error caught:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    console.log('🔐 requireRole check:', { userRole: req.user?.role, allowedRoles: roles });
    if (!req.user || !roles.includes(req.user.role)) {
      console.log('❌ Role check failed');
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    console.log('✅ Role check passed');
    next();
  };
};

module.exports = { verifyToken, requireRole };