"use client";

import { Button } from "@/app/components/ui/button";
import axios from "axios";
import { Loader2, Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import QuestionListContainer from "./QuestionListContainer";
import { v4 as uuidv4 } from "uuid";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

function QuestionList({ formData, onCreateLink }) {
    const [loading, setLoading] = useState(true);
    const [questionList, setQuestionList] = useState([]);
    const [saveLoading, setSaveLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [userDocId, setUserDocId] = useState(null);
    const [userCredits, setUserCredits] = useState(0);

    // ✅ Get current logged in user + their credit info
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchUserCredits(currentUser.email);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchUserCredits = async (email) => {
        try {
            const q = query(collection(db, "Users"), where("email", "==", email));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const docSnap = snapshot.docs[0];
                setUserDocId(docSnap.id);
                setUserCredits(docSnap.data().credits || 0);
            }
        } catch (e) {
            console.error("Error fetching user credits:", e);
        }
    };

    // ✅ Generate interview questions from API
    useEffect(() => {
        if (formData) {
            GenerateQuestionList();
        }
    }, [formData]);

    const GenerateQuestionList = async () => {
        setLoading(true);
        try {
            const result = await axios.post("/api/ai-model", { ...formData });
            const content = result.data.content;
            const finalContent = content.replace("```json", "").replace("```", "");
            const parsed = JSON.parse(finalContent)?.interviewQuestions || [];
            setQuestionList(parsed);
        } catch (e) {
            console.log(e);
            toast.error("Server Error, Try Again!");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Save interview data to Firestore
    const onFinish = async () => {
        if (!user) {
            toast.error("You must be logged in to save the interview.");
            return;
        }

        setSaveLoading(true);
        const interview_id = uuidv4();

        try {
            // ➝ Add interview
            await addDoc(collection(db, "Interviews"), {
                ...formData,
                questionList,
                userEmail: user.email,
                interview_id,
                createdAt: new Date().toISOString(),
            });

            // ➝ Update user credits
            if (userDocId) {
                const userRef = doc(db, "Users", userDocId);
                await updateDoc(userRef, {
                    credits: Number(userCredits) - 1,
                });
            }

            toast.success("Interview created successfully!");
            onCreateLink(interview_id);
        } catch (error) {
            console.error("Error saving interview:", error);
            toast.error("Failed to save interview");
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <div>
            {loading && (
                <div className="p-5 bg-blue-50 rounded-xl border border-primary flex gap-5 items-center">
                    <Loader2Icon className="animate-spin" />
                    <div>
                        <h2 className="font-medium">Generating Interview Questions</h2>
                        <p className="text-primary">
                            Our AI is crafting personalized questions based on your job position
                        </p>
                    </div>
                </div>
            )}

            {questionList?.length > 0 && (
                <div>
                    <QuestionListContainer questionList={questionList} />
                </div>
            )}

            <div className="flex justify-end mt-10">
                <Button onClick={onFinish} disabled={saveLoading}>
                    {saveLoading && <Loader2 className="animate-spin" />}
                    Create Interview Link & Finish
                </Button>
            </div>
        </div>
    );
}

export default QuestionList;
