"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "../AdminDashboard.module.css";

type User = {
  user_id: string;
  username: string;
  email: string;
  role: string;
  approved: boolean;
  pfp_url: string | null;
  is_banned?: boolean; // To track if user is currently banned
};

type Ban = {
  ban_id: string;
  user_id: string;
  admin_id: string;
  reason: string;
  banned_at: string;
  username: string; // From join
  admin_username: string; // From join
};

export default function UserManagement() {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [activeBans, setActiveBans] = useState<Set<string>>(new Set()); // Track active bans by user_id
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For ban functionality
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [banReason, setBanReason] = useState("");

  // Ref for the textarea to maintain focus
  const banReasonRef = useRef<HTMLTextAreaElement>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [banFilter, setBanFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch users and ban logs
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch users
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*");

        if (userError) throw new Error(userError.message);

        // Fetch ban logs with username information
        const { data: banData, error: banError } = await supabase
          .from("bans")
          .select(
            `
            ban_id,
            user_id,
            admin_id,
            reason,
            banned_at,
            users!bans_user_id_fkey(username),
            admin:users!bans_admin_id_fkey(username)
          `,
          )
          .order("banned_at", { ascending: false });

        if (banError) throw new Error(banError.message);

        // Format ban data to include usernames
        console.log({ banData });
        const formattedBans = banData.map((ban) => ({
          ban_id: ban.ban_id,
          user_id: ban.user_id,
          admin_id: ban.admin_id,
          reason: ban.reason,
          banned_at: ban.banned_at,
          username: ban.users ? (ban.users as any).username : "Unknown User",
          admin_username: ban.admin
            ? (ban.admin as any).username
            : "Unknown Admin",
        }));

        // Find active bans (most recent ban for each user)
        const activeBannedUserIds = new Set<string>();
        const userLatestBan = new Map<string, string>(); // user_id -> ban_id

        // Process bans to find the latest ban per user
        formattedBans.forEach((ban) => {
          if (
            !userLatestBan.has(ban.user_id) ||
            new Date(ban.banned_at) > new Date(userLatestBan.get(ban.user_id)!)
          ) {
            userLatestBan.set(ban.user_id, ban.banned_at);
          }
        });

        // Find users with active bans
        userLatestBan.forEach((_, userId) => {
          activeBannedUserIds.add(userId);
        });

        setActiveBans(activeBannedUserIds);

        // Mark users who are currently banned
        const enhancedUserData = userData?.map((user) => ({
          ...user,
          approved: user.role == "student" ? true : user.approved,
          is_banned: activeBannedUserIds.has(user.user_id),
        }));

        setUsers(enhancedUserData || []);
        setBans(formattedBans || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  // Effect to focus the textarea when ban modal opens
  useEffect(() => {
    if (showBanModal && banReasonRef.current) {
      // Use a small timeout to ensure the modal is fully rendered
      setTimeout(() => {
        banReasonRef.current?.focus();
      }, 10);
    }
  }, [showBanModal]);

  // Filter users based on search, role, approval status, and ban status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      user.role?.toLowerCase() === roleFilter.toLowerCase();

    const matchesApproval =
      approvalFilter === "all" ||
      (approvalFilter === "approved" && user.approved) ||
      (approvalFilter === "unapproved" && !user.approved);

    const matchesBanStatus =
      banFilter === "all" ||
      (banFilter === "banned" && user.is_banned) ||
      (banFilter === "active" && !user.is_banned);

    return matchesSearch && matchesRole && matchesApproval && matchesBanStatus;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle ban user
  const handleBanUser = async () => {
    if (!selectedUserId || !banReason.trim()) return;

    try {
      // Get current admin user info
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // Insert ban record
      const { error } = await supabase.from("bans").insert({
        user_id: selectedUserId,
        admin_id: user.id,
        reason: banReason.trim(),
      });

      if (error) throw new Error(error.message);

      // Refresh data after ban
      const { data: banData, error: banError } = await supabase
        .from("bans")
        .select(
          `
          ban_id,
          user_id,
          admin_id,
          reason,
          banned_at,
          users!bans_user_id_fkey(username),
          admin:users!bans_admin_id_fkey(username)
        `,
        )
        .order("banned_at", { ascending: false });

      if (banError) throw new Error(banError.message);

      // Format ban data
      const formattedBans = banData.map((ban) => ({
        ban_id: ban.ban_id,
        user_id: ban.user_id,
        admin_id: ban.admin_id,
        reason: ban.reason,
        banned_at: ban.banned_at,
        username: ban.users ? (ban.users as any).username : "Unknown User",
        admin_username: ban.admin
          ? (ban.admin as any).username
          : "Unknown Admin",
      }));

      // Update ban status in local state
      const newActiveBans = new Set(activeBans);
      newActiveBans.add(selectedUserId);
      setActiveBans(newActiveBans);

      // Update user list to mark this user as banned
      setUsers(
        users.map((user) =>
          user.user_id === selectedUserId ? { ...user, is_banned: true } : user,
        ),
      );

      setBans(formattedBans || []);

      // Clear and close modal
      setBanReason("");
      setShowBanModal(false);
    } catch (err) {
      console.error("Error banning user:", err);
      setError("Failed to ban user. Please try again.");
    }
  };

  // Handle approve lecturer
  const handleApproveUser = async (
    userId: string,
    currentApprovalStatus: boolean,
  ) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ approved: !currentApprovalStatus })
        .eq("user_id", userId);

      if (error) throw new Error(error.message);

      // Update local state
      setUsers(
        users.map((user) =>
          user.user_id === userId
            ? { ...user, approved: !currentApprovalStatus }
            : user,
        ),
      );
    } catch (err) {
      console.error("Error updating approval status:", err);
      setError("Failed to update approval status. Please try again.");
    }
  };

  // Ban modal component
  const BanModal = () => (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Ban User</h3>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalUserInfo}>
            <span className={styles.modalLabel}>Username:</span>
            <span className={styles.modalValue}>{selectedUsername}</span>
          </div>

          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>Reason for Ban:</label>
            <textarea
              className={styles.modalTextarea}
              placeholder="Please provide a detailed reason for this ban..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={4}
              ref={banReasonRef}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={() => {
              setShowBanModal(false);
              setBanReason("");
            }}
          >
            Cancel
          </button>
          <button
            className={styles.deleteButton}
            onClick={handleBanUser}
            disabled={!banReason.trim()}
          >
            Confirm Ban
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.usersContainer}>
        <h2 className={styles.sectionTitle}>User Management</h2>
        <p className={styles.emptyMessage}>Loading user data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.usersContainer}>
        <h2 className={styles.sectionTitle}>User Management</h2>
        <p className={styles.errorMessage}>{error}</p>
        <button
          className={styles.uploadButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.usersContainer}>
      <h2 className={styles.sectionTitle}>User Management</h2>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.formInput}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={styles.formInput}
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="lecturer">Lecturers</option>
          <option value="admin">Admins</option>
        </select>

        <select
          value={approvalFilter}
          onChange={(e) => setApprovalFilter(e.target.value)}
          className={styles.formInput}
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="unapproved">Unapproved</option>
        </select>

        <select
          value={banFilter}
          onChange={(e) => setBanFilter(e.target.value)}
          className={styles.formInput}
        >
          <option value="all">All Users</option>
          <option value="banned">Banned Users</option>
          <option value="active">Active Users</option>
        </select>
      </div>

      {/* Users Table */}
      <h3 className={styles.subSectionTitle}>Users</h3>
      {currentUsers.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Ban Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr
                  key={user.user_id}
                  className={user.is_banned ? styles.bannedUserRow : ""}
                >
                  <td>
                    <div className={styles.userInfo}>
                      {user.pfp_url && (
                        <img
                          src={user.pfp_url}
                          alt={user.username}
                          className={styles.userAvatar}
                        />
                      )}
                      {user.username}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role || "Not set"}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${user.approved ? styles.approvedBadge : styles.unapprovedBadge}`}
                    >
                      {user.approved ? "Approved" : "Unapproved"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${user.is_banned ? styles.bannedBadge : styles.activeBadge}`}
                    >
                      {user.is_banned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td>
                    {/* Only show approve button for lecturers */}
                    {user.role === "lecturer" && (
                      <button
                        className={`${styles.statusButton} ${user.approved ? styles.inactiveButton : styles.activeButton}`}
                        onClick={() =>
                          handleApproveUser(user.user_id, user.approved)
                        }
                      >
                        {user.approved ? "Revoke" : "Approve"}
                      </button>
                    )}

                    {/* Ban button for non-admin users who aren't banned */}
                    {user.role !== "admin" && !user.is_banned && (
                      <button
                        className={styles.deleteButton}
                        onClick={() => {
                          setSelectedUserId(user.user_id);
                          setSelectedUsername(user.username);
                          setBanReason("");
                          setShowBanModal(true);
                        }}
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className={styles.emptyMessage}>
          No users found matching your filters.
        </p>
      )}

      {/* Ban Logs Section */}
      <h3 className={styles.subSectionTitle}>Ban Logs</h3>
      {bans.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Banned By</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bans.map((ban) => {
              const isUnban = ban.reason.startsWith("UNBANNED:");
              return (
                <tr key={ban.ban_id}>
                  <td>{ban.username}</td>
                  <td>{ban.admin_username}</td>
                  <td>{ban.reason}</td>
                  <td>{new Date(ban.banned_at).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${isUnban ? styles.inactiveBanBadge : styles.bannedBadge}`}
                    >
                      {isUnban ? "Unban" : "Ban"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className={styles.emptyMessage}>No ban records found.</p>
      )}

      {showBanModal && <BanModal />}
    </div>
  );
}
