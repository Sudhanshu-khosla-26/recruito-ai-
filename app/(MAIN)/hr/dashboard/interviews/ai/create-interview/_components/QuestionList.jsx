'use client';

import { Button } from "@/app/components/ui/button";
import axios from "axios";
import { Loader2, X, Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/provider";
import { motion, AnimatePresence } from "framer-motion";


function QuestionList({ formData, onCreateLink, questions, setQuestions }) {
  const [loading, setLoading] = useState(true);
  const [questionList, setQuestionList] = useState({});
  const { user } = useUser();
  const [saveLoading, setSaveLoading] = useState(false);

  // edit state (question text only)
  const [editKey, setEditKey] = useState(null); // Format: "type-index"
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (formData) GenerateQuestionList();
  }, [formData, questions]);

  const GenerateQuestionList = async () => {
    setLoading(true);
    try {

      if (!questions || Object.keys(questions).length === 0) {
        // Questions not ready yet, stay in loading state
        return;
      }

      setQuestionList(questions);
      setLoading(false);
    } catch (e) {
      console.log(e);
      alert("Server Error, Try Again!");
      setLoading(false);
    }
  };

  const onFinish = async () => {
    if (!user?.email) return toast.error("User not found");

    setSaveLoading(true);
    try {
      // Pass the modified questionList directly to onCreateLink
      await onCreateLink(questionList);
      toast.success("Interview created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save interview");
    } finally {
      setSaveLoading(false);
    }
  };


  const removeQuestion = (type, index) => {
    setQuestionList((prev) => {
      const updated = { ...prev };
      updated[type] = updated[type].filter((_, i) => i !== index);
      // Remove type if no questions left
      if (updated[type].length === 0) {
        delete updated[type];
      }
      return updated;
    });
  };

  const handleEdit = (type, index, value) => {
    setEditKey(`${type}-${index}`);
    setEditValue(value);
  };

  const handleSaveEdit = (type, index) => {
    setQuestionList((prev) => {
      const updated = { ...prev };
      updated[type] = updated[type].map((q, i) =>
        i === index ? { ...q, question: editValue.trim() } : q
      );
      return updated;
    });
    setEditKey(null);
    setEditValue("");
  };

  const getTotalQuestions = () => {
    return Object.values(questionList).reduce((sum, arr) => sum + arr.length, 0);
  };

  // Sort types alphabetically
  const sortedTypes = Object.keys(questionList).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div className="w-full p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl">
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-blue-100/50 backdrop-blur-md rounded-xl border border-primary flex gap-4 items-center shadow-md"
        >
          <Loader2 className="animate-spin text-primary" />
          <div>
            <h2 className="font-semibold text-black">Generating Interview Questions</h2>
            <p className="text-sm text-primary">
              Our AI is crafting personalized questions based on your job position
            </p>
          </div>
        </motion.div>
      )}

      {!loading && getTotalQuestions() > 0 && (
        <div className="mt-6 space-y-6">
          {sortedTypes.map((type) => {
            const items = questionList[type] || [];
            if (items.length === 0) return null;

            return (
              <div key={type} className="space-y-3">
                <div className="text-sm font-medium text-black capitalize">
                  {type.replace(/_/g, " ")}
                </div>
                <div className="grid gap-3">
                  <AnimatePresence>
                    {items.map((item, index) => {
                      const itemKey = `${type}-${index}`;
                      return (
                        <motion.div
                          key={itemKey}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          transition={{ duration: 0.18 }}
                          className="relative bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-md border border-gray-200 flex items-center gap-3"
                        >
                          {editKey === itemKey ? (
                            <input
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSaveEdit(type, index)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit(type, index);
                                if (e.key === "Escape") {
                                  setEditKey(null);
                                  setEditValue("");
                                }
                              }}
                              className="flex-1 px-2 py-1 border-b border-gray-400 focus:outline-none text-black bg-transparent"
                            />
                          ) : (
                            <div className="flex-1">
                              <p className="text-black text-sm">{item?.question}</p>
                            </div>
                          )}

                          <button
                            aria-label="Edit question"
                            onClick={() => handleEdit(type, index, item?.question)}
                            className="text-gray-400 hover:text-blue-500 transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            aria-label="Remove question"
                            onClick={() => removeQuestion(type, index)}
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {getTotalQuestions() > 0 && (
        <div className="flex justify-end mt-8">
          <Button
            onClick={() => onFinish()}
            disabled={saveLoading}
            className="bg-primary text-white shadow-md hover:shadow-lg transition-all"
          >
            {saveLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Create Interview Link & Finish
          </Button>
        </div>
      )}
    </div>
  );
}

export default QuestionList;