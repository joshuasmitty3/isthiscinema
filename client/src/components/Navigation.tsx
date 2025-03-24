import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
      <Link to="/" className="text-xl font-bold">
        is this cinema?
      </Link>
    </div>
  );
}