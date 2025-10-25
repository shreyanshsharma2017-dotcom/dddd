import { useParams } from "react-router-dom";
import Overview from "./overview.jsx";

export default function ProjectPage() {
  const { projectId } = useParams(); // Get projectId from URL
  

  return <Overview projectId={projectId} />;
  
}
