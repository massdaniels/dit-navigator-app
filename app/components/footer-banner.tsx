import { MessageSquare, User } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Link, useNavigate } from "@remix-run/react";
import InstallButton from "./app-install-button";


export default function FooterBanner() {
  const navigate = useNavigate()

  const handleOnClickAdmin = () => {
    console.log("This is Admin Click")
    navigate("/auth/signin")
  }

  return (
    <Alert className="inset-x-0 bottom-0 rounded-b-none border-t border-blue-300 bg-blue-100 px-4 py-2 dark:border-blue-700 dark:bg-blue-900">
      <AlertDescription className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-100">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">
            DITNavigatorApp
            <span className="hidden md:inline"> | Map Viewer :</span>
          </span>
            <Link to='/auth/feedback'  className="text-xs ml-2  sm:hidden">
            <Button size="sm" variant="success" className="rounded-full">
              
              <MessageSquare size={18}/> 
            </Button> 
            </Link>
          <span className="hidden sm:inline">
            Find your destination within DIT main campus and feel free to provide your feedback
            <Link to='/auth/feedback'  className="text-xs ml-2">
            <Button size="sm" variant="success">
              
              <div className="hidden sm:block">Feedback</div> <MessageSquare size={18}/> 
            </Button> 
            </Link>
          </span>
          <InstallButton />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleOnClickAdmin}
            variant="outline"
            size="sm"
            className="h-6 border-0 bg-blue-200 px-2 text-xs text-blue-800 hover:bg-blue-300 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-700"
          >
            Admin <User size={14} />
          </Button>

        </div>
      </AlertDescription>
    </Alert>
  );
}
