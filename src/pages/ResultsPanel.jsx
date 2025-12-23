/* eslint-disable react/prop-types */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Download,
    FileJson,
    FileText,
    Image as ImageIcon,
    RotateCcw,
    AlertTriangle,
    ShieldCheck,
    Info,
    ChevronDown
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ResultsPanel({ results, onReset }) {
    if (!results) return null;

    const riskLevel = results.risk_level || 'Low';
    const isHighRisk = riskLevel.toLowerCase() === 'high' || riskLevel.toLowerCase() === 'critical';

    const handleDownload = async (format) => {
        try {
            if (format === 'pdf') {
                const response = await fetch('http://127.0.0.1:8000/report/pdf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(results),
                });
                if (!response.ok) throw new Error("Failed to generate PDF");
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Safety_Assessment_${Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            }
            else if (format === 'word') {
                const response = await fetch('http://127.0.0.1:8000/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(results),
                });
                if (!response.ok) throw new Error("Failed to generate DOCX");
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Safety_Assessment_${Date.now()}.docx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            }
            else if (format === 'json') {
                const jsonString = JSON.stringify(results, null, 2);
                const blob = new Blob([jsonString], { type: "application/json" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Safety_Assessment_${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            }
            else if (format === 'jpg') {
                const html2canvas = (await import('html2canvas')).default;
                const element = document.getElementById('assessment-report-card');
                const canvas = await html2canvas(element, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false,
                    useCORS: true
                });
                const link = document.createElement('a');
                link.download = `Safety_Assessment_${Date.now()}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.click();
            }
        } catch (err) {
            console.error("Download error:", err);
            alert("Error downloading report: " + err.message);
        }
    };

    const getRiskBadgeVariant = (level) => {
        switch (level?.toLowerCase()) {
            case 'critical': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card id="assessment-report-card" className="border-none shadow-lg overflow-hidden transition-all duration-300">
                <CardHeader className="bg-muted/30 pb-6 border-b">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Safety Assessment Report</CardTitle>
                            <CardDescription>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</CardDescription>
                        </div>
                        <Badge variant={getRiskBadgeVariant(riskLevel)} className="text-sm px-3 py-1 uppercase tracking-wider font-bold">
                            {riskLevel} Risk
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-8">
                    {results.description && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                <Info className="h-4 w-4" /> Activity Context
                            </h4>
                            <p className="text-sm border-l-4 border-primary/30 pl-4 py-1 italic bg-muted/20 rounded-r-md">
                                {results.description}
                            </p>
                        </div>
                    )}

                    {isHighRisk && (
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-pulse">
                            <div className="p-2 rounded-full bg-destructive/20">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-destructive">CRITICAL SAFETY ALERT</h4>
                                <p className="text-sm text-destructive/90">
                                    High hazard level detected. Immediate management intervention and formal approval are mandatory before proceeding.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-tight">
                                <AlertTriangle className="h-4 w-4 text-warning" /> Identified Hazards
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {results.hazards?.map((h, i) => (
                                    <Badge key={i} variant="secondary" className="bg-muted hover:bg-muted font-medium py-1 px-3">
                                        {h}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-tight">
                                <ShieldCheck className="h-4 w-4 text-primary" /> Required Controls
                            </h4>
                            <div className="space-y-2">
                                {results.controls?.map((c, i) => (
                                    <div key={i} className="flex gap-3 items-start p-2 rounded-md hover:bg-muted/30 transition-colors">
                                        <Badge variant="outline" className="mt-0.5 whitespace-nowrap text-[10px] h-5">{c.type}</Badge>
                                        <span className="text-sm leading-relaxed">{c.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">HIRA Parameters</h4>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Metric</TableHead>
                                        <TableHead className="text-right">Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Total Risk Score</TableCell>
                                        <TableCell className="text-right font-bold text-lg">{results.risk_score}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">AI Confidence Level</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <span className={`font-bold ${results.confidence_score > 70 ? 'text-success' : results.confidence_score > 40 ? 'text-warning' : 'text-destructive'}`}>
                                                    {results.confidence_score}%
                                                </span>
                                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden inline-block border">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${results.confidence_score > 70 ? 'bg-success' : results.confidence_score > 40 ? 'bg-warning' : 'bg-destructive'}`}
                                                        style={{ width: `${results.confidence_score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {results.reasoning && (
                                        <TableRow>
                                            <TableCell className="font-medium align-top">Analysis Reasoning</TableCell>
                                            <TableCell className="text-sm leading-relaxed text-muted-foreground text-right italic max-w-xs ml-auto">
                                                "{results.reasoning}"
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-muted/30 py-6 flex flex-col sm:flex-row gap-4">
                    <Button
                        variant="destructive"
                        onClick={onReset}
                        className="w-full sm:flex-1 h-11"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" /> Start New Assessment
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" className="w-full sm:flex-1 h-11">
                                <Download className="mr-2 h-4 w-4" /> Download Report <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => handleDownload('pdf')} className="cursor-pointer">
                                <FileText className="mr-2 h-4 w-4" /> PDF Document
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload('word')} className="cursor-pointer">
                                <FileText className="mr-2 h-4 w-4" /> Word Document
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload('jpg')} className="cursor-pointer">
                                <ImageIcon className="mr-2 h-4 w-4" /> Assessment Image (JPG)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload('json')} className="cursor-pointer">
                                <FileJson className="mr-2 h-4 w-4" /> Raw Data (JSON)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardFooter>
            </Card>
        </div>
    );
}
