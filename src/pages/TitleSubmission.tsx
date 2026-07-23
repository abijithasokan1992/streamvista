import { useNavigate } from "react-router-dom";
import { TitleEditor } from "../components/TitleEditor";
import { useAuth } from "../contexts/AuthContext";

export default function TitleSubmission() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Submit New Title</h1>
      <TitleEditor 
        draft={{ 
          id: "", 
          title: "", 
          creatorOwnerId: user?.uid || "",
          status: "draft"
        } as any}
        onClose={() => navigate("/creator")} 
        onSave={() => navigate("/creator")} 
      />
    </div>
  );
}
