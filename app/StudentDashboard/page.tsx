'use client'

import React, { useEffect, useState } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'; // Corrected import
import { supabase } from '@/lib/supabaseClient'; //database


import styles from './Dashboard.module.css'
import { useRouter } from 'next/navigation'; //for future navigation to specific quiz use




import  Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"





const StudentDashboard = () => {
  const router = useRouter(); //for future navigation to specific quiz use
  const [activeTab, setActiveTab] = useState(1); // 1 = Recent, 2 = Collection

//Get user Name, profile picture, Role///////////////////////////////////////////////////////
  interface UserInfo {
    user_id: string;
    username: string;
    role?: string;
    pfp_url: string;
    email: string;
  }

  const [isLoading, setIsLoading] = useState(true);
  const userId = "77cea966-8837-4831-93a7-12b1f74e7293"; // Replace this with a real ID from your DB

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPfpUrl, setNewPfpUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true); // Set loading to true when fetching starts
      if (!userId) {
        setIsLoading(false); // Ensure loading is false if userId is invalid
        return;
      }
  
      try {
        const { data, error } = await supabase
          .from("users")
          .select("user_id, username, role, pfp_url, email, password")
          .eq('user_id', userId)
          .single();
  
        if (error) {
          console.error("Error fetching user data:", error);
        } else if (data) {
          setUserInfo(data);
          setNewUsername(data.username);
          setNewPfpUrl(data.pfp_url);
        }
      } finally {
        setIsLoading(false); // Ensure loading is set to false regardless of success or failure
      }
    };
  
    fetchUserData();
  }, [userId]);





//////////////////////////////////////////////////////////////////////////////////////////////////////////////
const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

