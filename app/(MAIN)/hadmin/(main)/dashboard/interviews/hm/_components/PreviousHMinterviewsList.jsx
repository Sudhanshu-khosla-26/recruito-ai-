// "use client"
// import { useUser } from '@/provider';
// import { Button } from '@/app/components/ui/button';
// import { supabase } from '@/services/supabaseClient';
// import { Video, X } from 'lucide-react';
// import React, { useEffect, useState, useRef } from 'react';
// import { toast } from 'sonner';
// import Link from 'next/link';
// import InterviewCard from './InterviewCard'; // ✅ make sure this exists

// function PreviousHMinterviewsList() {
//     const [interviewList, setInterviewList] = useState([]);
//     const [filteredList, setFilteredList] = useState([]);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [filterType, setFilterType] = useState('all');
//     const [dropdownOpen, setDropdownOpen] = useState(false);
//     const [dropdownSearch, setDropdownSearch] = useState('');
//     const itemsPerPage = 5;
//     const { user } = useUser();
//     const dropdownRef = useRef(null);

//     const filterOptions = [
//         { value: 'all', label: 'All Types' },
//         { value: 'technical', label: 'Technical' },
//         { value: 'hr', label: 'HR' },
//         { value: 'managerial', label: 'Managerial' },
//     ];

//     useEffect(() => {
//         if (user) GetInterviewList();
//     }, [user]);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setDropdownOpen(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const GetInterviewList = async () => {
//         let { data: Interviews, error } = await supabase
//             .from('Interviews')
//             .select('*')
//             .eq('userEmail', user?.email)
//             .order('id', { ascending: false });

//         if (error) {
//             toast.error('Failed to fetch interviews');
//             return;
//         }

//         setInterviewList(Interviews);
//         setFilteredList(Interviews);
//     };

//     const applyFilter = (type) => {
//         let filtered = [...interviewList];
//         if (type !== 'all') filtered = filtered.filter(i => i.type === type);
//         setFilteredList(filtered);
//         setCurrentPage(1);
//     };

//     const selectFilter = (value) => {
//         setFilterType(value);
//         applyFilter(value);
//         setDropdownOpen(false);
//         setDropdownSearch(value === 'all' ? '' : value);
//     };

//     const resetFilter = () => {
//         setFilterType('all');
//         setDropdownSearch('');
//         applyFilter('all');
//     };

//     const filteredDropdownOptions = filterOptions.filter(option =>
//         option.label.toLowerCase().includes(dropdownSearch.toLowerCase())
//     );

//     const totalPages = Math.ceil(filteredList.length / itemsPerPage);
//     const paginatedList = filteredList.slice(
//         (currentPage - 1) * itemsPerPage,
//         currentPage * itemsPerPage
//     );

//     return (
//         <div className='my-5'>
//             <h2 className='font-bold text-2xl'>Previously Created Interviews</h2>

//             {/* Custom searchable dropdown */}
//             <div className="flex gap-4 mt-4 items-center">
//                 <div className="relative w-52" ref={dropdownRef}>
//                     <div
//                         className="border rounded-lg p-2 flex justify-between items-center cursor-pointer"
//                         onClick={() => setDropdownOpen(!dropdownOpen)}
//                     >
//                         <span>
//                             {filterOptions.find(opt => opt.value === filterType)?.label || 'All Types'}
//                         </span>
//                         {filterType !== 'all' && (
//                             <X
//                                 className="h-4 w-4 text-gray-500 cursor-pointer ml-2"
//                                 onClick={(e) => { e.stopPropagation(); resetFilter(); }}
//                             />
//                         )}
//                     </div>

//                     {dropdownOpen && (
//                         <div className="absolute top-full left-0 w-full border border-gray-300 rounded-lg bg-white mt-1 z-10 max-h-40 overflow-y-auto shadow">
//                             {/* Type search inside dropdown */}
//                             <input
//                                 type="text"
//                                 value={dropdownSearch}
//                                 onChange={(e) => setDropdownSearch(e.target.value)}
//                                 placeholder="Type to search..."
//                                 className="w-full px-2 py-1 text-sm border-b border-gray-200 focus:outline-none"
//                             />

//                             {filteredDropdownOptions.map(option => (
//                                 <div
//                                     key={option.value}
//                                     className="px-2 py-2 text-sm cursor-pointer hover:bg-gray-100"
//                                     onClick={() => selectFilter(option.value)}
//                                 >
//                                     {option.label}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {filteredList?.length === 0 && (
//                 <div className='p-5 flex flex-col gap-3 items-center bg-white rounded-xl mt-5 '>
//                     <Video className='h-10 w-10 text-primary' />
//                     <h2>You don't have any interview created!</h2>
//                 </div>
//             )}

//             {filteredList?.length > 0 && (
//                 <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-5'>
//                     {paginatedList.map((interview, index) => (
//                         <InterviewCard interview={interview} key={index} />
//                     ))}
//                 </div>
//             )}

//             {/* Pagination */}
//             {totalPages > 1 && (
//                 <div className="flex gap-2 mt-5 justify-center">
//                     <Button
//                         disabled={currentPage === 1}
//                         onClick={() => setCurrentPage(prev => prev - 1)}
//                     >
//                         Prev
//                     </Button>
//                     {[...Array(totalPages)].map((_, i) => (
//                         <Button
//                             key={i}
//                             variant={currentPage === i + 1 ? 'default' : 'outline'}
//                             onClick={() => setCurrentPage(i + 1)}
//                         >
//                             {i + 1}
//                         </Button>
//                     ))}
//                     <Button
//                         disabled={currentPage === totalPages}
//                         onClick={() => setCurrentPage(prev => prev + 1)}
//                     >
//                         Next
//                     </Button>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default PreviousHMinterviewsList;
