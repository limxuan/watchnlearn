"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("badges");

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Admin</h2>
        <nav>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`${styles.navButton} ${activeTab === "dashboard" ? styles.navButtonActive : ""}`}
          >
            🏠 Dashboard
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`${styles.navButton} ${activeTab === "badges" ? styles.navButtonActive : ""}`}
          >
            🏅 Badges Management
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`${styles.navButton} ${activeTab === "users" ? styles.navButtonActive : ""}`}
          >
            👤 User Management
          </button>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1>{activeTab.replace("-", " ")}</h1>
          <div className="flex items-center space-x-4 text-gray-400">
            <span>🔔</span>
            <span>👤 Admin</span>
          </div>
        </header>

        {activeTab === "badges" && <BadgesManagement />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "dashboard" && <div>Welcome to the admin dashboard.</div>}
      </main>
    </div>
  );
}

function BadgesManagement() {
  const [badges, setBadges] = useState([]);
  const [newBadge, setNewBadge] = useState({ name: "", xp: "", image: "" });
  const [editingId, setEditingId] = useState(null);
  const [editXP, setEditXP] = useState("");
  const fileInputRef = useRef(null);
  const supabase = createClient();

  const handleUpload = () => {
    if (!newBadge.name || !newBadge.xp || !newBadge.image) return;
    supabase.storage.from("badges").upload(newBadge.image)
    setBadges([
      ...badges,
      {
        id: badges.length + 1,
        name: newBadge.name,
        xp: Number(newBadge.xp),
        image: newBadge.image,
      },
    ]);
    setNewBadge({ name: "", xp: "", image: "" });
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBadge({ ...newBadge, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBadge({ ...newBadge, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePreviewImage = () => {
    setNewBadge({ ...newBadge, image: "" });
  };

  const handleEdit = (id) => {
    const updated = badges.map((badge) =>
      badge.id === id ? { ...badge, xp: Number(editXP) } : badge
    );
    setBadges(updated);
    setEditingId(null);
    setEditXP("");
  };

  const handleDelete = (id) => {
    setBadges(badges.filter((badge) => badge.id !== id));
  };

  return (
    <div className={styles.badgesContainer}>
      <h2 className={styles.sectionTitle}>Badges</h2>

      <div className={styles.badgeUploadForm}>
        <input
          type="text"
          placeholder="Name"
          value={newBadge.name}
          onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="XP"
          value={newBadge.xp}
          onChange={(e) => setNewBadge({ ...newBadge, xp: e.target.value })}
        />

        <div
          className={styles.dropZone}
          onDrop={handleImageDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
        >
          {newBadge.image ? (
            <div className={styles.imagePreviewWrapper}>
              <img src={newBadge.image} alt="Preview" className={styles.previewImage} />
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
            style={{ display: "none" }}
          />
        </div>

        <button onClick={handleUpload}>Upload</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Image</th>
            <th>XP Breakpoint</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {badges.map((badge) => (
            <tr key={badge.id}>
              <td>{badge.name}</td>
              <td>
                <img src={badge.image} alt={badge.name} className={styles.previewImage} />
              </td>
              <td>
                {editingId === badge.id ? (
                  <input
                    type="number"
                    value={editXP}
                    onChange={(e) => setEditXP(e.target.value)}
                    className={styles.inlineInput}
                  />
                ) : (
                  `${badge.xp} XP`
                )}
              </td>
              <td>
                {editingId === badge.id ? (
                  <button onClick={() => handleEdit(badge.id)}>Save</button>
                ) : (
                  <button onClick={() => {
                    setEditingId(badge.id);
                    setEditXP(badge.xp.toString());
                  }}>Edit</button>
                )}
                <button onClick={() => handleDelete(badge.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserManagement() {
  return (
    <div className={styles.usersContainer}>
      <p>Coming soon...</p>
    </div>
  );
}
