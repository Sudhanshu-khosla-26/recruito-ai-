
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Download, Eye, Trash2, Plus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Docs() {
  const [searchTerm, setSearchTerm] = useState("");

  const documents = [
    {
      id: 1,
      name: "John_Doe_Resume_2025.pdf",
      type: "Resume",
      size: "2.3 MB",
      lastModified: "2 hours ago",
      status: "current",
      tags: ["latest", "updated"]
    },
    {
      id: 2,
      name: "Cover_Letter_TechCorp.pdf",
      type: "Cover Letter",
      size: "1.1 MB",
      lastModified: "1 day ago",
      status: "current",
      tags: ["tech", "senior"]
    },
    {
      id: 3,
      name: "Portfolio_Website.pdf",
      type: "Portfolio",
      size: "5.7 MB",
      lastModified: "3 days ago",
      status: "current",
      tags: ["portfolio", "projects"]
    },
    {
      id: 4,
      name: "AWS_Certification.pdf",
      type: "Certificate",
      size: "856 KB",
      lastModified: "1 week ago",
      status: "current",
      tags: ["aws", "cloud", "certification"]
    },
    {
      id: 5,
      name: "Previous_Resume_v2.pdf",
      type: "Resume",
      size: "1.9 MB",
      lastModified: "2 weeks ago",
      status: "archived",
      tags: ["old", "v2"]
    },
    {
      id: 6,
      name: "React_Certificate.pdf",
      type: "Certificate",
      size: "723 KB",
      lastModified: "1 month ago",
      status: "current",
      tags: ["react", "frontend", "certification"]
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'Resume':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cover Letter':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Portfolio':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Certificate':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const currentDocs = documents.filter(doc => doc.status === 'current');
  const archivedDocs = documents.filter(doc => doc.status === 'archived');

  const filteredDocs = (docs) => {
    if (!searchTerm) return docs;
    return docs.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    // Handle file drop logic here
    console.log("Files dropped");
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Documents</h1>
            <p className="text-slate-600">Manage your resumes, cover letters, and certificates</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-white/80 backdrop-blur-sm border-white/20"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white gap-2">
              <Plus className="w-4 h-4" />
              Upload Document
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <Card 
          className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-slate-200 hover:border-blue-300 transition-colors duration-300"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 text-center">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Drag & drop files here</h3>
            <p className="text-slate-500 mb-4">or click to browse and upload</p>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
              Choose Files
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="current" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              Current ({currentDocs.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              Archived ({archivedDocs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            <div className="grid gap-4">
              {filteredDocs(currentDocs).map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">{doc.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getTypeColor(doc.type)}>
                                {doc.type}
                              </Badge>
                              <span className="text-sm text-slate-500">{doc.size} • {doc.lastModified}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              {doc.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs border-slate-200 text-slate-600">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-green-50 hover:text-green-600">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {filteredDocs(currentDocs).length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">
                    {searchTerm ? 'No documents found' : 'No documents yet'}
                  </h3>
                  <p className="text-slate-500 mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'Upload your first document to get started'
                    }
                  </p>
                  {!searchTerm && (
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-6">
            <div className="grid gap-4">
              {filteredDocs(archivedDocs).map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-600">{doc.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                                {doc.type}
                              </Badge>
                              <span className="text-sm text-slate-400">{doc.size} • {doc.lastModified}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              {doc.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs border-gray-200 text-gray-500">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-green-50 hover:text-green-600">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {archivedDocs.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No Archived Documents</h3>
                  <p className="text-slate-500">Archived documents will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