// ... your other state variables ...
const handleSave = async () => {
  const { error } = await supabase
    .from('users')
    .update({ username: newUsername, pfp_url: newPfpUrl, email: newEmail, password: newPassword })
    .eq('user_id', userId);

  if (error) {
    alert('Error updating profile: ' + error.message);
  } else {
    setShowConfirmation(true);
    setUserInfo((prev) =>
      prev ? { ...prev, username: newUsername, pfp_url: newPfpUrl, email: newEmail, password: newPassword} : null
    );
  }
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////

  var streak:number = 1
  var badges = [
    {/*url*/},
  ]

  var recentQuizzes = [
    { quizID: 1, name: 'Python'},
    { quizID: 5, name: 'Java'},
    { quizID: 3, name: 'C++'},
    { quizID: 4, name: 'Next.js'},
  ];  

  var completeQuizzes = [
    { quizID: 2, name: 'HTML'},
    { quizID: 6, name: 'CSS'},
    { quizID: 7, name: 'React'},
  ];  
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className={styles.all}>
      <div className={styles.pageHeader}>
{/* ============================================================================================================ */}
        <div>
          {isLoading ? ( // Show skeleton while loading
            <div className="flex items-center space-x-4 p-2 border-b border-gray-200">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ) : userInfo ? ( // Show user info when loaded
            <div className="flex items-center gap-4 p-2 border-b border-gray-200">
              <Avatar>
                <AvatarImage src={userInfo.pfp_url} alt={userInfo.username} />
                <AvatarFallback>{userInfo.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userInfo.username || 'No User Found'}</p>
                {userInfo.role && <Badge>{userInfo.role}</Badge>}
              </div>
            </div>
          ) : (
            <p>No User Found</p> // Optionally show an error message
          )}
        </div>

        {/*//Role //Streak //share qr* (button (carousel qr => code for copy)*/}
        {/*//Notification //Setting*/}
        {/*<img src='streak.png' alt='streak'/>*/}
{/* ============================================================================================================ */}
        <div>
          <div>
            <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">

                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">

                    <Label htmlFor="url" className="text-right">
                      Profile Picture URL
                    </Label>

                    <Input 
                      id="url" 
                      className="col-span-3"
                      value={newPfpUrl}
                      onChange={(e) => setNewPfpUrl(e.target.value)}
                        />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">

                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    
                    <Input 
                      id="username" 
                      className="col-span-3" 
                      value={newUsername} 
                      onChange={(e) => setNewUsername(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">

                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>

                    <Input 
                      id="password" 
                      className="col-span-3" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirmPassword" className="text-right">
                      Confirm Password
                    </Label>

                    <Input 
                      id="confirmPassword" 
                      className="col-span-3" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>

                    <Input 
                      id="email" 
                      className="col-span-3" 
                      value={newEmail} 
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>

                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleSave}>Save changes</Button>
                </DialogFooter>
              </DialogContent>

              {showConfirmation && (
                <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Changes Saved</DialogTitle>
                      <DialogDescription>Your profile has been updated successfully.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button onClick={() => {
                          setShowConfirmation(false);
                          setIsEditProfileOpen(false); // Close the Edit Profile dialog as well
                        }}>OK</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </Dialog>
          </div>
        </div>
          {/*<img src='qrCode.png' alt='qrCode'/> change to badges*/}

        <div>
          {/*<img src='notification.png' alt='notification'/>   no notification, instead of qr*/}
          {/*<img src='setting.png' alt='setting'/>*/}

          {/* setting->Sheet = Language->Select (popover, progress, radio group, resizeable, seporator, slider, switch*/}
        </div>
      </div>
{/* ============================================================================================================ */}
      
      <div className={styles.achievementContainer}> {/*//fans//following//complete quiz//badges*/}
        <div className={styles.SingleAchievementContainer}>
          <p className={styles.achievementText}>Fans</p>
        </div>

        <div className={styles.SingleAchievementContainer}>
          <p className={styles.achievementText}>QuizAverageScore</p>
        </div>

        <div className={styles.SingleAchievementContainer}>
          <p className={styles.achievementText}>Complete Quiz</p>
        </div>

        <div className={styles.SingleAchievementContainer}>
          <p className={styles.achievementText}>Badges</p>
        </div>
        {/*<div className={styles.achievementText} onClick={() => console.log("Click")}>
          <img src="badges.jpg" alt="badges"/>
        </div>*/}
      </div>
{/* ============================================================================================================ */}

      <div className={styles.QuizDisplay}>
        {/* Tab Headers */}
        <div className={styles.topQuizDisplay}>
          <h1 className={styles.titleDisplay}>My Learning Path</h1>
          <div className={styles.tabDisplay}>
            <div className={`${styles.tab} ${activeTab === 1 ? styles.activeTab : ''}`} onClick={() => setActiveTab(1)}>Recent Quiz</div>
            <div className={`${styles.tab} ${activeTab === 2 ? styles.activeTab : ''}`} onClick={() => setActiveTab(2)}>Collection Quiz</div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 1 && (
            <div className={styles.AllrecentQuizContainer}>
              {recentQuizzes.map((quizName) => (
                <button
                  key={quizName.quizID}
                  className={styles.SingleRecentQuizContainer}
                  onClick={() => alert(`Navigate to ${quizName.name}!\nQuiz ID: ${quizName.quizID}`)} //router.push(`/quiz/${quizName.quizID}`) //for future navigation to specific quiz use
                >
                  {quizName.name}
                </button>
              ))}
            </div>
          )}

          {activeTab === 2 && (
            <div className={styles.AllrecentQuizContainer}>
              {completeQuizzes.map((quizName) => (
                <button
                  key={quizName.quizID}
                  className={styles.SingleRecentQuizContainer}
                  onClick={() => alert(`Navigate to ${quizName.name}!\nQuiz ID: ${quizName.quizID}`)} //router.push(`/quiz/${quizName.quizID}`) //for future navigation to specific quiz use
                >
                  {quizName.name}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>




    </div>
  );
}

export default StudentDashboard


/*
User Profile Section – Displays the user's name, profile picture, progress, and achievements.

Course Progress & Enrollments – A visual progress tracker (e.g., percentage bars or checklists) showing enrolled courses and completion status.

Recommended Courses – Suggested courses based on learning history or interests, with visually appealing thumbnails.

Upcoming Lessons & Deadlines – A timeline or calendar view for scheduled lessons, assignments, or deadlines.

Achievements & Badges – A gamification feature showing earned badges, certificates, or milestones.

Quick Access to Learning Materials – A section for recently accessed lessons, notes, or saved resources.

Community & Discussion Forums – A chat or forum area for discussions, questions, and collaboration with peers or instructors.

Quizzes & Assessments – A place to track completed quizzes, scores, and pending assessments.

//role
//Settings & Preferences – Allows users to customize their experience, including themes, notifications, and account settings.
//Fans
//Following
//Share (QR code) for adding friends
//Complete quizzes (numbers)

//Recent quiz (Toggle tab) ✔
//Collection Quiz / Complete quiz ✔

//Achievement
//Streak
//Subscription X


//Role //Streak //share qr
//Setting

//fans
//following
//complete quiz
//badges



Announcements & Notifications – Alerts about new courses, instructor updates, or platform changes.


//Get user Name, profile picture, Role///////////////////////////////////////////////////////
  interface UserInfo {
    //user_id: number
    username: string;
    role: string;
  }
  

  const [data,setData] = useState<UserInfo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const {data, error} = await supabase
        .from("users")
        .select("user_id, username, role");

      if (error) console.log("Error message: ", error);
      else setData(data as UserInfo[]);
    };

    fetchData();
  },[]);

          <div>
          {data.length === 0 ? (
            <p>Loading Name...</p> // Show this when no users exist
          ) : (

          data.map((user) => (
            <div key={user.user_id}>
              <p>{user.username || 'No User Found'}</p>
              <p><Badge>{user.role}</Badge></p>
            </div>
          )
          ))}
        </div>

      interface UserInfo {
    //user_id: number
    username: string;
    role: string;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const session = useSession();
    const supabase = useSupabaseClient();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
    useEffect(() => {
      const fetchUserInfo = async () => {
        //if (!session?.user?.email) return;
        const testEmail = "jingtaimak39@gmail.com";
  
        const { data, error } = await supabase
          .from("users")
          .select("username, role")
          //.eq("email", session.user.email)
          .eq("email", testEmail)
          .single(); // Only one row expected

  
        if (error) {
          console.log("Error fetching user info:", error);
        } else {
          setUserInfo(data);
        }
      };
  
      fetchUserInfo();
    }, [session]);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
            <div>
              <Avatar>
    
                <AvatarImage src={""} alt="@shadcn" /> 
                <AvatarFallback>PP</AvatarFallback>
      
              </Avatar>
            </div>

            <div>
              {data.length === 0 ? (
                <p>Loading Name...</p> // Show this when no users exist
              ) : (

              data.map((user) => (
                <div key={user.user_id}>
                  <p>{user.username || 'No User Found'}</p>
                  <p><Badge>{user.role}</Badge></p>
                </div>
              )
              ))}
            </div>

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
*/