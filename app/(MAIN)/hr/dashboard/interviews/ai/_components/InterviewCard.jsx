import { Button } from '@/app/components/ui/button'
import { ArrowRight, Copy, Send } from 'lucide-react'
import moment from 'moment'
import Link from 'next/link'
import React from 'react'
import { toast } from 'sonner'

function InterviewCard({ interview, viewDetail = false }) {
    const url = process.env.NEXT_PUBLIC_HOST_URL + "/" + interview?.interview_id

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        toast('Copied')
    }

    const onSend = () => {
        window.location.href = "mailto:recruitoai.info@gmail.com?subject=RecruitoAI interview link:" + url
    }

    return (
        <div className='p-3 bg-white rounded-md border text-xs'>
            <div className='flex items-center justify-between'>
                <div className='h-[15px] w-[15px] bg-primary rounded-full'></div>
                <h2 className='text-[10px] font-medium'>
                    {moment(interview?.created_at).format('DD MMM yyyy')}
                </h2>
            </div>
            <h2 className='mt-2 font-semibold text-sm'>{interview?.jobPosition}</h2>
            <h2 className='mt-1 flex justify-between text-gray-500 text-xs'>
                {interview?.duration}
                {viewDetail && (
                    <span className='text-green-700'>
                        {interview['interview-feedback']?.length} Candidates
                    </span>
                )}
            </h2>
            {!viewDetail ? (
                <div className='flex gap-2 w-full mt-3'>
                    <Button
                        variant='outline'
                        className='w-full text-primary text-xs py-1'
                        onClick={copyLink}
                    >
                        <Copy className='h-3 w-3' /> Copy Link
                    </Button>
                    <Button
                        className='w-full text-xs py-1'
                        onClick={onSend}
                    >
                        <Send className='h-3 w-3' /> Send
                    </Button>
                </div>
            ) : (
                <Link href={'/scheduled-interview/' + interview?.interview_id + "/details"}>
                    <Button className="mt-3 w-full text-xs py-1" variant="outline">
                        View Detail <ArrowRight className='h-3 w-3' />
                    </Button>
                </Link>
            )}
        </div>
    )
}

// Wrapper to keep 5 cards in one column
export function InterviewCardList({ interviews, viewDetail }) {
    return (
        <div className="grid grid-cols-1 gap-3 max-w-xs">
            {interviews?.map((interview, i) => (
                <InterviewCard
                    key={i}
                    interview={interview}
                    viewDetail={viewDetail}
                />
            ))}
        </div>
    )
}

export default InterviewCard
