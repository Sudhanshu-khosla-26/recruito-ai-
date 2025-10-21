"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Video } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import InterviewCard from "./InterviewCard";
import { toast } from "sonner";

import { auth, db } from "@/lib/firebase"; // ✅ import Firebase config
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

function LatestInterviewsList() {
  const [interviewList, setInterviewList] = useState([]);
  const [user, setUser] = useState(null);

  // ✅ Get the currently logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        GetInterviewList(currentUser.email);
      } else {
        setUser(null);
        setInterviewList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch interviews from Firestore
  const GetInterviewList = async (userEmail) => {
    try {
      const q = query(
        collection(db, "Interviews"),
        where("userEmail", "==", userEmail),
        orderBy("createdAt", "desc"),
        limit(6)
      );

      const querySnapshot = await getDocs(q);
      const interviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setInterviewList(interviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to fetch interviews");
    }
  };

  return (
    <div className="my-5">
      <h2 className="font-bold text-2xl">Previously Created Interviews</h2>

      {interviewList.length === 0 ? (
        <div className="p-5 flex flex-col gap-3 items-center bg-white rounded-xl mt-5">
          <Video className="h-10 w-10 text-primary" />
          <h2>You don't have any interviews created!</h2>
          <Link href="/dashboard/create-interview">
            <Button>+ Create New Interview</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 mt-5 xl:grid-cols-3 gap-5">
          {interviewList.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  );
}

export default LatestInterviewsList;
