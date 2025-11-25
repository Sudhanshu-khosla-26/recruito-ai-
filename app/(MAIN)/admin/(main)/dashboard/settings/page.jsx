"use client";
import { Settings, Save, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser } from "@/provider";

function CompanySettings() {
    // Replace with actual company_id from your auth/context
    const { user } = useUser();
    console.log("User in CompanySettings:", user);
    // const [companyId, setCompanyId] = useState("your-company-id");
    // Settings state
    const [settings, setSettings] = useState({
        max_ai_interviews: 2,
        allow_additional_rounds: true,
        max_additional_rounds: 2,
        reminder_hours_before: 24,
        auto_reject_below_score: 40,
    });

    // UI state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [hasChanges, setHasChanges] = useState(false);
    const [originalSettings, setOriginalSettings] = useState(null);

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, [user.company_id]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/company-settings/${user.company_id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }

            const data = await response.json();

            if (data.settings) {
                const fetchedSettings = {
                    max_ai_interviews: data.settings.max_ai_interviews || 2,
                    allow_additional_rounds: data.settings.allow_additional_rounds ?? true,
                    max_additional_rounds: data.settings.max_additional_rounds || 2,
                    reminder_hours_before: data.settings.reminder_hours_before || 24,
                    auto_reject_below_score: data.settings.auto_reject_below_score || 40,
                };
                setSettings(fetchedSettings);
                setOriginalSettings(fetchedSettings);
            }

            setMessage({ type: "success", text: "Settings loaded successfully" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            console.error("Error fetching settings:", error);
            setMessage({
                type: "error",
                text: "Failed to load settings"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const response = await fetch(`/api/company-settings/${user.company_id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            const data = await response.json();

            if (data.ok) {
                setOriginalSettings(settings);
                setHasChanges(false);
                setMessage({ type: "success", text: "Settings updated successfully!" });
                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({
                type: "error",
                text: "Failed to update settings"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (originalSettings) {
            setSettings(originalSettings);
            setHasChanges(false);
            setMessage({ type: "info", text: "Changes discarded" });
            setTimeout(() => setMessage({ type: "", text: "" }), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="h-6 w-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-800">Company Settings</h1>
                    </div>
                    <p className="text-sm text-gray-600">
                        Configure interview and recruitment settings for your organization
                    </p>
                </div>

                {/* Status Messages */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg border-2 flex items-center gap-2 ${message.type === "success"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : message.type === "error"
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-blue-50 border-blue-200 text-blue-800"
                        }`}>
                        {message.type === "success" ? (
                            <CheckCircle className="h-5 w-5" />
                        ) : (
                            <AlertCircle className="h-5 w-5" />
                        )}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                {/* Settings Form */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">

                    {/* AI Interview Settings */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            AI Interview Configuration
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum AI Interviews per Candidate
                                </label>
                                <select
                                    value={settings.max_ai_interviews}
                                    onChange={(e) => handleInputChange('max_ai_interviews', parseInt(e.target.value))}
                                    className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={1}>1 Round</option>
                                    <option value={2}>2 Rounds</option>
                                    <option value={3}>3 Rounds</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Number of AI screening rounds before human interview (1-3)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Auto-Reject Below Score (%)
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={settings.auto_reject_below_score}
                                        onChange={(e) => handleInputChange('auto_reject_below_score', parseInt(e.target.value))}
                                        className="flex-1 max-w-xs"
                                    />
                                    <span className="text-sm font-semibold text-gray-800 min-w-[50px]">
                                        {settings.auto_reject_below_score}%
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Candidates scoring below this threshold will be automatically rejected
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Rounds Settings */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Additional Interview Rounds
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="allow_additional"
                                    checked={settings.allow_additional_rounds}
                                    onChange={(e) => handleInputChange('allow_additional_rounds', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="allow_additional" className="text-sm font-medium text-gray-700">
                                    Allow Additional Interview Rounds
                                </label>
                            </div>

                            {settings.allow_additional_rounds && (
                                <div className="ml-7">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Additional Rounds
                                    </label>
                                    <select
                                        value={settings.max_additional_rounds}
                                        onChange={(e) => handleInputChange('max_additional_rounds', parseInt(e.target.value))}
                                        className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value={1}>1 Round</option>
                                        <option value={2}>2 Rounds</option>
                                        <option value={3}>3 Rounds</option>
                                        <option value={4}>4 Rounds</option>
                                        <option value={5}>5 Rounds</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Number of additional rounds after primary interviews
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="pb-2">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Notification Settings
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Send Reminder Before Interview (hours)
                            </label>
                            <select
                                value={settings.reminder_hours_before}
                                onChange={(e) => handleInputChange('reminder_hours_before', parseInt(e.target.value))}
                                className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={1}>1 hour before</option>
                                <option value={2}>2 hours before</option>
                                <option value={6}>6 hours before</option>
                                <option value={12}>12 hours before</option>
                                <option value={24}>24 hours before</option>
                                <option value={48}>48 hours before</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Automatic reminder emails will be sent to participants
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6 gap-4">
                    <button
                        onClick={handleReset}
                        disabled={!hasChanges || saving}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Discard Changes
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Important Notes:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Changes will affect all new interviews and candidates</li>
                                <li>Existing scheduled interviews will not be modified</li>
                                <li>Settings are applied company-wide to all job postings</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompanySettings;