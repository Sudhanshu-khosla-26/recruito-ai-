"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ArrowLeft, Clock, Copy, List, Mail, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Share Handlers
const shareToSlack = (url) => {
  toast("Opening Slack...");
  window.open(
    `https://slack.com/app_redirect?channel=general&team=yourteam&url=${encodeURIComponent(
      url
    )}`,
    "_blank"
  );
};

const shareToWhatsapp = (url) => {
  toast("Opening WhatsApp...");
  window.open(
    `https://wa.me/?text=Start your interview here: ${encodeURIComponent(url)}`,
    "_blank"
  );
};

const shareToTeams = (url) => {
  toast("Opening Microsoft Teams...");
  window.open(
    `https://teams.microsoft.com/l/chat/0/0?users=example@domain.com&message=${encodeURIComponent(
      url
    )}`,
    "_blank"
  );
};

function InterviewLink({ interview_id, formData, questions }) {
  const url = "http://localhost:3000/interview" + "/" + interview_id;
  const [validity, setValidity] = useState("2 Days");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");

  const GetInterviewUrl = () => url;

  const onCopyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast("Link Copied");
  };

  const handleSendEmail = () => {
    if (!email) {
      toast("Please enter an email address");
      return;
    }
    toast(`Sending interview link to ${email}...`);
    window.open(
      `mailto:${email}?subject=AI Interview Link&body=Please use this link to start the interview: ${url}`,
      "_blank"
    );
    setShowEmailModal(false);
    setEmail("");
  };

  return (
    <motion.div
      className="flex items-center justify-center flex-col mt-10 text-black"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Success Check Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
      >
        <Image
          src={"/check.png"}
          alt="check"
          width={200}
          height={200}
          className="w-[60px] h-[60px]"
        />
      </motion.div>

      <h2 className="font-extrabold text-2xl mt-5 tracking-wide">
        Your AI Interview is Ready!
      </h2>
      <p className="mt-2 text-gray-700 text-center">
        Share this link with your candidates to start the interview process
      </p>

      {/* Interview Link Card */}
      <motion.div
        className="w-full p-6 mt-6 rounded-2xl bg-white/40 backdrop-blur-lg shadow-lg border border-white/30"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Interview Link</h2>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Validity:</span>
            <select
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              className="px-2 py-1 border rounded-lg bg-white/60 backdrop-blur-sm text-sm"
            >
              <option>2 Days</option>
              <option>5 Days</option>
              <option>7 Days</option>
              <option>10 Days</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-3 items-center">
          <Input
            value={GetInterviewUrl()}
            disabled
            className="bg-white/60 backdrop-blur-sm border border-gray-300"
          />
          <Button
            onClick={() => onCopyLink()}
            className="flex items-center gap-2 shadow-md hover:scale-105 transition"
          >
            <Copy className="w-4 h-4" /> Copy
          </Button>
        </div>

        <hr className="my-5 border-gray-300/50" />

        <div className="flex gap-6 text-gray-600">
          <p className="flex gap-2 items-center text-sm">
            <Clock className="h-4 w-4" /> {formData?.duration}
          </p>
          <p className="flex gap-2 items-center text-sm">
            <List className="h-4 w-4" /> {questions.length} Questions
          </p>
        </div>
      </motion.div>

      {/* Share Options */}
      <motion.div
        className="mt-7 w-full p-5 rounded-2xl bg-white/40 backdrop-blur-lg shadow-lg border border-white/30"
        whileHover={{ scale: 1.01 }}
      >
        <h2 className="font-semibold text-lg">Share Via</h2>
        <div className="flex flex-wrap gap-5 mt-3 justify-around">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant={"outline"}
              onClick={() => shareToSlack(url)}
              className="hover:bg-gray-100/60 backdrop-blur-sm shadow-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Slack
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant={"outline"}
              onClick={() => setShowEmailModal(true)}
              className="hover:bg-gray-100/60 backdrop-blur-sm shadow-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Email
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant={"outline"}
              onClick={() => shareToWhatsapp(url)}
              className="hover:bg-gray-100/60 backdrop-blur-sm shadow-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> WhatsApp
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant={"outline"}
              onClick={() => shareToTeams(url)}
              className="hover:bg-gray-100/60 backdrop-blur-sm shadow-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> MS Teams
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Email Popup Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Send Interview Link</h2>
            <Input
              type="email"
              placeholder="Enter candidate email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSendEmail}>Send</Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex w-full gap-5 justify-between mt-8">
        <Link href={"/dashboard"}>
          <Button
            variant={"outline"}
            className="flex items-center gap-2 shadow-sm hover:scale-105 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
        {/* <Link href={"/dashboard/create-interview"}>
          <Button className="flex items-center gap-2 shadow-md hover:scale-105 transition">
            <Plus className="w-4 h-4" /> Create New Interview
          </Button>
        </Link> */}
      </div>
    </motion.div>
  );
}

export default InterviewLink;
