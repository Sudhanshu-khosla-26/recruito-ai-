'use client'

import { Button } from '@/app/components/ui/button';
import { Video } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import InterviewCard from '../dashboard/_components/InterviewCard';
import { db } from '@/lib/firebase'; // Make sure Firebase is initialized
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useUser } from '@/provider'; // Your auth provider

function AllInterview() {
    const { user } = useUser(); // Get logged-in user from provider
    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.email) {
            getInterviewList();
        }
    }, [user]);

    const getInterviewList = async () => {
        setLoading(true);
        try {
            const interviewsRef = collection(db, 'Interviews');
            const q = query(
                interviewsRef,
                where('userEmail', '==', user.email),
                orderBy('createdAt', 'desc') // Make sure createdAt exists
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setInterviewList(data);
        } catch (error) {
            console.error('Error fetching interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='my-5'>
            <h2 className='font-bold text-2xl'>All Previously Created Interviews</h2>

            {loading && <p className='text-xs text-gray-500 mt-2'>Loading...</p>}

            {!loading && interviewList.length === 0 && (
                <div className='p-5 flex flex-col gap-3 items-center bg-white rounded-xl mt-5'>
                    <Video className='h-10 w-10 text-primary' />
                    <h2>You don't have any interview created!</h2>
                    <Button>+ Create New Interview</Button>
                </div>
            )}

            {!loading && interviewList.length > 0 && (
                <div className='grid grid-cols-2 mt-5 xl:grid-cols-3 gap-5'>
                    {interviewList.map((interview, index) => (
                        <InterviewCard interview={interview} key={index} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default AllInterview;
