import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck, UserCircle, Activity, ShieldAlert, Edit3, Eye, FileText, Edit2, Trash2, Save, X } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tokenPreview, setTokenPreview] = useState('');
  const [posts, setPosts] = useState([]);
  const [showData, setShowData] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', content: '' });

  const mockSensitiveData = [
    { id: 1, name: "Project Alpha", status: "Active", budget: "$50,000" },
    { id: 2, name: "Project Beta", status: "Pending", budget: "$120,000" },
    { id: 3, name: "Operation Gamma", status: "Completed", budget: "$15,000" }
  ];

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        setTokenPreview(`${parts[0]}.\n${parts[1]}.\n${parts[2].substring(0, 10)}...`);
      }
    }
    
    // Load posts from localStorage
    const savedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    setPosts(savedPosts);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeletePost = (id) => {
    const updatedPosts = posts.filter(post => post.id !== id);
    setPosts(updatedPosts);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    setEditFormData({ title: post.title, content: post.content });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditFormData({ title: '', content: '' });
  };

  const handleSaveEdit = (id) => {
    const updatedPosts = posts.map(post => {
      if (post.id === id) {
        return { ...post, title: editFormData.title, content: editFormData.content };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    setEditingPostId(null);
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', flex: 1 }}>
      
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <ShieldCheck color="var(--primary)" size={32} />
          Secure Dashboard
        </h1>
        <button className="btn btn-danger" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <UserCircle color="var(--primary)" size={24} />
          User Profile
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p className="text-muted" style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>Username</p>
            <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '500' }}>{user.username}</p>
          </div>
          <div>
            <p className="text-muted" style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>Role</p>
            <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '500' }}>
              <span style={{ 
                background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : user.role === 'editor' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)', 
                color: user.role === 'admin' ? '#ef4444' : user.role === 'editor' ? '#f59e0b' : '#818cf8', 
                padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' 
              }}>
                {user.role.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Activity color="var(--primary)" size={24} />
          Role-Based Actions
        </h2>
        <p className="text-muted" style={{ marginBottom: '1rem' }}>
          These actions are conditionally rendered based on your assigned role.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Viewer and above */}
          <button className="btn" onClick={() => setShowData(!showData)} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
            <Eye size={18} />
            {showData ? 'Hide Data' : 'View Data'}
          </button>

          {/* Editor and above */}
          {['admin', 'editor'].includes(user.role) && (
            <button className="btn" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', color: '#f59e0b' }} onClick={() => navigate('/editor')}>
              <Edit3 size={18} />
              Edit Content (Editor+)
            </button>
          )}

          {/* Admin only */}
          {user.role === 'admin' && (
            <button className="btn" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444' }} onClick={() => navigate('/admin')}>
              <ShieldAlert size={18} />
              Manage System (Admin)
            </button>
          )}
        </div>

        {/* View Data Section */}
        {showData && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '0.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--primary)' }}>General Company Data</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.75rem' }}>Project</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Budget</th>
                </tr>
              </thead>
              <tbody>
                {mockSensitiveData.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem' }}>{item.name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        background: item.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : item.status === 'Pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)', 
                        color: item.status === 'Active' ? '#10b981' : item.status === 'Pending' ? '#f59e0b' : '#818cf8', 
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' 
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{item.budget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <FileText color="var(--primary)" size={24} />
          Recent Posts
        </h2>
        
        {posts.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>No posts available yet. Check back later!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {posts.map(post => (
              <div key={post.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                {editingPostId === post.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={editFormData.title} 
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    />
                    <textarea 
                      className="input-field" 
                      rows="3" 
                      style={{ resize: 'vertical' }}
                      value={editFormData.content}
                      onChange={(e) => setEditFormData({...editFormData, content: e.target.value})}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn" onClick={handleCancelEdit} style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)', padding: '0.5rem' }}>
                        <X size={16} /> Cancel
                      </button>
                      <button className="btn" onClick={() => handleSaveEdit(post.id)} style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', padding: '0.5rem' }}>
                        <Save size={16} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>{post.title}</h3>
                      {['admin', 'editor'].includes(user.role) && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditClick(post)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>{post.content}</p>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>By: <strong>{post.author}</strong></span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
