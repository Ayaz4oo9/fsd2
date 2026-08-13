import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EditorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSavePost = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      author: user?.username || 'Unknown',
      createdAt: new Date().toISOString()
    };

    const existingPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    localStorage.setItem('posts', JSON.stringify([newPost, ...existingPosts]));

    setTitle('');
    setContent('');
    setMessage('Post published successfully!');
    
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Edit3 color="var(--primary)" size={32} />
          Editor Portal
        </h1>
        <button className="btn" onClick={() => navigate('/dashboard')} style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)' }}>
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Create New Post</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>This form is only accessible by users with the <code>admin</code> or <code>editor</code> roles.</p>
        
        {message && <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

        <form onSubmit={handleSavePost}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="input-label">Post Title</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter an engaging title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Post Content</label>
            <textarea 
              className="input-field" 
              placeholder="Write your article here..." 
              rows="6"
              style={{ resize: 'vertical' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn" style={{ width: '100%' }}>
            <Save size={18} />
            Publish Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditorPage;
