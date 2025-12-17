import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const CertificateGenerator = ({ user, course, date }) => {
  const certificateRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    const element = certificateRef.current;
    if (!element) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Handle cross-origin images
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      
      // A4 Landscape dimensions in mm: 297 x 210
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate-${user?.name || "User"}-${course?.title || "Course"}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {/* Off-screen rendering area - Fixed A4 proportions */}
      <div style={{ position: "fixed", top: "-9999px", left: "-9999px" }}>
        <div
          ref={certificateRef}
          style={{
            width: "1123px", // ~A4 width at 96 DPI
            height: "794px", // ~A4 height at 96 DPI
            padding: "40px",
            background: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "serif",
          }}
        >
          <div
            style={{
              border: "10px solid #ddd",
              padding: "40px",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              backgroundImage: "radial-gradient(circle, #fff 80%, #f7f7f7 100%)",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <img
                src="/logo.png"
                alt="Company Logo"
                style={{ height: "80px", marginBottom: "20px" }}
                onError={(e) => (e.target.style.display = "none")}
              />
              <h1
                style={{
                  fontSize: "48px",
                  color: "#1a365d",
                  margin: "0",
                  textTransform: "uppercase",
                  letterSpacing: "4px",
                }}
              >
                Certificate of Completion
              </h1>
            </div>

            <p style={{ fontSize: "24px", margin: "20px 0" }}>
              This is to certify that
            </p>

            <h2
              style={{
                fontSize: "42px",
                fontStyle: "italic",
                color: "#2563eb",
                borderBottom: "2px solid #ddd",
                paddingBottom: "10px",
                minWidth: "400px",
                margin: "20px 0",
              }}
            >
              {user?.name || "Participant Name"}
            </h2>

            <p style={{ fontSize: "24px", margin: "20px 0" }}>
              has successfully completed the course
            </p>

            <h3
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#1e293b",
                margin: "20px 0",
              }}
            >
              {course?.title || "Safety Course Title"}
            </h3>

            <p style={{ fontSize: "18px", margin: "40px 0 60px" }}>
              Completed on: {new Date(date).toLocaleDateString()}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                width: "80%",
                marginTop: "auto",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    borderTop: "1px solid #000",
                    width: "200px",
                    margin: "0 auto",
                    paddingTop: "10px",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "bold" }}>Safety Manager</p>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    borderTop: "1px solid #000",
                    width: "200px",
                    margin: "0 auto",
                    paddingTop: "10px",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "bold" }}>Director</p>
                </div>
              </div>
            </div>
            
            <div style={{ fontSize: "12px", color: "#999", marginTop: "40px" }}>
              Certificate ID: {course?.id}-{user?.id}-{Date.now()}
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleDownload} variant="outline" className="gap-2" disabled={isGenerating}>
        {isGenerating ? (
            <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
            </>
        ) : (
            <>
                <Download className="h-4 w-4" /> Download Certificate
            </>
        )}
      </Button>
    </div>
  );
};

export default CertificateGenerator;
