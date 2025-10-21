'use client'

import { Button } from '@/app/components/ui/button';
import { Video } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import InterviewCard from '../dashboard/_components/InterviewCard';
import { db } from '@/lib/firebase'; // Make sure you have initialized Firebase
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

function ScheduledInterview() {
    // Mock user or replace with your auth context
    const user = { email: 'test@example.com' }; // Replace with actual user context

    const [interviewList, setInterviewList] = useState([]);

    useEffect(() => {
        if (user?.email) {
            getInterviewList();
        }
    }, [user]);

    const getInterviewList = async () => {
        try {
            const interviewsRef = collection(db, 'Interviews');
            const q = query(
                interviewsRef,
                where('userEmail', '==', user.email),
                orderBy('createdAt', 'desc') // Make sure your Firestore has createdAt field
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            console.log(data);
            setInterviewList(data);
        } catch (error) {
            console.error('Error fetching interviews:', error);
        }
    };

    return (
        <div className='mt-5'>
            <h2 className='font-bold text-2xl'>Interview List with Candidate Feedback</h2>

            {interviewList.length === 0 && (
                <div className='p-5 flex flex-col gap-3 items-center bg-white rounded-xl mt-5'>
                    <Video className='h-10 w-10 text-primary' />
                    <h2>You don't have any interview created!</h2>
                    <Button>+ Create New Interview</Button>
                </div>
            )}

            {interviewList.length > 0 && (
                <div className='grid grid-cols-2 mt-5 xl:grid-cols-3 gap-5'>
                    {interviewList.map((interview, index) => (
                        <InterviewCard
                            interview={interview}
                            key={index}
                            viewDetail={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ScheduledInterview;
