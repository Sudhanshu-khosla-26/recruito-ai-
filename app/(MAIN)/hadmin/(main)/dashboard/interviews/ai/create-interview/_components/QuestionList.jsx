// "use client";
// import { Button } from "@/app/components/ui/button";
// import axios from "axios";
// import { Loader2, X, Pencil } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import { toast } from "sonner";
// import { supabase } from "@/services/supabaseClient";
// import { useUser } from "@/provider";
// import { v4 as uuidv4 } from "uuid";
// import { motion, AnimatePresence } from "framer-motion";

// function QuestionList({ formData, onCreateLink }) {
//   const [loading, setLoading] = useState(true);
//   const [questionList, setQuestionList] = useState([]); // [{question, type}]
//   const { user } = useUser();
//   const [saveLoading, setSaveLoading] = useState(false);

//   // edit state (question text only)
//   const [editIndex, setEditIndex] = useState(null);
//   const [editValue, setEditValue] = useState("");

//   useEffect(() => {
//     if (formData) {
//       GenerateQuestionList();
//     }
//   }, [formData]);

//   const GenerateQuestionList = async () => {
//     setLoading(true);
//     try {
//       const result = await axios.post("/api/ai-model", { ...formData });
//       const Content = result.data.content;
//       const FINAL_CONTENT = Content.replace("```json", "").replace("```", "");
//       const parsed = JSON.parse(FINAL_CONTENT)?.interviewQuestions || [];
//       setQuestionList(parsed);
//     } catch (e) {
//       console.log(e);
//       toast("Server Error, Try Again!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onFinish = async () => {
//     setSaveLoading(true);
//     const interview_id = uuidv4();

//     await supabase.from("Interviews").insert([
//       {
//         ...formData,
//         questionList,
//         userEmail: user?.email,
//         interview_id,
//       },
//     ]);

//     await supabase
//       .from("Users")
//       .update({ credits: Number(user?.credits) - 1 })
//       .eq("email", user?.email);

//     setSaveLoading(false);
//     onCreateLink(interview_id);
//   };

//   const removeQuestion = (index) => {
//     setQuestionList((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleEdit = (index, value) => {
//     setEditIndex(index);
//     setEditValue(value);
//   };

//   const handleSaveEdit = (index) => {
//     setQuestionList((prev) =>
//       prev.map((q, i) => (i === index ? { ...q, question: editValue.trim() } : q))
//     );
//     setEditIndex(null);
//     setEditValue("");
//   };

//   // ---- grouping: types in ascending order (simple text) ----
//   const typeOrder = Array.from(new Set(questionList.map((q) => q.type))).sort((a, b) =>
//     String(a || "").localeCompare(String(b || ""))
//   );
//   const indexed = questionList.map((q, i) => ({ ...q, __idx: i }));

//   return (
//     <div className="w-full p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl">
//       {loading && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="p-5 bg-blue-100/50 backdrop-blur-md rounded-xl border border-primary flex gap-4 items-center shadow-md"
//         >
//           <Loader2 className="animate-spin text-primary" />
//           <div>
//             <h2 className="font-semibold text-black">Generating Interview Questions</h2>
//             <p className="text-sm text-primary">
//               Our AI is crafting personalized questions based on your job position
//             </p>
//           </div>
//         </motion.div>
//       )}

//       {!loading && questionList?.length > 0 && (
//         <div className="mt-6 space-y-6">
//           {typeOrder.map((type) => {
//             const items = indexed.filter((q) => q.type === type);
//             return (
//               <div key={type} className="space-y-3">
//                 {/* simple text type header (non-editable) */}
//                 <div className="text-sm font-medium text-black">{type || "Uncategorized"}</div>

//                 <div className="grid gap-3">
//                   <AnimatePresence>
//                     {items.map((item) => (
//                       <motion.div
//                         key={item.__idx}
//                         initial={{ opacity: 0, scale: 0.95 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         exit={{ opacity: 0, scale: 0.9 }}
//                         whileHover={{ scale: 1.02, y: -2 }}
//                         transition={{ duration: 0.18 }}
//                         className="relative bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-md border border-gray-200 flex items-center gap-3"
//                       >
//                         {editIndex === item.__idx ? (
//                           <input
//                             autoFocus
//                             value={editValue}
//                             onChange={(e) => setEditValue(e.target.value)}
//                             onBlur={() => handleSaveEdit(item.__idx)}
//                             onKeyDown={(e) => {
//                               if (e.key === "Enter") handleSaveEdit(item.__idx);
//                               if (e.key === "Escape") {
//                                 setEditIndex(null);
//                                 setEditValue("");
//                               }
//                             }}
//                             className="flex-1 px-2 py-1 border-b border-gray-400 focus:outline-none text-black bg-transparent"
//                           />
//                         ) : (
//                           <div className="flex-1">
//                             <p className="text-black text-sm">{item.question}</p>
//                             {/* type shown again inline if you want; still simple text & non-editable */}
//                             {/* <p className="text-xs text-black/70 mt-1">Type: {type || "Uncategorized"}</p> */}
//                           </div>
//                         )}

//                         {/* Pencil (edit question text only) */}
//                         <button
//                           aria-label="Edit question"
//                           onClick={() => handleEdit(item.__idx, item.question)}
//                           className="text-gray-400 hover:text-blue-500 transition"
//                         >
//                           <Pencil className="w-4 h-4" />
//                         </button>

//                         {/* Soft cancel */}
//                         <button
//                           aria-label="Remove question"
//                           onClick={() => removeQuestion(item.__idx)}
//                           className="text-gray-400 hover:text-red-500 transition"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </motion.div>
//                     ))}
//                   </AnimatePresence>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {questionList?.length > 0 && (
//         <div className="flex justify-end mt-8">
//           <Button
//             onClick={() => onFinish()}
//             disabled={saveLoading}
//             className="bg-primary text-white shadow-md hover:shadow-lg transition-all"
//           >
//             {saveLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
//             Create Interview Link & Finish
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default QuestionList;
