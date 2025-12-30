import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCcw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  label?: string;
}

export function CameraCapture({ onCapture, label = "Capture Image" }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const retake = () => {
    setImage(null);
    onCapture(""); // Clear parent state
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-black/5 border-2 border-dashed border-border aspect-video flex items-center justify-center group">
        {image ? (
          <img src={image} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ facingMode: "environment" }}
          />
        )}
      </div>

      <div className="flex justify-center gap-4">
        {image ? (
          <Button onClick={retake} variant="outline" className="w-full">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Retake Photo
          </Button>
        ) : (
          <Button onClick={capture} className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            {label}
          </Button>
        )}
      </div>
    </div>
  );
}
