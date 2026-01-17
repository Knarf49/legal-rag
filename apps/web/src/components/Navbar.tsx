import { auth } from "@/lib/auth/auth-node";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import LogOutBtn from "./auth/LogOutBtn";
//TODO: copy research agent folder into proj and link
export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="shadow-lg h-16 fixed w-full bg-secondary z-50 flex items-center px-6 justify-between">
      {session ? (
        <Image
          src={user?.image as string}
          alt={user?.name?.charAt(0) as string}
          width={36}
          height={36}
          className="rounded-full"
        />
      ) : (
        <div className="rounded-full size-9 bg-primary/40 content-center text-center">
          <span>U</span>
        </div>
      )}

      {!session ? (
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      ) : (
        <LogOutBtn />
      )}
    </nav>
  );
}
