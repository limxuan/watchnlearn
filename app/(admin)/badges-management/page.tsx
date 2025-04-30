"use client"

import { useEffect, useRef, useState } from "react";
import styles from "../AdminDashboard.module.css";
import useUserStore from "@/stores/useUserStore";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface Badge {
  badge_id: string;
  admin_id: string;
  name: string;
  description: string;
  image_url: string;
  xp_threshold: number;
  created_at: string;
  is_active: boolean;
}

export default function BadgesManagement() {
  // All state variables remain the same
  const [badges, setBadges] = useState<Badge[]>([]);
  const [newBadge, setNewBadge] = useState({
    name: "", 
    description: "", 
    xp: "", 
    image: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    xp: "",
    image: null as File | null
  });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { user } = useUserStore();
  const supabase = createClient();

  // Same useEffect and functions 
  useEffect(() => {
    // Redirect non-admin users
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
    
    // Fetch badges on component mount
    fetchBadges();
  }, [user, router]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('xp_threshold', { ascending: true });
      
      if (error) throw error;
      setBadges(data || []);
    } catch (err: any) {
      console.error('Error fetching badges:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!newBadge.name || !newBadge.xp || !newBadge.image) {
      setError("Please fill name, XP, and upload an image");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (user.role !== "admin") {
        throw new Error("You don't have permission to perform this action.");
      }
      
      // 1. Upload image directly to Supabase Storage badges bucket
      const fileName = `${uuidv4()}-${newBadge.image.name.replace(/\s+/g, '_')}`;
      // Remove the badge-images/ folder from the path
      const filePath = fileName;
      
      const { error: uploadError } = await supabase.storage
        .from('badges')
        .upload(filePath, newBadge.image);
        
      if (uploadError) throw uploadError;
      
      // 2. Get public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('badges')
        .getPublicUrl(filePath);
        
      const imageUrl = urlData.publicUrl;
      
      // 3. Save badge data to the database - using user.id as admin_id
      const { data, error: insertError } = await supabase
        .from('badges')
        .insert([
          {
            admin_id: user.id,
            name: newBadge.name,
            description: newBadge.description || null,
            image_url: imageUrl,
            xp_threshold: parseInt(newBadge.xp),
            is_active: true
          }
        ])
        .select();
        
      if (insertError) throw insertError;
      
      // 4. Update local state
      if (data) {
        setBadges([...badges, data[0]]);
      }
      
      // 5. Reset form
      setNewBadge({ name: "", description: "", xp: "", image: null });
      
      // 6. Refresh badges list
      await fetchBadges();
      
    } catch (err: any) {
      console.error('Error uploading badge:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setNewBadge({ ...newBadge, image: file });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewBadge({ ...newBadge, image: file });
    }
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm({ ...editForm, image: file });
    }
  };

  const handleEditImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setEditForm({ ...editForm, image: file });
    }
  };

  const removePreviewImage = () => {
    setNewBadge({ ...newBadge, image: null });
  };

  const removeEditPreviewImage = () => {
    setEditForm({ ...editForm, image: null });
  };

  const startEdit = (badge: Badge) => {
    setEditingId(badge.badge_id);
    setEditForm({
      name: badge.name,
      description: badge.description || "",
      xp: badge.xp_threshold.toString(),
      image: null
    });
  };

  const handleEdit = async (id: string) => {
    if (!editForm.name || !editForm.xp) {
      setError("Name and XP threshold are required");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if user exists and has admin role
      if (!user) {
        throw new Error("User not found. Please log in again.");
      }
      
      if (user.role !== "admin") {
        throw new Error("You don't have permission to perform this action.");
      }
      
      // Find the current badge
      const badgeToUpdate = badges.find(b => b.badge_id === id);
      if (!badgeToUpdate) {
        throw new Error("Badge not found");
      }
      
      // Prepare update object
      const updates: any = {
        name: editForm.name,
        description: editForm.description || null,
        xp_threshold: parseInt(editForm.xp)
      };
      
      // If there's a new image, upload it
      if (editForm.image) {
        // 1. Delete old image if it exists
        if (badgeToUpdate.image_url) {
          // Extract just the filename from the URL without the path
          const urlParts = badgeToUpdate.image_url.split('/');
          const filename = urlParts[urlParts.length - 1];
          // Remove the badge-images/ folder path
          const oldFilePath = filename;
          
          try {
            await supabase.storage
              .from('badges')
              .remove([oldFilePath]);
          } catch (deleteErr) {
            console.error('Failed to delete old image:', deleteErr);
          }
        }
        
        // 2. Upload new image directly to the badges bucket
        const fileName = `${uuidv4()}-${editForm.image.name.replace(/\s+/g, '_')}`;
        // Remove the badge-images/ folder from the path
        const filePath = fileName;
        
        const { error: uploadError } = await supabase.storage
          .from('badges')
          .upload(filePath, editForm.image);
          
        if (uploadError) throw uploadError;
        
        // 3. Get public URL
        const { data: urlData } = supabase.storage
          .from('badges')
          .getPublicUrl(filePath);
          
        updates.image_url = urlData.publicUrl;
      }
      
      // Update badge in database
      const { error } = await supabase
        .from('badges')
        .update(updates)
        .eq('badge_id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedBadges = badges.map(badge => 
        badge.badge_id === id ? { ...badge, ...updates } : badge
      );
      setBadges(updatedBadges);
      
      // Reset editing state
      setEditingId(null);
      setEditForm({ name: "", description: "", xp: "", image: null });
      
      // Refresh badges list
      await fetchBadges();
      
    } catch (err: any) {
      console.error('Error updating badge:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (badge: Badge) => {
    try {
      setLoading(true);
      
      // Check if user exists and has admin role
      if (!user) {
        throw new Error("User not found. Please log in again.");
      }
      
      if (user.role !== "admin") {
        throw new Error("You don't have permission to perform this action.");
      }
      
      const { error } = await supabase
        .from('badges')
        .update({ is_active: !badge.is_active })
        .eq('badge_id', badge.badge_id);
        
      if (error) throw error;
      
      // Update local state
      const updated = badges.map(b => 
        b.badge_id === badge.badge_id ? { ...b, is_active: !b.is_active } : b
      );
      setBadges(updated);
      
    } catch (err: any) {
      console.error('Error toggling badge status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      
      // Check if user exists and has admin role
      if (!user) {
        throw new Error("User not found. Please log in again.");
      }
      
      if (user.role !== "admin") {
        throw new Error("You don't have permission to perform this action.");
      }
      
      // 1. Get the badge to delete
      const badgeToDelete = badges.find(badge => badge.badge_id === id);
      
      if (!badgeToDelete) return;
      
      // 2. Delete from database
      const { error: deleteError } = await supabase
        .from('badges')
        .delete()
        .eq('badge_id', id);
        
      if (deleteError) throw deleteError;
      
      // 3. Extract filename from URL to delete from storage
      if (badgeToDelete.image_url) {
        const urlParts = badgeToDelete.image_url.split('/');
        const filename = urlParts[urlParts.length - 1];
        // Remove the badge-images/ folder path
        const filePath = filename;
        
        // 4. Delete from storage
        const { error: storageError } = await supabase.storage
          .from('badges')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Warning: Could not delete image file', storageError);
        }
      }
      
      // 5. Update local state
      setBadges(badges.filter(badge => badge.badge_id !== id));
      
    } catch (err: any) {
      console.error('Error deleting badge:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && badges.length === 0) {
    return <div className={styles.badgesContainer}>Loading badges...</div>;
  }

  return (
    <div className={styles.badgesContainer}>
      <h2 className={styles.sectionTitle}>Badges Management</h2>
      
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Updated structure for the form */}
      <div className={styles.badgeUploadForm}>
        <input
          type="text"
          placeholder="Badge Name"
          value={newBadge.name}
          onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
          className={styles.formInput}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newBadge.description}
          onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
          className={styles.formInput}
        />
        <input
          type="number"
          placeholder="XP Threshold"
          value={newBadge.xp}
          onChange={(e) => setNewBadge({ ...newBadge, xp: e.target.value })}
          className={styles.formInput}
        />

        <div
          className={styles.dropZone}
          onDrop={handleImageDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          {newBadge.image ? (
            <div className={styles.imagePreviewWrapper}>
              <img 
                src={URL.createObjectURL(newBadge.image)} 
                alt="Preview" 
                className={styles.previewImage} 
              />
              <button
                type="button"
                className={styles.removeImageButton}
                onClick={(e) => {
                  e.stopPropagation();
                  removePreviewImage();
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <p>Drag & drop an image or click to upload</p>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            ref={fileInputRef}
            className={styles.hiddenInput}
          />
        </div>

        <button 
          onClick={handleUpload}
          disabled={loading}
          className={styles.uploadButton}
        >
          {loading ? 'Uploading...' : 'Upload Badge'}
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Image</th>
              <th>XP Threshold</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {badges.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyMessage}>
                  No badges found. Add your first badge!
                </td>
              </tr>
            )}
            {badges.map((badge) => (
              <tr key={badge.badge_id}>
                <td title={badge.name}>
                  {editingId === badge.badge_id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className={styles.inlineInput}
                    />
                  ) : (
                    badge.name
                  )}
                </td>
                <td title={badge.description || ''}>
                  {editingId === badge.badge_id ? (
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className={styles.inlineInput}
                    />
                  ) : (
                    badge.description || '-'
                  )}
                </td>
                <td>
                  {editingId === badge.badge_id ? (
                    <div
                      className={`${styles.dropZone} ${styles.smallDropZone}`}
                      onDrop={handleEditImageDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => editFileInputRef.current?.click()}
                    >
                      {editForm.image ? (
                        <div className={styles.imagePreviewWrapper}>
                          <img 
                            src={URL.createObjectURL(editForm.image)} 
                            alt="Preview" 
                            className={styles.previewImage} 
                          />
                          <button
                            type="button"
                            className={styles.removeImageButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEditPreviewImage();
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className={styles.editImagePreview}>
                          <img src={badge.image_url} alt={badge.name} className={styles.previewImage} />
                          <p className={styles.editImageText}>Change</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditFileSelect}
                        ref={editFileInputRef}
                        className={styles.hiddenInput}
                      />
                    </div>
                  ) : (
                    <img src={badge.image_url} alt={badge.name} className={styles.previewImage} />
                  )}
                </td>
                <td>
                  {editingId === badge.badge_id ? (
                    <input
                      type="number"
                      value={editForm.xp}
                      onChange={(e) => setEditForm({ ...editForm, xp: e.target.value })}
                      className={styles.inlineInput}
                    />
                  ) : (
                    `${badge.xp_threshold} XP`
                  )}
                </td>
                <td>
                  <button 
                    onClick={() => handleToggleActive(badge)}
                    className={`${styles.statusButton} ${badge.is_active ? styles.activeButton : styles.inactiveButton}`}
                  >
                    {badge.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  {editingId === badge.badge_id ? (
                    <>
                      <button 
                        onClick={() => handleEdit(badge.badge_id)}
                        disabled={loading}
                        className={styles.saveButton}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditForm({ name: "", description: "", xp: "", image: null });
                        }}
                        disabled={loading}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => startEdit(badge)}
                        disabled={loading}
                        className={styles.editButton}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(badge.badge_id)}
                        disabled={loading}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}