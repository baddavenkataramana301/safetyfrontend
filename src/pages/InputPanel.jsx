/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Mic,
    Square,
    Image as ImageIcon,
    Camera,
    X,
    Sparkles,
    ShieldAlert,
    Loader2,
    Upload,
    CheckCircle2
} from "lucide-react";

export default function InputPanel({ onAssess, isLoading }) {
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [showConfirmBox, setShowConfirmBox] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleTranscribe = async () => {
        if (!audioBlob) return;
        setIsTranscribing(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'voice_note.webm');

            const response = await fetch('http://127.0.0.1:8000/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Transcription failed");

            const data = await response.json();
            setTranscription(data.text);
            setShowConfirmBox(true);
        } catch (err) {
            console.error("Transcription error:", err);
        } finally {
            setIsTranscribing(false);
        }
    };

    const confirmTranscription = () => {
        const newDescription = text ? `${text}\n\n${transcription}` : transcription;
        setText(newDescription);
        setTranscription('');
        setShowConfirmBox(false);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            alert("Microphone access denied or not supported.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error(err);
            alert("Camera access denied or not supported.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                    setImage(file);
                    setImagePreview(URL.createObjectURL(blob));
                    stopCamera();
                }
            }, 'image/jpeg', 0.8);
        }
    };

    useEffect(() => {
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() && !image && !audioBlob) return;
        onAssess({ text, image, audio: audioBlob });
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    Safety Assessment Input
                </CardTitle>
                <CardDescription>
                    Provide details about the activity to identify potential risks.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="description">Activity Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the activity, equipment, materials, and environment..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={isLoading}
                            className="min-h-[120px] resize-none focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Visual Evidence (Optional)</Label>
                        <div className="grid grid-cols-1 gap-4">
                            {isCameraOpen ? (
                                <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex flex-col items-center justify-center group">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-4 flex gap-2">
                                        <Button
                                            type="button"
                                            onClick={capturePhoto}
                                            className="bg-primary hover:bg-primary/90"
                                        >
                                            <Camera className="mr-2 h-4 w-4" />
                                            Capture
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={stopCamera}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                            ) : imagePreview ? (
                                <div className="relative rounded-lg overflow-hidden border aspect-video group">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                            setImage(null);
                                            setImagePreview(null);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-24 flex-col border-dashed gap-2"
                                        onClick={() => document.getElementById('img-upload-panel').click()}
                                    >
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                        <span className="text-xs">Upload Photo</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-24 flex-col border-dashed gap-2"
                                        onClick={startCamera}
                                    >
                                        <Camera className="h-6 w-6 text-muted-foreground" />
                                        <span className="text-xs">Use Camera</span>
                                    </Button>
                                    <input
                                        id="img-upload-panel"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Voice Context</Label>
                        {!isRecording && !audioBlob ? (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 border-dashed gap-2"
                                    onClick={() => document.getElementById('audio-upload-panel').click()}
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload Audio
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 border-dashed gap-2"
                                    onClick={startRecording}
                                >
                                    <Mic className="h-4 w-4" />
                                    Record Voice
                                </Button>
                                <input
                                    id="audio-upload-panel"
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setAudioBlob(e.target.files[0])}
                                    className="hidden"
                                />
                            </div>
                        ) : isRecording ? (
                            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                                    <span className="text-sm font-medium text-destructive">Recording Audio...</span>
                                </div>
                                <Button size="sm" variant="destructive" onClick={stopRecording}>
                                    <Square className="h-4 w-4 mr-2" /> Stop
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                                    <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1 h-8" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                            setAudioBlob(null);
                                            setTranscription('');
                                            setShowConfirmBox(false);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {!showConfirmBox && !isTranscribing && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full gap-2"
                                        onClick={handleTranscribe}
                                    >
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        Magic Transcribe
                                    </Button>
                                )}

                                {isTranscribing && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        Transcribing your voice...
                                    </div>
                                )}

                                {showConfirmBox && (
                                    <div className="p-4 border rounded-lg bg-primary/5 border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <Label className="text-primary">Transcribed Text</Label>
                                            <Textarea
                                                value={transcription}
                                                onChange={(e) => setTranscription(e.target.value)}
                                                className="bg-background min-h-[80px]"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                className="flex-1"
                                                onClick={confirmTranscription}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Add to Description
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowConfirmBox(false)}
                                            >
                                                Discard
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-lg h-12"
                        disabled={isLoading || (!text.trim() && !image && !audioBlob)}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Analyzing Safety Risks...
                            </>
                        ) : (
                            'Perform Risk Assessment'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
