"use client"
import React from "react";
import { Brain, Twitter, Linkedin, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold text-green-500">RecruitoAI</span>
            </div>
            <p className="text-gray-400 mb-6">
              Revolutionizing talent acquisition with intelligent AI-powered assessments.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-green-400">Product</h3>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-green-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">API</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Security</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-green-400">Company</h3>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-green-400">Support</h3>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-green-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Status</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 mb-4 md:mb-0">
            © 2025 RecruitoAI. All rights reserved.
          </div>
          <div className="flex gap-6 text-gray-400 text-sm">
            <a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-green-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}